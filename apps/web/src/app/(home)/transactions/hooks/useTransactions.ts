"use client";
import { useQuery } from "@tanstack/react-query";

interface TransactionListItem {
  id: string;
  date: string;
  description: string | null;
  category: { id: string; name: string };
  amount: number;
  type: "income" | "expense";
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface TransactionsResponse {
  transactions: TransactionListItem[];
  pagination: Pagination;
}

interface UseTransactionsParams {
  search?: string;
  from?: string;
  to?: string;
  page: number;
}

async function fetchTransactions(
  params: UseTransactionsParams
): Promise<TransactionsResponse | null> {
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.from) qs.set("from", params.from);
  if (params.to) qs.set("to", params.to);
  qs.set("page", String(params.page));

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transactions?${qs}`, {
    credentials: "include",
  });
  if (!res.ok) return null;
  const body = await res.json();
  return body?.data ?? null;
}

// Unlike useIncome/useExpense (no args, static queryKey), these params change
// over time, so the queryKey must include them or react-query would keep
// serving a stale cached page/filter combination.
export function useTransactions(params: UseTransactionsParams) {
  const { data, isLoading } = useQuery({
    queryKey: ["transactions", "list", params],
    queryFn: () => fetchTransactions(params),
    retry: false,
  });

  return {
    transactions: data?.transactions ?? [],
    pagination: data?.pagination ?? { page: params.page, limit: 10, total: 0, totalPages: 1 },
    isLoading,
  };
}
