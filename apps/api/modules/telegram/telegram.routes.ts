import { Router } from "express";
import rateLimit from "express-rate-limit";
import { telegramController } from "./telegram.controller.js";
import { verifyTelegramSecret } from "../../middlewares/telegramSecret.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { TelegramUpdateSchema } from "./telegram.schema.js";

const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

router.post(
  "/webhook",
  webhookLimiter,
  verifyTelegramSecret,
  validate(TelegramUpdateSchema),
  telegramController.webhook
);

export default router;
