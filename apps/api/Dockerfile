FROM node:24-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN npm ci

FROM base AS dev

COPY . .

RUN npx prisma generate

CMD ["npm", "run", "dev"]

FROM base AS builder

COPY . .

RUN npx prisma generate
RUN npm run build

FROM node:24-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/package*.json ./

EXPOSE 3100

CMD ["node", "dist/index.js"]
