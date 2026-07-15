"use client";

import { formatCurrency } from "@/lib/utils";
import type { CategoryBreakdownItem } from "../hooks/useCategoryBreakdown";
import { getCategoryIcon } from "./categoryIcons";

interface TopSpendingPanelProps {
  categories: CategoryBreakdownItem[];
  isLoading: boolean;
}

const TOP_N = 3;

export function TopSpendingPanel({ categories, isLoading }: TopSpendingPanelProps) {
  const topCategories = categories.slice(0, TOP_N);

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-bold text-slate-900">Top Pengeluaran</h2>

      {isLoading ? (
        <p className="py-8 text-center text-slate-400">Memuat data...</p>
      ) : topCategories.length === 0 ? (
        <p className="py-8 text-center text-slate-400">Belum ada pengeluaran pada periode ini.</p>
      ) : (
        <div className="space-y-6">
          {topCategories.map((category) => {
            const Icon = getCategoryIcon(category.categoryName);
            return (
              <div key={category.categoryId}>
                <div className="mb-2 flex items-end justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-slate-100 p-2 text-blue-600">
                      <Icon size={16} />
                    </div>
                    <div>
                      <span className="block text-slate-900">{category.categoryName}</span>
                      <span className="text-sm text-slate-500">
                        {category.transactionCount} Transaksi
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(category.amount)}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100">
                  <div
                    className="h-1.5 rounded-full bg-blue-600"
                    style={{ width: `${Math.min(100, Math.round(category.percentage))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="mb-1 text-sm font-semibold text-slate-900">AI Insight</h3>
        <p className="text-center text-slate-400">Coming Soon</p>
      </div>
    </div>
  );
}
