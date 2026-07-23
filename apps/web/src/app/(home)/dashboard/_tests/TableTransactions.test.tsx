import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TableTransactions from "../components/TableTransactions";
import type { RecentTransaction } from "../hooks/useRecentTransactions";

const sampleTransactions: RecentTransaction[] = [
  {
    id: "tx-1",
    date: "2026-07-20T00:00:00.000Z",
    description: "Gaji bulanan",
    category: { id: "cat-1", name: "Gaji" },
    amount: 5000000,
    type: "income",
  },
  {
    id: "tx-2",
    date: "2026-07-19T00:00:00.000Z",
    description: "Makan siang",
    category: { id: "cat-2", name: "Makanan & Minuman" },
    amount: 50000,
    type: "expense",
  },
];

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

describe("TableTransactions", () => {
  it("renders a loading state", () => {
    render(<TableTransactions transactions={[]} isLoading={true} />);
    expect(screen.getByText("Memuat transaksi...")).toBeInTheDocument();
  });

  it("renders an empty state when there are no transactions", () => {
    render(<TableTransactions transactions={[]} isLoading={false} />);
    expect(screen.getByText("Belum ada transaksi")).toBeInTheDocument();
  });

  it("renders transaction rows with formatted date, currency, and income/expense styling", () => {
    render(<TableTransactions transactions={sampleTransactions} isLoading={false} />);

    expect(screen.getByText("Gaji bulanan")).toBeInTheDocument();
    expect(screen.getByText("20 Jul 2026")).toBeInTheDocument();
    expect(screen.getByText(`+ ${formatCurrency(5000000)}`)).toBeInTheDocument();

    expect(screen.getByText("Makan siang")).toBeInTheDocument();
    expect(screen.getByText("19 Jul 2026")).toBeInTheDocument();
    expect(screen.getByText(`- ${formatCurrency(50000)}`)).toBeInTheDocument();

    const incomeAmount = screen.getByText(`+ ${formatCurrency(5000000)}`);
    expect(incomeAmount).toHaveClass("text-emerald-600");
    const expenseAmount = screen.getByText(`- ${formatCurrency(50000)}`);
    expect(expenseAmount).toHaveClass("text-red-600");
  });
});
