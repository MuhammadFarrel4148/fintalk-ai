import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Page from "../page";

// react-apexcharts needs real layout/ResizeObserver support that jsdom doesn't provide,
// so it's stubbed here — these tests assert on the data-driven surrounding content
// (totals, category list, empty states), not on chart internals.
vi.mock("react-apexcharts", () => ({
  default: () => <div data-testid="mock-chart" />,
}));

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

describe("Analytics page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders an Ekspor link pointing at the CSV export endpoint", async () => {
    mockFetchByUrl({
      "/analytics/category-breakdown": { ok: true, data: { totalExpense: 0, categories: [] } },
      "/analytics/monthly-summary": { ok: true, data: { months: [] } },
    });

    renderPage();

    const link = await screen.findByRole("link", { name: /ekspor/i });
    expect(link).toHaveAttribute(
      "href",
      expect.stringContaining("/api/transactions/analytics/csv")
    );
  });

  it("renders the category breakdown total and list with percentages", async () => {
    mockFetchByUrl({
      "/analytics/category-breakdown": {
        ok: true,
        data: {
          totalExpense: 1000000,
          categories: [
            {
              categoryId: "cat-1",
              categoryName: "Makanan & Minuman",
              amount: 700000,
              transactionCount: 3,
              percentage: 70,
            },
            {
              categoryId: "cat-2",
              categoryName: "Transportasi",
              amount: 300000,
              transactionCount: 2,
              percentage: 30,
            },
          ],
        },
      },
      "/analytics/monthly-summary": { ok: true, data: { months: [] } },
    });

    renderPage();

    expect(await screen.findByText(formatCurrency(1000000))).toBeInTheDocument();
    // Both category names also appear in the Top Pengeluaran panel (same underlying data),
    // so there are 2 matches each rather than 1.
    expect(screen.getAllByText("Makanan & Minuman").length).toBeGreaterThan(0);
    expect(screen.getByText("70%")).toBeInTheDocument();
    expect(screen.getAllByText("Transportasi").length).toBeGreaterThan(0);
    expect(screen.getByText("30%")).toBeInTheDocument();
  });

  it("shows the top-3 spending panel and the AI Insight 'Coming Soon' placeholder", async () => {
    mockFetchByUrl({
      "/analytics/category-breakdown": {
        ok: true,
        data: {
          totalExpense: 1000000,
          categories: [
            {
              categoryId: "cat-1",
              categoryName: "Makanan & Minuman",
              amount: 700000,
              transactionCount: 3,
              percentage: 70,
            },
          ],
        },
      },
      "/analytics/monthly-summary": { ok: true, data: { months: [] } },
    });

    renderPage();

    expect(await screen.findByText("Top Pengeluaran")).toBeInTheDocument();
    expect(await screen.findByText("3 Transaksi")).toBeInTheDocument();
    expect(screen.getByText("AI Insight")).toBeInTheDocument();
    expect(screen.getByText("Coming Soon")).toBeInTheDocument();
  });

  it("shows an empty state when there are no expense transactions in the period", async () => {
    mockFetchByUrl({
      "/analytics/category-breakdown": { ok: true, data: { totalExpense: 0, categories: [] } },
      "/analytics/monthly-summary": { ok: true, data: { months: [] } },
    });

    renderPage();

    expect(
      await screen.findByText("Belum ada transaksi pengeluaran pada periode ini.")
    ).toBeInTheDocument();
    expect(screen.getByText("Belum ada pengeluaran pada periode ini.")).toBeInTheDocument();
  });

  it("renders the monthly summary bar chart labels", async () => {
    mockFetchByUrl({
      "/analytics/category-breakdown": { ok: true, data: { totalExpense: 0, categories: [] } },
      "/analytics/monthly-summary": {
        ok: true,
        data: {
          months: [
            { month: "2026-06", label: "Jun", income: 5000000, expense: 750000 },
            { month: "2026-07", label: "Jul", income: 6500000, expense: 1500000 },
          ],
        },
      },
    });

    renderPage();

    expect(await screen.findByText("Pemasukan vs Pengeluaran (6 Bulan)")).toBeInTheDocument();
    expect(await screen.findByTestId("mock-chart")).toBeInTheDocument();
  });
});
