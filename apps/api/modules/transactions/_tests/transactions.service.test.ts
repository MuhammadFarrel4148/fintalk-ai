import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { transactionsService } from "../transactions.service";
import { transactionsRepository } from "../transactions.repository";

vi.mock("../transactions.repository", () => ({
  transactionsRepository: {
    sumByType: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    groupExpenseByCategory: vi.fn(),
    groupIncomeByCategory: vi.fn(),
    findCategoriesByIds: vi.fn(),
    findForMonthlySummary: vi.fn(),
  },
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

describe("transactionsService.getCategoryBreakdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-15T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("sorts categories by amount desc and computes percentages", async () => {
    vi.mocked(transactionsRepository.groupExpenseByCategory).mockResolvedValue([
      { categoryId: "cat-1", _sum: { amount: "300000" }, _count: { _all: 2 } },
      { categoryId: "cat-2", _sum: { amount: "700000" }, _count: { _all: 3 } },
    ] as never);
    vi.mocked(transactionsRepository.findCategoriesByIds).mockResolvedValue([
      { id: "cat-1", name: "Transportasi" },
      { id: "cat-2", name: "Makanan & Minuman" },
    ] as never);

    const result = await transactionsService.getCategoryBreakdown("user-1", {});

    expect(result).toEqual({
      totalExpense: 1000000,
      categories: [
        {
          categoryId: "cat-2",
          categoryName: "Makanan & Minuman",
          amount: 700000,
          transactionCount: 3,
          percentage: 70,
        },
        {
          categoryId: "cat-1",
          categoryName: "Transportasi",
          amount: 300000,
          transactionCount: 2,
          percentage: 30,
        },
      ],
    });
  });

  it("returns 0 totalExpense and no NaN percentages when there are no expenses", async () => {
    vi.mocked(transactionsRepository.groupExpenseByCategory).mockResolvedValue([] as never);
    vi.mocked(transactionsRepository.findCategoriesByIds).mockResolvedValue([] as never);

    const result = await transactionsService.getCategoryBreakdown("user-1", {});

    expect(result).toEqual({ totalExpense: 0, categories: [] });
  });

  it("defaults to the current calendar month when from/to are omitted", async () => {
    vi.mocked(transactionsRepository.groupExpenseByCategory).mockResolvedValue([] as never);
    vi.mocked(transactionsRepository.findCategoriesByIds).mockResolvedValue([] as never);

    await transactionsService.getCategoryBreakdown("user-1", {});

    expect(transactionsRepository.groupExpenseByCategory).toHaveBeenCalledWith(
      "user-1",
      new Date("2026-07-01T00:00:00.000Z"),
      new Date("2026-07-31T23:59:59.999Z")
    );
  });

  it("forwards explicit from/to as UTC day boundaries", async () => {
    vi.mocked(transactionsRepository.groupExpenseByCategory).mockResolvedValue([] as never);
    vi.mocked(transactionsRepository.findCategoriesByIds).mockResolvedValue([] as never);

    await transactionsService.getCategoryBreakdown("user-1", {
      from: "2026-06-01",
      to: "2026-06-15",
    });

    expect(transactionsRepository.groupExpenseByCategory).toHaveBeenCalledWith(
      "user-1",
      new Date("2026-06-01T00:00:00.000Z"),
      new Date("2026-06-15T23:59:59.999Z")
    );
  });
});

describe("transactionsService.getMonthlySummary", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-15T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("buckets income/expense per month, oldest first", async () => {
    vi.mocked(transactionsRepository.findForMonthlySummary).mockResolvedValue([
      { amount: "5000000", type: "income", transactionDate: new Date("2026-06-05T00:00:00.000Z") },
      { amount: "750000", type: "expense", transactionDate: new Date("2026-06-10T00:00:00.000Z") },
      { amount: "1500000", type: "income", transactionDate: new Date("2026-07-05T00:00:00.000Z") },
      { amount: "300000", type: "expense", transactionDate: new Date("2026-07-10T00:00:00.000Z") },
    ] as never);

    const result = await transactionsService.getMonthlySummary("user-1", { months: 2 });

    expect(result).toEqual({
      months: [
        { month: "2026-06", label: "Jun", income: 5000000, expense: 750000 },
        { month: "2026-07", label: "Jul", income: 1500000, expense: 300000 },
      ],
    });
  });

  it("returns zeroed buckets for every month when there are no transactions", async () => {
    vi.mocked(transactionsRepository.findForMonthlySummary).mockResolvedValue([] as never);

    const result = await transactionsService.getMonthlySummary("user-1", { months: 3 });

    expect(result).toEqual({
      months: [
        { month: "2026-05", label: "Mei", income: 0, expense: 0 },
        { month: "2026-06", label: "Jun", income: 0, expense: 0 },
        { month: "2026-07", label: "Jul", income: 0, expense: 0 },
      ],
    });
  });
});

describe("transactionsService.getCsv", () => {
  it("builds a CSV with a header row, resolved category names, income rows before expense rows", async () => {
    vi.mocked(transactionsRepository.groupIncomeByCategory).mockResolvedValue([
      { categoryId: "cat-1", type: "income", _sum: { amount: "5000000" }, _count: { _all: 1 } },
    ] as never);
    vi.mocked(transactionsRepository.groupExpenseByCategory).mockResolvedValue([
      { categoryId: "cat-2", type: "expense", _sum: { amount: "750000" }, _count: { _all: 2 } },
    ] as never);
    vi.mocked(transactionsRepository.findCategoriesByIds).mockResolvedValue([
      { id: "cat-1", name: "Gaji" },
      { id: "cat-2", name: "Makanan & Minuman" },
    ] as never);

    const result = await transactionsService.getCsv("user-1", {
      from: "2026-07-01",
      to: "2026-07-31",
    });

    expect(result).toBe(
      [
        "Kategori,Jenis Transaksi,Total Transaksi,Jumlah Transaksi",
        "Gaji,income,5000000,1",
        "Makanan & Minuman,expense,750000,2",
      ].join("\n")
    );
    expect(transactionsRepository.findCategoriesByIds).toHaveBeenCalledWith(["cat-1", "cat-2"]);
  });

  it("falls back to 'Lain-lain' when a category can't be resolved", async () => {
    vi.mocked(transactionsRepository.groupIncomeByCategory).mockResolvedValue([] as never);
    vi.mocked(transactionsRepository.groupExpenseByCategory).mockResolvedValue([
      {
        categoryId: "cat-orphan",
        type: "expense",
        _sum: { amount: "100000" },
        _count: { _all: 1 },
      },
    ] as never);
    vi.mocked(transactionsRepository.findCategoriesByIds).mockResolvedValue([] as never);

    const result = await transactionsService.getCsv("user-1", {});

    expect(result).toBe(
      [
        "Kategori,Jenis Transaksi,Total Transaksi,Jumlah Transaksi",
        "Lain-lain,expense,100000,1",
      ].join("\n")
    );
  });

  it("returns just the header row when there are no transactions", async () => {
    vi.mocked(transactionsRepository.groupIncomeByCategory).mockResolvedValue([] as never);
    vi.mocked(transactionsRepository.groupExpenseByCategory).mockResolvedValue([] as never);
    vi.mocked(transactionsRepository.findCategoriesByIds).mockResolvedValue([] as never);

    const result = await transactionsService.getCsv("user-1", {});

    expect(result).toBe("Kategori,Jenis Transaksi,Total Transaksi,Jumlah Transaksi");
  });
});
