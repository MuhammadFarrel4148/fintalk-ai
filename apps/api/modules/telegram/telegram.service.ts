import { telegramRepository } from "./telegram.repository.js";
import { authRepository } from "../auth/auth.repository.js";
import { aiParsingService } from "../ai-parsing/ai-parsing.service.js";
import { transactionsService } from "../transactions/transactions.service.js";
import { telegramClient } from "../../lib/telegram.js";
import { TelegramUpdate } from "./telegram.schema.js";
import { Prisma } from "../../generated/prisma/client.js";

const CLARIFICATION_TTL_MS = 5 * 60 * 1000;
const MAX_CLARIFICATION_ATTEMPTS = 3;

interface PendingClarification {
  combinedText: string;
  attempts: number;
  expiresAt: number;
}

const pendingClarifications = new Map<string, PendingClarification>();

export const telegramService = {
  async handleUpdate(update: TelegramUpdate): Promise<void> {
    const message = update.message;
    if (!message?.text) return;

    const telegramId = String(message.from.id);
    const chatId = message.chat.id;
    const text = message.text.trim();
    if (!text) return;

    const user = await telegramRepository.findUserByTelegramId(telegramId);

    if (!user) {
      await handleUnlinked(telegramId, chatId, text);
      return;
    }

    await handleLinkedMessage(user.id, telegramId, chatId, text);
  },

  // exposed for tests to reset in-memory conversation state between cases
  _clearPendingClarifications(): void {
    pendingClarifications.clear();
  },
};

async function handleUnlinked(telegramId: string, chatId: number, text: string): Promise<void> {
  if (!text.startsWith("/login ")) {
    await telegramClient.sendMessage(
      chatId,
      "Akun Telegram kamu belum terhubung. Kirim /login <email> <password> untuk menghubungkan akun."
    );
    return;
  }

  const [, email, password] = text.split(" ");
  if (!email || !password) {
    await telegramClient.sendMessage(chatId, "Format salah. Gunakan: /login <email> <password>");
    return;
  }

  const user = await authRepository.findUserByEmail(email);
  if (!user || user.password !== password) {
    await telegramClient.sendMessage(chatId, "Email atau password salah.");
    return;
  }

  try {
    await telegramRepository.setTelegramId(user.id, telegramId);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      await telegramClient.sendMessage(chatId, "Akun Telegram ini sudah terhubung ke user lain.");
      return;
    }
    throw err;
  }

  await telegramClient.sendMessage(chatId, "Berhasil! Akun Telegram kamu sudah terhubung.");
}

async function handleLinkedMessage(
  userId: string,
  telegramId: string,
  chatId: number,
  text: string
): Promise<void> {
  const pending = pendingClarifications.get(telegramId);
  const isPendingValid = Boolean(pending && pending.expiresAt > Date.now());
  const combinedText = isPendingValid ? `${pending!.combinedText}. ${text}` : text;

  const result = await aiParsingService.parseTransactionText(combinedText);

  if (!result.needsClarification) {
    pendingClarifications.delete(telegramId);

    const saved = await transactionsService.create({
      userId,
      categoryId: result.transaction.categoryId,
      amount: result.transaction.amount,
      type: result.transaction.type,
      description: result.transaction.description,
      rawInput: combinedText,
      source: "telegram",
      transactionDate: new Date(),
    });

    const sign = result.transaction.type === "expense" ? "-" : "+";
    await telegramClient.sendMessage(
      chatId,
      `Tercatat: ${sign}${formatRupiah(saved.amount)} untuk ${result.transaction.categoryName} (${result.transaction.description}).`
    );
    return;
  }

  const attempts = (isPendingValid ? pending!.attempts : 0) + 1;

  if (attempts > MAX_CLARIFICATION_ATTEMPTS) {
    pendingClarifications.delete(telegramId);
    await telegramClient.sendMessage(
      chatId,
      "Maaf, aku masih belum paham. Coba kirim ulang transaksinya dengan lebih lengkap ya."
    );
    return;
  }

  pendingClarifications.set(telegramId, {
    combinedText,
    attempts,
    expiresAt: Date.now() + CLARIFICATION_TTL_MS,
  });

  await telegramClient.sendMessage(chatId, result.question);
}

function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}
