import { describe, it, expect, vi } from "vitest";
import { transactionsService } from "../transactions.service";
import { transactionsRepository } from "../transactions.repository";

vi.mock("../transactions.repository", () => ({
  transactionsRepository: { sumByType: vi.fn(), findMany: vi.fn(), count: vi.fn() },
}));

describe("transactionsService.getIncomeTotal", () => {
  it("returns 0 when there are no income transactions", async () => {
    vi.mocked(transactionsRepository.sumByType).mockResolvedValue({
      _sum: { amount: null },
    } as never);

    const result = await transactionsService.getIncomeTotal("user-1");

    expect(result).toEqual({ total: 0 });
    expect(transactionsRepository.sumByType).toHaveBeenCalledWith("user-1", "income");
  });

  it("converts the Decimal sum to a number", async () => {
    vi.mocked(transactionsRepository.sumByType).mockResolvedValue({
      _sum: { amount: "6500000.00" },
    } as never);

    const result = await transactionsService.getIncomeTotal("user-1");

    expect(result).toEqual({ total: 6500000 });
  });
});

describe("transactionsService.getExpenseTotal", () => {
  it("returns 0 when there are no expense transactions", async () => {
    vi.mocked(transactionsRepository.sumByType).mockResolvedValue({
      _sum: { amount: null },
    } as never);

    const result = await transactionsService.getExpenseTotal("user-1");

    expect(result).toEqual({ total: 0 });
    expect(transactionsRepository.sumByType).toHaveBeenCalledWith("user-1", "expense");
  });

  it("converts the Decimal sum to a number", async () => {
    vi.mocked(transactionsRepository.sumByType).mockResolvedValue({
      _sum: { amount: "1500000.00" },
    } as never);

    const result = await transactionsService.getExpenseTotal("user-1");

    expect(result).toEqual({ total: 1500000 });
  });
});

describe("transactionsService.list", () => {
  it("maps rows and computes pagination for a happy path", async () => {
    vi.mocked(transactionsRepository.findMany).mockResolvedValue([
      {
        id: "tx-1",
        transactionDate: new Date("2026-07-10T00:00:00.000Z"),
        description: "Belanja bulanan",
        category: { id: "cat-1", name: "Makanan & Minuman" },
        amount: "750000.00",
        type: "expense",
      },
    ] as never);
    vi.mocked(transactionsRepository.count).mockResolvedValue(1 as never);

    const result = await transactionsService.list("user-1", {
      search: undefined,
      from: undefined,
      to: undefined,
      page: 1,
      limit: 10,
    });

    expect(result).toEqual({
      transactions: [
        {
          id: "tx-1",
          date: new Date("2026-07-10T00:00:00.000Z"),
          description: "Belanja bulanan",
          category: { id: "cat-1", name: "Makanan & Minuman" },
          amount: 750000,
          type: "expense",
        },
      ],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });
  });

  it("returns an empty list and clamps totalPages to 1 when there is no data", async () => {
    vi.mocked(transactionsRepository.findMany).mockResolvedValue([] as never);
    vi.mocked(transactionsRepository.count).mockResolvedValue(0 as never);

    const result = await transactionsService.list("user-1", {
      search: undefined,
      from: undefined,
      to: undefined,
      page: 1,
      limit: 10,
    });

    expect(result).toEqual({
      transactions: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
    });
  });

  it("forwards search/from/to/skip/take to the repository", async () => {
    vi.mocked(transactionsRepository.findMany).mockResolvedValue([] as never);
    vi.mocked(transactionsRepository.count).mockResolvedValue(0 as never);

    await transactionsService.list("user-1", {
      search: "Gaji",
      from: "2026-07-01",
      to: "2026-07-10",
      page: 2,
      limit: 5,
    });

    expect(transactionsRepository.findMany).toHaveBeenCalledWith("user-1", {
      search: "Gaji",
      from: "2026-07-01",
      to: "2026-07-10",
      skip: 5,
      take: 5,
    });
    expect(transactionsRepository.count).toHaveBeenCalledWith("user-1", {
      search: "Gaji",
      from: "2026-07-01",
      to: "2026-07-10",
    });
  });
});
