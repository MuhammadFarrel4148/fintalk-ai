import { Request, Response, NextFunction } from "express";

export function verifyTelegramSecret(req: Request, res: Response, next: NextFunction) {
  const secret = req.header("X-Telegram-Bot-Api-Secret-Token");

  if (!secret || secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return res
      .status(401)
      .json({ success: false, error: { code: "UNAUTHORIZED", message: "Invalid webhook secret" } });
  }

  next();
}
