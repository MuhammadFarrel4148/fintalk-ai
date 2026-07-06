"use client";
import { useQuery } from "@tanstack/react-query";

interface ExpenseTotal {
  total: number;
}

async function fetchExpense(): Promise<ExpenseTotal | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transactions/expense`, {
    credentials: "include",
  });
  if (!res.ok) return null;
  const body = await res.json();
  return body?.data ?? null;
}

export function useExpense() {
  const { data, isLoading } = useQuery({
    queryKey: ["transactions", "expense"],
    queryFn: fetchExpense,
    retry: false,
  });

  return { expense: data?.total ?? 0, isLoading };
}
