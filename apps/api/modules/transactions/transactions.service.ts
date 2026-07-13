import { transactionsRepository } from "./transactions.repository.js";
import { ListTransactionsQuery } from "./transactions.schema.js";

export const transactionsService = {
  async getIncomeTotal(userId: string): Promise<{ total: number }> {
    const result = await transactionsRepository.sumByType(userId, "income");
    return { total: Number(result._sum.amount ?? 0) };
  },

  async getExpenseTotal(userId: string): Promise<{ total: number }> {
    const result = await transactionsRepository.sumByType(userId, "expense");
    return { total: Number(result._sum.amount ?? 0) };
  },

  async list(userId: string, query: ListTransactionsQuery) {
    const { search, from, to, page, limit } = query;
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      transactionsRepository.findMany(userId, { search, from, to, skip, take: limit }),
      transactionsRepository.count(userId, { search, from, to }),
    ]);

    return {
      transactions: rows.map((t) => ({
        id: t.id,
        date: t.transactionDate,
        description: t.description,
        category: { id: t.category.id, name: t.category.name },
        amount: Number(t.amount),
        type: t.type,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  },
};
