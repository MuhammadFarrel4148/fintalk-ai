import { transactionsRepository } from "./transactions.repository.js";

export const transactionsService = {
  async getIncomeTotal(userId: string): Promise<{ total: number }> {
    const result = await transactionsRepository.sumByType(userId, "income");
    return { total: Number(result._sum.amount ?? 0) };
  },

  async getExpenseTotal(userId: string): Promise<{ total: number }> {
    const result = await transactionsRepository.sumByType(userId, "expense");
    return { total: Number(result._sum.amount ?? 0) };
  },
};
