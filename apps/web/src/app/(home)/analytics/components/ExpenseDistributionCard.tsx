"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

import { formatCurrency } from "@/lib/utils";
import type { CategoryBreakdownItem } from "../hooks/useCategoryBreakdown";
import { buildCategoryChartItems } from "./categoryColors";

// react-apexcharts touches `window` at import time, so it can only be loaded client-side.
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface ExpenseDistributionCardProps {
  totalExpense: number;
  categories: CategoryBreakdownItem[];
  isLoading: boolean;
}

export function ExpenseDistributionCard({
  totalExpense,
  categories,
  isLoading,
}: ExpenseDistributionCardProps) {
  const items = buildCategoryChartItems(categories);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-bold text-slate-900">Distribusi Pengeluaran</h2>

      {isLoading ? (
        <p className="py-12 text-center text-slate-400">Memuat data...</p>
      ) : items.length === 0 ? (
        <p className="py-12 text-center text-slate-400">
          Belum ada transaksi pengeluaran pada periode ini.
        </p>
      ) : (
        <div className="flex flex-col items-center gap-8 lg:flex-row">
          <div className="relative flex w-full justify-center lg:w-1/2">
            <Chart
              type="donut"
              width={280}
              height={280}
              series={items.map((c) => c.amount)}
              options={buildDonutOptions(
                items.map((c) => c.categoryName),
                items.map((c) => c.color)
              )}
            />
            <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <span className="block text-sm text-slate-500">Total Pengeluaran</span>
              <span className="mt-1 block text-xl font-bold text-slate-900">
                {formatCurrency(totalExpense)}
              </span>
            </div>
          </div>

          <div className="w-full space-y-1 lg:w-1/2">
            {items.map((item) => (
              <div
                key={item.categoryId}
                className="flex items-center justify-between rounded-lg p-3 hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-slate-700">{item.categoryName}</span>
                </div>
                <span className="font-bold text-slate-900">{Math.round(item.percentage)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function buildDonutOptions(labels: string[], colors: string[]): ApexOptions {
  return {
    chart: { toolbar: { show: false } },
    labels,
    colors,
    dataLabels: { enabled: false },
    stroke: { width: 2, colors: ["#ffffff"] },
    legend: { show: false },
    tooltip: {
      y: {
        formatter: (value: number) => formatCurrency(value),
      },
    },
    plotOptions: {
      pie: {
        donut: { size: "68%" },
      },
    },
  };
}
