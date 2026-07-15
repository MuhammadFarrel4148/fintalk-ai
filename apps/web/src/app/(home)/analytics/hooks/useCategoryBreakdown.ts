"use client";
import { useQuery } from "@tanstack/react-query";

export interface CategoryBreakdownItem {
  categoryId: string;
  categoryName: string;
  amount: number;
  transactionCount: number;
  percentage: number;
}

interface CategoryBreakdownResponse {
  totalExpense: number;
  categories: CategoryBreakdownItem[];
}

interface UseCategoryBreakdownParams {
  from?: string;
  to?: string;
}

async function fetchCategoryBreakdown(
  params: UseCategoryBreakdownParams
): Promise<CategoryBreakdownResponse | null> {
  const qs = new URLSearchParams();
  if (params.from) qs.set("from", params.from);
  if (params.to) qs.set("to", params.to);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/transactions/analytics/category-breakdown?${qs}`,
    { credentials: "include" }
  );
  if (!res.ok) return null;
  const body = await res.json();
  return body?.data ?? null;
}

// Params change when the user picks a date range, so (like useTransactions) the
// queryKey must include them to avoid serving a stale cached period.
export function useCategoryBreakdown(params: UseCategoryBreakdownParams) {
  const { data, isLoading } = useQuery({
    queryKey: ["transactions", "analytics", "category-breakdown", params],
    queryFn: () => fetchCategoryBreakdown(params),
    retry: false,
  });

  return {
    totalExpense: data?.totalExpense ?? 0,
    categories: data?.categories ?? [],
    isLoading,
  };
}
