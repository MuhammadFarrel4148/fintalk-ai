import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";
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

const twoTransactions = [
  {
    id: "tx-1",
    date: "2026-07-10T00:00:00.000Z",
    description: "Gaji bulanan",
    category: { id: "cat-1", name: "Gaji" },
    amount: 5000000,
    type: "income",
  },
  {
    id: "tx-2",
    date: "2026-07-09T00:00:00.000Z",
    description: "Belanja bulanan",
    category: { id: "cat-2", name: "Makanan & Minuman" },
    amount: 750000,
    type: "expense",
  },
];

describe("Transactions page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders transaction rows with description and formatted amounts", async () => {
    mockFetchByUrl({
      "/transactions?": {
        ok: true,
        data: {
          transactions: twoTransactions,
          pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
        },
      },
    });

    renderPage();

    expect(await screen.findByText("Gaji bulanan")).toBeInTheDocument();
    expect(screen.getByText("Belanja bulanan")).toBeInTheDocument();
    expect(screen.getByText(`+ ${formatCurrency(5000000)}`)).toBeInTheDocument();
    expect(screen.getByText(formatCurrency(750000))).toBeInTheDocument();
  });

  it("renders the pagination footer text", async () => {
    mockFetchByUrl({
      "/transactions?": {
        ok: true,
        data: {
          transactions: twoTransactions,
          pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
        },
      },
    });

    renderPage();

    expect(await screen.findByText("Menampilkan 1-2 dari 2 transaksi")).toBeInTheDocument();
  });

  it("renders an empty state when there are no transactions", async () => {
    mockFetchByUrl({
      "/transactions?": {
        ok: true,
        data: { transactions: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } },
      },
    });

    renderPage();

    expect(await screen.findByText("Tidak ada transaksi")).toBeInTheDocument();
    expect(screen.getByText("Menampilkan 0 dari 0 transaksi")).toBeInTheDocument();
  });

  it("refetches with a search query param after the user stops typing", async () => {
    mockFetchByUrl({
      "/transactions?": {
        ok: true,
        data: { transactions: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } },
      },
    });

    const user = userEvent.setup();
    renderPage();

    const input = await screen.findByPlaceholderText("Cari deskripsi...");
    await user.type(input, "Gaji");

    await waitFor(
      () => {
        const calledWithSearch = vi
          .mocked(global.fetch)
          .mock.calls.some(([url]) => url.toString().includes("search=Gaji"));
        expect(calledWithSearch).toBe(true);
      },
      { timeout: 1000 }
    );
  });
});
