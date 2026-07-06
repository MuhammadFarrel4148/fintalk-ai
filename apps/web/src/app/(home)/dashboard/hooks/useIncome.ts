"use client";
import { useQuery } from "@tanstack/react-query";

interface IncomeTotal {
  total: number;
}

async function fetchIncome(): Promise<IncomeTotal | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transactions/income`, {
    credentials: "include",
  });
  if (!res.ok) return null;
  const body = await res.json();
  return body?.data ?? null;
}

export function useIncome() {
  const { data, isLoading } = useQuery({
    queryKey: ["transactions", "income"],
    queryFn: fetchIncome,
    retry: false,
  });

  return { income: data?.total ?? 0, isLoading };
}
