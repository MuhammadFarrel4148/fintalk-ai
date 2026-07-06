import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Page from "../page";

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <Page />
    </QueryClientProvider>
  );
}

function mockFetchByUrl(responses: Record<string, { ok: boolean; data: unknown }>) {
  global.fetch = vi.fn((input: RequestInfo | URL) => {
    const url = input.toString();
    const match = Object.entries(responses).find(([key]) => url.includes(key));
    const response = match?.[1] ?? { ok: false, data: null };

    return Promise.resolve({
      ok: response.ok,
      json: async () => ({ data: response.data }),
    } as Response);
  }) as typeof fetch;
}

// testing-library's default text normalizer collapses all whitespace (including the
// non-breaking space Intl.NumberFormat inserts after "Rp") into a plain space.
function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace(/ /g, " ");
}

describe("Dashboard page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Sisa Saldo, Total Pemasukan, and Total Pengeluaran with formatted currency values", async () => {
    mockFetchByUrl({
      "/auth/me": { ok: true, data: { id: "1", email: "a@b.com", balance: 5000000 } },
      "/transactions/income": { ok: true, data: { total: 6500000 } },
      "/transactions/expense": { ok: true, data: { total: 1500000 } },
    });

    renderPage();

    expect(await screen.findByText(formatCurrency(5000000))).toBeInTheDocument();
    expect(await screen.findByText(formatCurrency(6500000))).toBeInTheDocument();
    expect(await screen.findByText(formatCurrency(1500000))).toBeInTheDocument();
  });

  it("renders 'Coming Soon' for the AI Advisor and Recent Transactions sections", () => {
    mockFetchByUrl({});
    renderPage();

    expect(screen.getByText("AI Advisor")).toBeInTheDocument();
    expect(screen.getByText("Transaksi Terakhir")).toBeInTheDocument();
    expect(screen.getAllByText("Coming Soon")).toHaveLength(2);
  });

  it("renders zero values when the API calls fail", async () => {
    mockFetchByUrl({});
    renderPage();

    const zeroValues = await screen.findAllByText(formatCurrency(0));
    expect(zeroValues).toHaveLength(3);
  });
});
