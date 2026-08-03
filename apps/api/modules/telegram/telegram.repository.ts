import { prisma } from "../../lib/prisma.js";

export const telegramRepository = {
  findUserByTelegramId(telegramId: string) {
    return prisma.user.findUnique({ where: { telegramId } });
  },

  setTelegramId(userId: string, telegramId: string) {
    return prisma.user.update({ where: { id: userId }, data: { telegramId } });
  },
};
