import { prisma } from "../../lib/prisma.js";

export const transactionsRepository = {
  sumByType(userId: string, type: "income" | "expense") {
    return prisma.transaction.aggregate({
      where: { userId, type },
      _sum: { amount: true },
    });
  },
};
