import { describe, it, expect, vi, beforeEach } from "vitest";
import { telegramService } from "../telegram.service";
import { telegramRepository } from "../telegram.repository";
import { authRepository } from "../../auth/auth.repository";
import { aiParsingService } from "../../ai-parsing/ai-parsing.service";
import { transactionsService } from "../../transactions/transactions.service";
import { telegramClient } from "../../../lib/telegram";
import { Prisma } from "../../../generated/prisma/client";

vi.mock("../telegram.repository", () => ({
  telegramRepository: { findUserByTelegramId: vi.fn(), setTelegramId: vi.fn() },
}));
vi.mock("../../auth/auth.repository", () => ({
  authRepository: { findUserByEmail: vi.fn() },
}));
vi.mock("../../ai-parsing/ai-parsing.service", () => ({
  aiParsingService: { parseTransactionText: vi.fn() },
}));
vi.mock("../../transactions/transactions.service", () => ({
  transactionsService: { create: vi.fn() },
}));
vi.mock("../../../lib/telegram", () => ({
  telegramClient: { sendMessage: vi.fn(), setWebhook: vi.fn() },
}));

function messageUpdate(fromId: number, chatId: number, text: string) {
  return { message: { message_id: 1, from: { id: fromId }, chat: { id: chatId }, text } };
}

describe("telegramService.handleUpdate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    telegramService._clearPendingClarifications();
  });

  describe("unlinked telegram_id", () => {
    it("asks the user to link their account for a non /login message", async () => {
      vi.mocked(telegramRepository.findUserByTelegramId).mockResolvedValue(null);

      await telegramService.handleUpdate(messageUpdate(111, 999, "halo"));

      expect(telegramClient.sendMessage).toHaveBeenCalledWith(
        999,
        expect.stringContaining("/login")
      );
      expect(authRepository.findUserByEmail).not.toHaveBeenCalled();
    });

    it("links the account on a valid /login command", async () => {
      vi.mocked(telegramRepository.findUserByTelegramId).mockResolvedValue(null);
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue({
        id: "user-1",
        email: "a@b.com",
        password: "secret",
      } as never);

      await telegramService.handleUpdate(messageUpdate(111, 999, "/login a@b.com secret"));

      expect(telegramRepository.setTelegramId).toHaveBeenCalledWith("user-1", "111");
      expect(telegramClient.sendMessage).toHaveBeenCalledWith(
        999,
        expect.stringContaining("Berhasil")
      );
    });

    it("rejects /login with the wrong password without linking", async () => {
      vi.mocked(telegramRepository.findUserByTelegramId).mockResolvedValue(null);
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue({
        id: "user-1",
        email: "a@b.com",
        password: "secret",
      } as never);

      await telegramService.handleUpdate(messageUpdate(111, 999, "/login a@b.com wrong"));

      expect(telegramRepository.setTelegramId).not.toHaveBeenCalled();
      expect(telegramClient.sendMessage).toHaveBeenCalledWith(
        999,
        expect.stringContaining("salah")
      );
    });

    it("reports a friendly error when the telegram_id is already linked to another user", async () => {
      vi.mocked(telegramRepository.findUserByTelegramId).mockResolvedValue(null);
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue({
        id: "user-1",
        email: "a@b.com",
        password: "secret",
      } as never);
      vi.mocked(telegramRepository.setTelegramId).mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
          code: "P2002",
          clientVersion: "test",
        })
      );

      await telegramService.handleUpdate(messageUpdate(111, 999, "/login a@b.com secret"));

      expect(telegramClient.sendMessage).toHaveBeenCalledWith(
        999,
        expect.stringContaining("sudah terhubung")
      );
    });
  });

  describe("linked telegram_id", () => {
    it("saves a transaction and confirms when parsing resolves immediately", async () => {
      vi.mocked(telegramRepository.findUserByTelegramId).mockResolvedValue({
        id: "user-1",
      } as never);
      vi.mocked(aiParsingService.parseTransactionText).mockResolvedValue({
        needsClarification: false,
        transaction: {
          amount: 50000,
          type: "expense",
          categoryId: "cat-1",
          categoryName: "Transportasi",
          description: "beli bensin",
        },
      });
      vi.mocked(transactionsService.create).mockResolvedValue({
        id: "tx-1",
        amount: 50000,
      } as never);

      await telegramService.handleUpdate(messageUpdate(111, 999, "beli bensin 50rb"));

      expect(transactionsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-1",
          categoryId: "cat-1",
          amount: 50000,
          type: "expense",
          source: "telegram",
          rawInput: "beli bensin 50rb",
        })
      );
      expect(telegramClient.sendMessage).toHaveBeenCalledWith(
        999,
        expect.stringContaining("Transportasi")
      );
    });

    it("asks a clarification question and does not save a transaction when ambiguous", async () => {
      vi.mocked(telegramRepository.findUserByTelegramId).mockResolvedValue({
        id: "user-1",
      } as never);
      vi.mocked(aiParsingService.parseTransactionText).mockResolvedValue({
        needsClarification: true,
        question: "Ini buat bayar apa ya?",
        partial: {} as never,
      });

      await telegramService.handleUpdate(messageUpdate(111, 999, "bayar 50rb"));

      expect(transactionsService.create).not.toHaveBeenCalled();
      expect(telegramClient.sendMessage).toHaveBeenCalledWith(999, "Ini buat bayar apa ya?");
    });

    it("merges a clarification answer with the original message on the next turn", async () => {
      vi.mocked(telegramRepository.findUserByTelegramId).mockResolvedValue({
        id: "user-1",
      } as never);
      vi.mocked(aiParsingService.parseTransactionText).mockResolvedValueOnce({
        needsClarification: true,
        question: "Ini buat bayar apa ya?",
        partial: {} as never,
      });

      await telegramService.handleUpdate(messageUpdate(111, 999, "bayar 50rb"));

      vi.mocked(aiParsingService.parseTransactionText).mockResolvedValueOnce({
        needsClarification: false,
        transaction: {
          amount: 50000,
          type: "expense",
          categoryId: "cat-1",
          categoryName: "Tagihan & Utilitas",
          description: "bayar listrik",
        },
      });
      vi.mocked(transactionsService.create).mockResolvedValue({
        id: "tx-1",
        amount: 50000,
      } as never);

      await telegramService.handleUpdate(messageUpdate(111, 999, "listrik"));

      expect(aiParsingService.parseTransactionText).toHaveBeenLastCalledWith("bayar 50rb. listrik");
      expect(transactionsService.create).toHaveBeenCalledWith(
        expect.objectContaining({ rawInput: "bayar 50rb. listrik" })
      );
    });

    it("gives up after exceeding the max clarification attempts", async () => {
      vi.mocked(telegramRepository.findUserByTelegramId).mockResolvedValue({
        id: "user-1",
      } as never);
      vi.mocked(aiParsingService.parseTransactionText).mockResolvedValue({
        needsClarification: true,
        question: "Masih kurang jelas, kategori apa?",
        partial: {} as never,
      });

      await telegramService.handleUpdate(messageUpdate(111, 999, "bayar 50rb"));
      await telegramService.handleUpdate(messageUpdate(111, 999, "entah"));
      await telegramService.handleUpdate(messageUpdate(111, 999, "entah lagi"));
      await telegramService.handleUpdate(messageUpdate(111, 999, "masih ga jelas"));

      expect(telegramClient.sendMessage).toHaveBeenLastCalledWith(
        999,
        expect.stringContaining("Coba kirim ulang")
      );
      expect(transactionsService.create).not.toHaveBeenCalled();
    });
  });
});
