"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";

import { DateRangeFilter } from "@/components/DateRangeFilter";
import { useTransactions } from "./hooks/useTransactions";
import { TransactionsTable } from "./components/TransactionsTable";
import { PaginationFooter } from "./components/PaginationFooter";

export default function Page() {
  const [dateRange, setDateRange] = useState<DateRange>();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    setPage(1);
  };

  const { transactions, pagination, isLoading } = useTransactions({
    search: search || undefined,
    from: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
    to: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
    page,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-bold">Riwayat Transaksi</h1>
          <h1 className="text-md text-gray-500">Lacak dan kelola semua aktivitas keuangan Anda.</h1>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search size={18} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Cari deskripsi..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-9 rounded-lg border border-slate-200 pr-4 pl-10 text-sm text-slate-900 transition-colors outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
            />
          </div>
          <DateRangeFilter value={dateRange} onChange={handleDateRangeChange} />
        </div>
      </div>

      <TransactionsTable transactions={transactions} isLoading={isLoading} />
      <PaginationFooter
        pagination={pagination}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
      />
    </div>
  );
}
