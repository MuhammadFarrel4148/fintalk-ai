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

  groupExpenseByCategory(userId: string, from: Date, to: Date) {
    return prisma.transaction.groupBy({
      by: ["categoryId", "type"],
      where: { userId, type: "expense", transactionDate: { gte: from, lte: to } },
      _sum: { amount: true },
      _count: { _all: true },
    });
  },

  groupIncomeByCategory(userId: string, from: Date, to: Date) {
    return prisma.transaction.groupBy({
      by: ["categoryId", "type"],
      where: { userId, type: "income", transactionDate: { gte: from, lte: to } },
      _sum: { amount: true },
      _count: { _all: true },
    });
  },

  findCategoriesByIds(ids: string[]) {
    return prisma.category.findMany({ where: { id: { in: ids } } });
  },

  findForMonthlySummary(userId: string, from: Date, to: Date) {
    return prisma.transaction.findMany({
      where: { userId, transactionDate: { gte: from, lte: to } },
      select: { amount: true, type: true, transactionDate: true },
    });
  },
};
