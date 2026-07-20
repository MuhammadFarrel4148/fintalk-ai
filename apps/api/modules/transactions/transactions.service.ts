import { transactionsRepository } from "./transactions.repository.js";
import {
  ListTransactionsQuery,
  CategoryBreakdownQuery,
  MonthlySummaryQuery,
} from "./transactions.schema.js";
import { getLastNMonthsRange, getCurrentMonthRange } from "../../lib/dateRange.js";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

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

  async getCategoryBreakdown(userId: string, query: CategoryBreakdownQuery) {
    const { from, to } =
      query.from && query.to
        ? {
            from: new Date(`${query.from}T00:00:00.000Z`),
            to: new Date(`${query.to}T23:59:59.999Z`),
          }
        : getCurrentMonthRange();

    const groups = await transactionsRepository.groupExpenseByCategory(userId, from, to);
    const categoryIds = groups.map((g) => g.categoryId);
    const categories = await transactionsRepository.findCategoriesByIds(categoryIds);
    const categoryNameById = new Map(categories.map((c) => [c.id, c.name]));

    const totalExpense = groups.reduce((sum, g) => sum + Number(g._sum.amount ?? 0), 0);

    const breakdown = groups
      .map((g) => {
        const amount = Number(g._sum.amount ?? 0);
        return {
          categoryId: g.categoryId,
          categoryName: categoryNameById.get(g.categoryId) ?? "Lain-lain",
          amount,
          transactionCount: g._count._all,
          percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
        };
      })
      .sort((a, b) => b.amount - a.amount);

    return { totalExpense, categories: breakdown };
  },

  async getMonthlySummary(userId: string, query: MonthlySummaryQuery) {
    const { months } = query;
    const { from, to } = getLastNMonthsRange(months);
    const rows = await transactionsRepository.findForMonthlySummary(userId, from, to);

    const now = new Date();
    const buckets = new Map<string, { label: string; income: number; expense: number }>();
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
      buckets.set(key, { label: MONTH_LABELS[date.getUTCMonth()], income: 0, expense: 0 });
    }

    for (const row of rows) {
      const rowDate = new Date(row.transactionDate);
      const key = `${rowDate.getUTCFullYear()}-${String(rowDate.getUTCMonth() + 1).padStart(2, "0")}`;
      const bucket = buckets.get(key);
      if (!bucket) continue;
      if (row.type === "income") {
        bucket.income += Number(row.amount);
      } else {
        bucket.expense += Number(row.amount);
      }
    }

    return {
      months: Array.from(buckets.entries()).map(([month, bucket]) => ({
        month,
        label: bucket.label,
        income: bucket.income,
        expense: bucket.expense,
      })),
    };
  },

  async getCsv(userId: string, query: CategoryBreakdownQuery) {
    const { from, to } =
      query.from && query.to
        ? {
            from: new Date(`${query.from}T00:00:00.000Z`),
            to: new Date(`${query.to}T23:59:59.999Z`),
          }
        : getCurrentMonthRange();

    const [groupIncome, groupExpense] = await Promise.all([
      transactionsRepository.groupIncomeByCategory(userId, from, to),
      transactionsRepository.groupExpenseByCategory(userId, from, to),
    ]);

    const groups = [...groupIncome, ...groupExpense];
    const categoryIds = groups.map((g) => g.categoryId);
    const categories = await transactionsRepository.findCategoriesByIds(categoryIds);
    const categoryNameById = new Map(categories.map((c) => [c.id, c.name]));

    const rows = groups.map((g) => {
      const categoryName = categoryNameById.get(g.categoryId) ?? "Lain-lain";
      return `${categoryName},${g.type},${Number(g._sum.amount ?? 0)},${g._count._all}`;
    });

    return ["Kategori,Jenis Transaksi,Total Transaksi,Jumlah Transaksi", ...rows].join("\n");
  },
};
