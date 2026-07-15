"use client";

import { useState } from "react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";

import { DateRangeFilter } from "@/components/DateRangeFilter";
import { useCategoryBreakdown } from "./hooks/useCategoryBreakdown";
import { useMonthlySummary } from "./hooks/useMonthlySummary";
import { ExpenseDistributionCard } from "./components/ExpenseDistributionCard";
import { MonthlyBarChartCard } from "./components/MonthlyBarChartCard";
import { TopSpendingPanel } from "./components/TopSpendingPanel";
import { ExportCsv } from "./components/ExportCsv";

export default function Page() {
  const [dateRange, setDateRange] = useState<DateRange>();

  const from = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined;
  const to = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined;

  const {
    totalExpense,
    categories,
    isLoading: isBreakdownLoading,
  } = useCategoryBreakdown({
    from,
    to,
  });
  const { months, isLoading: isSummaryLoading } = useMonthlySummary();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-bold">Analitik Keuangan</h1>
          <h1 className="text-md text-gray-500">
            Tinjauan mendalam atas pengeluaran dan pemasukan Anda.
          </h1>
        </div>
        <div className="flex gap-3">
          <DateRangeFilter value={dateRange} onChange={setDateRange} placeholder="Bulan ini" />
          <ExportCsv from={from} to={to} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-8">
          <ExpenseDistributionCard
            totalExpense={totalExpense}
            categories={categories}
            isLoading={isBreakdownLoading}
          />
          <MonthlyBarChartCard months={months} isLoading={isSummaryLoading} />
        </div>

        <div className="lg:col-span-4">
          <TopSpendingPanel categories={categories} isLoading={isBreakdownLoading} />
        </div>
      </div>
    </div>
  );
}
