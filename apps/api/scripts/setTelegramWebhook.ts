import "dotenv/config";
import { telegramClient } from "../lib/telegram.js";

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.error("Usage: npm run telegram:set-webhook -- <public-webhook-url>");
    process.exit(1);
  }

  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret) {
    console.error("TELEGRAM_WEBHOOK_SECRET is not set in .env");
    process.exit(1);
  }

  await telegramClient.setWebhook(url, secret);
  console.log(`Webhook registered: ${url}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
