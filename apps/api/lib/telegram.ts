import "dotenv/config";

const TELEGRAM_API_BASE = "https://api.telegram.org";

function apiUrl(method: string): string {
  return `${TELEGRAM_API_BASE}/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`;
}

async function callTelegramApi(method: string, body: Record<string, unknown>): Promise<void> {
  const res = await fetch(apiUrl(method), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Telegram ${method} failed: ${res.status} ${await res.text()}`);
  }
}

export const telegramClient = {
  sendMessage(chatId: number | string, text: string): Promise<void> {
    return callTelegramApi("sendMessage", { chat_id: chatId, text });
  },

  setWebhook(url: string, secretToken: string): Promise<void> {
    return callTelegramApi("setWebhook", { url, secret_token: secretToken });
  },
};
