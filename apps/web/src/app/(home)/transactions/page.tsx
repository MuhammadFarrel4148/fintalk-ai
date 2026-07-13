"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
          <div className="flex items-center gap-1">
            <Popover>
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    size="lg"
                    data-empty={!dateRange?.from}
                    className="justify-start border-slate-200 bg-white text-left font-normal text-slate-700 hover:bg-slate-50 data-[empty=true]:text-slate-500"
                  />
                }
              >
                <CalendarIcon className="text-slate-500" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <span>
                      {format(dateRange.from, "d MMM yyyy", { locale: id })}
                      {" - "}
                      {format(dateRange.to, "d MMM yyyy", { locale: id })}
                    </span>
                  ) : (
                    format(dateRange.from, "d MMM yyyy", { locale: id })
                  )
                ) : (
                  <span>Pilih tanggal</span>
                )}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={handleDateRangeChange}
                  locale={id}
                />
              </PopoverContent>
            </Popover>
            {dateRange?.from && (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Hapus filter tanggal"
                onClick={() => handleDateRangeChange(undefined)}
                className="text-slate-500 hover:text-slate-700"
              >
                <X size={14} />
              </Button>
            )}
          </div>
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
