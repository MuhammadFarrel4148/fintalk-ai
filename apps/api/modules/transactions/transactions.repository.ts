import { prisma } from "../../lib/prisma.js";
import { Prisma } from "../../generated/prisma/client.js";

interface ListFilters {
  search?: string;
  from?: string;
  to?: string;
}

function buildWhere(userId: string, filters: ListFilters): Prisma.TransactionWhereInput {
  const where: Prisma.TransactionWhereInput = { userId };

  if (filters.search) {
    where.description = { contains: filters.search, mode: "insensitive" };
  }

  if (filters.from || filters.to) {
    where.transactionDate = {
      ...(filters.from ? { gte: new Date(`${filters.from}T00:00:00.000Z`) } : {}),
      ...(filters.to ? { lte: new Date(`${filters.to}T23:59:59.999Z`) } : {}),
    };
  }

  return where;
}

export const transactionsRepository = {
  sumByType(userId: string, type: "income" | "expense") {
    return prisma.transaction.aggregate({
      where: { userId, type },
      _sum: { amount: true },
    });
  },

  findMany(userId: string, filters: ListFilters & { skip: number; take: number }) {
    return prisma.transaction.findMany({
      where: buildWhere(userId, filters),
      include: { category: true },
      orderBy: { transactionDate: "desc" },
      skip: filters.skip,
      take: filters.take,
    });
  },

  count(userId: string, filters: ListFilters) {
    return prisma.transaction.count({ where: buildWhere(userId, filters) });
  },
};
