"use client";
import { useQuery } from "@tanstack/react-query";

export interface MonthlySummaryItem {
  month: string;
  label: string;
  income: number;
  expense: number;
}

interface MonthlySummaryResponse {
  months: MonthlySummaryItem[];
}

async function fetchMonthlySummary(): Promise<MonthlySummaryResponse | null> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/transactions/analytics/monthly-summary?months=6`,
    { credentials: "include" }
  );
  if (!res.ok) return null;
  const body = await res.json();
  return body?.data ?? null;
}

export function useMonthlySummary() {
  const { data, isLoading } = useQuery({
    queryKey: ["transactions", "analytics", "monthly-summary"],
    queryFn: fetchMonthlySummary,
    retry: false,
  });

  return { months: data?.months ?? [], isLoading };
}
