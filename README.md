# FinTalk.ai

AI-powered personal finance tracker — log expenses via natural-language Telegram messages, see them show up on a real-time dashboard, and ask an AI advisor about your own spending.

## The Problem

Mobile banking apps only capture transactions that pass through that specific account — cash spending, e-wallet transfers, and cross-platform transactions go untracked. There's no single, real-time picture of actual income, expenses, and balance.

## What It Does

Instead of filling out a form, you send a message to a Telegram bot:

> "beli kopi 20rb"

Gemini parses it into a structured transaction (amount, category, type). If the message is ambiguous, the bot asks a clarifying question instead of guessing and saving bad data. The transaction then appears on the web dashboard instantly via WebSocket — no refresh needed.

## Features

- **Chat-based transaction logging** — natural-language Telegram messages parsed into structured transactions by Gemini; handles common Indonesian amount formats (`50rb`, `50k`, `Rp50.000`)
- **Real-time dashboard** — balance summary, filterable transaction history, category breakdown pie chart, pushed live via Socket.io the moment a Telegram message lands
- **AI financial advisor chat** — ask questions about your own spending; responses are historical-data observations only (e.g. "your coffee spend rose 30% this month"), never prescriptive financial advice — scoped to the last 3 months of transactions, session-only and never persisted to the database
- **Verified Telegram linking** — accounts are linked via `/login <email> <password>` inside the bot; messages from unlinked Telegram accounts are rejected before any AI parsing happens. You can use the seeded test account: `/login testproject@gmail.com testproject` (only exists after running `make seed`, see Getting Started)

## Tech Stack

| Layer    | Stack                                                                                          |
| -------- | ---------------------------------------------------------------------------------------------- |
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind, shadcn/ui, ApexCharts, TanStack Query |
| Backend  | Express.js 5, TypeScript                                                                       |
| Database | PostgreSQL + Prisma ORM                                                                        |
| AI       | Gemini API — transaction parsing & advisor chat                                                |
| Realtime | Socket.io                                                                                      |
| Chatbot  | Telegram Bot API                                                                               |
| Infra    | Docker Compose (dev + prod), Nginx reverse proxy, GitHub Actions CI                            |

## Architecture

```
Telegram message
      │
      ▼
Webhook (Express) ──▶ Gemini API (parse to structured JSON)
      │                        │
      │                        ▼
      │                 ambiguous? ──▶ ask for clarification, wait for reply
      │                        │
      ▼                        ▼
PostgreSQL  ◀────────── save structured transaction
      │
      ▼
Socket.io push ──▶ Next.js dashboard (auto-updates, no refresh)
```

The backend follows a 3-layer separation per domain (`controller → service → repository`), with each domain — `auth`, `telegram`, `ai-parsing`, `transactions`, `advisor` — isolated under `apps/api/modules/<domain>/`.

## Getting Started

Prerequisites: Docker, Node.js (for one-off scripts run outside containers)

```bash
git clone <repo-url>
cd fintalk-ai
cp .env.example .env   # see Environment Variables below for where to get each value
make up                # frontend :3000, backend :3100, postgres :5433
make seed               # seed default categories + the dev user
```

Frontend: http://localhost:3000 — Backend: http://localhost:3100

### Environment Variables

| Variable                  | Used for                                                       | Where to get it                                                                                                             |
| ------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`            | Postgres connection string                                     | Defaults to the `db` service in `docker-compose.yml` (`postgres`/`password`, db `fintalk`) — no signup needed for local dev |
| `JWT_SECRET`              | Signs session cookies                                          | Any random string, e.g. `openssl rand -hex 32`                                                                              |
| `FRONTEND_URL`            | CORS allow-list                                                | `http://localhost:3000` for local dev                                                                                       |
| `GEMINI_API_KEY`          | AI transaction parsing & advisor chat                          | Free key from [Google AI Studio](https://aistudio.google.com/apikey)                                                        |
| `TELEGRAM_BOT_TOKEN`      | Authenticates the bot with Telegram                            | Create a bot via [`@BotFather`](https://t.me/BotFather) on Telegram — instant, no approval process                          |
| `TELEGRAM_WEBHOOK_SECRET` | Verifies incoming webhook requests are genuinely from Telegram | Any random string you choose                                                                                                |

Other commands: `make test`, `make lint`, `make logs s=backend`, `make down` — see `Makefile` for the full list.

`make up` builds the images automatically on first run since none exist yet. If you later change a `Dockerfile`, `package.json`, or a lockfile, use `make up-build` instead — plain `make up` reuses the cached image and won't pick up those changes.

To wire up the Telegram bot locally, expose the backend publicly (e.g. `ngrok http 3100`), then register the webhook:

```bash
cd apps/api && npm run telegram:set-webhook -- https://<public-url>/api/telegram/webhook
```

## Project Structure

```
fintalk-ai/
├── apps/
│   ├── web/                  # Next.js frontend
│   │   └── src/
│   │       ├── app/          # routes: dashboard, transactions, advisor, analytics, login
│   │       └── hooks/
│   └── api/                  # Express backend
│       ├── modules/          # domain-driven: auth, telegram, ai-parsing, transactions, advisor
│       │   └── <domain>/     # controller.ts, service.ts, repository.ts, routes.ts, schema.ts
│       ├── middlewares/
│       ├── lib/
│       └── prisma/
├── nginx/                    # reverse proxy config for production
├── docker-compose.yml        # local dev
├── docker-compose.prod.yml   # production deploy
└── Makefile                  # make up / test / lint / seed / deploy
```
