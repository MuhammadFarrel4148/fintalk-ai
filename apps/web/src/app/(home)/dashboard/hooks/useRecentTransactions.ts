"use client";
import { useQuery } from "@tanstack/react-query";

export interface RecentTransaction {
  id: string;
  date: string;
  description: string | null;
  category: { id: string; name: string };
  amount: number;
  type: "income" | "expense";
}

const RECENT_TRANSACTIONS_LIMIT = 5;

async function fetchRecentTransactions(): Promise<RecentTransaction[]> {
  const qs = new URLSearchParams({ page: "1", limit: String(RECENT_TRANSACTIONS_LIMIT) });
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transactions?${qs}`, {
    credentials: "include",
  });
  if (!res.ok) return [];
  const body = await res.json();
  return body?.data?.transactions ?? [];
}

export function useRecentTransactions() {
  const { data, isLoading } = useQuery({
    queryKey: ["transactions", "recent"],
    queryFn: fetchRecentTransactions,
    retry: false,
  });

  return { transactions: data ?? [], isLoading };
}
