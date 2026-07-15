"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

import { formatCurrency } from "@/lib/utils";
import type { MonthlySummaryItem } from "../hooks/useMonthlySummary";

// react-apexcharts touches `window` at import time, so it can only be loaded client-side.
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

// Same semantic colors as TotalPemasukanCard/TotalPengeluaranCard on the dashboard.
const INCOME_COLOR = "#059669"; // emerald-600
const EXPENSE_COLOR = "#dc2626"; // red-600

interface MonthlyBarChartCardProps {
  months: MonthlySummaryItem[];
  isLoading: boolean;
}

export function MonthlyBarChartCard({ months, isLoading }: MonthlyBarChartCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-bold text-slate-900">Pemasukan vs Pengeluaran (6 Bulan)</h2>

      {isLoading ? (
        <p className="py-12 text-center text-slate-400">Memuat data...</p>
      ) : (
        <Chart
          type="bar"
          height={260}
          series={[
            { name: "Pemasukan", data: months.map((m) => m.income) },
            { name: "Pengeluaran", data: months.map((m) => m.expense) },
          ]}
          options={buildBarOptions(months.map((m) => m.label))}
        />
      )}
    </div>
  );
}

function buildBarOptions(categories: string[]): ApexOptions {
  return {
    chart: { toolbar: { show: false } },
    xaxis: { categories },
    colors: [INCOME_COLOR, EXPENSE_COLOR],
    plotOptions: {
      bar: { columnWidth: "55%", borderRadius: 4 },
    },
    dataLabels: { enabled: false },
    legend: { position: "top", horizontalAlign: "right" },
    yaxis: {
      labels: {
        formatter: (value: number) => formatCurrency(value),
      },
    },
    tooltip: {
      y: {
        formatter: (value: number) => formatCurrency(value),
      },
    },
  };
}
