import { Request, Response } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { telegramService } from "./telegram.service.js";
import { telegramClient } from "../../lib/telegram.js";
import { TelegramUpdate } from "./telegram.schema.js";

export const telegramController = {
  // Telegram retries the webhook if we don't respond 200 quickly, so failures are
  // handled here (logged + best-effort user notification) instead of bubbling to
  // the global error middleware.
  webhook: asyncHandler(async (req: Request, res: Response) => {
    const update = req.body as TelegramUpdate;

    try {
      await telegramService.handleUpdate(update);
    } catch (err) {
      console.error("Telegram webhook error:", err);
      const chatId = update.message?.chat.id;
      if (chatId) {
        await telegramClient
          .sendMessage(chatId, "Maaf, terjadi kesalahan. Coba lagi nanti.")
          .catch(() => {});
      }
    }

    res.status(200).json({ success: true, data: null });
  }),
};
