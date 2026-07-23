import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useRecentTransactions } from "../hooks/useRecentTransactions";

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe("useRecentTransactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("requests page=1 and limit=5", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { transactions: [] } }),
    } as Response);

    renderHook(() => useRecentTransactions(), { wrapper });

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    const url = vi.mocked(global.fetch).mock.calls[0][0]!.toString();
    expect(url).toContain("page=1");
    expect(url).toContain("limit=5");
  });

  it("returns the transactions from a successful response", async () => {
    const transactions = [
      {
        id: "tx-1",
        date: "2026-07-20T00:00:00.000Z",
        description: "Gaji bulanan",
        category: { id: "cat-1", name: "Gaji" },
        amount: 5000000,
        type: "income" as const,
      },
    ];
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { transactions } }),
    } as Response);

    const { result } = renderHook(() => useRecentTransactions(), { wrapper });

    await waitFor(() => expect(result.current.transactions).toEqual(transactions));
  });

  it("returns an empty array when the response is not ok", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    } as Response);

    const { result } = renderHook(() => useRecentTransactions(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.transactions).toEqual([]);
  });
});
