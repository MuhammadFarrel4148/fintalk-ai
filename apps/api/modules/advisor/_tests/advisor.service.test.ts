import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { advisorService } from "../advisor.service";
import { transactionsService } from "../../transactions/transactions.service";
import { geminiClient } from "../../../lib/gemini";

vi.mock("../../transactions/transactions.service", () => ({
  transactionsService: {
    getMonthlySummary: vi.fn(),
    getCategoryBreakdown: vi.fn(),
  },
}));

vi.mock("../../../lib/gemini", () => ({
  geminiClient: { models: { generateContent: vi.fn() } },
}));

function rp(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

describe("advisorService.buildContext", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-15T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("calls dependencies with the correct 3-month window", async () => {
    vi.mocked(transactionsService.getMonthlySummary).mockResolvedValue({ months: [] });
    vi.mocked(transactionsService.getCategoryBreakdown).mockResolvedValue({
      totalExpense: 0,
      categories: [],
    });

    await advisorService.buildContext("user-1");

    expect(transactionsService.getMonthlySummary).toHaveBeenCalledWith("user-1", { months: 3 });
    expect(transactionsService.getCategoryBreakdown).toHaveBeenCalledWith("user-1", {
      from: "2026-05-01",
      to: "2026-07-31",
    });
  });

  it("formats the happy path with monthly summary, totals, and category breakdown", async () => {
    vi.mocked(transactionsService.getMonthlySummary).mockResolvedValue({
      months: [
        { month: "2026-05", label: "Mei", income: 8000000, expense: 6200000 },
        { month: "2026-06", label: "Jun", income: 8000000, expense: 7100000 },
        { month: "2026-07", label: "Jul", income: 4000000, expense: 3050000 },
      ],
    });
    vi.mocked(transactionsService.getCategoryBreakdown).mockResolvedValue({
      totalExpense: 16350000,
      categories: [
        {
          categoryId: "cat-2",
          categoryName: "Makanan & Minuman",
          amount: 6540000,
          transactionCount: 42,
          percentage: 40,
        },
        {
          categoryId: "cat-5",
          categoryName: "Transportasi",
          amount: 3270000,
          transactionCount: 18,
          percentage: 20,
        },
      ],
    });

    const result = await advisorService.buildContext("user-1");

    expect(result).toContain("Ringkasan keuangan 3 bulan terakhir (Mei 2026 - Jul 2026):");
    expect(result).toContain(
      `- Mei 2026: pemasukan ${rp(8000000)}, pengeluaran ${rp(6200000)} (selisih +${rp(1800000)})`
    );
    expect(result).toContain(
      `- Jul 2026: pemasukan ${rp(4000000)}, pengeluaran ${rp(3050000)} (selisih +${rp(950000)})`
    );
    expect(result).toContain(
      `Total 3 bulan: pemasukan ${rp(20000000)}, pengeluaran ${rp(16350000)}`
    );
    expect(result).toContain(`- Makanan & Minuman: ${rp(6540000)} (40.0%, 42 transaksi)`);
    expect(result).toContain(`- Transportasi: ${rp(3270000)} (20.0%, 18 transaksi)`);
  });

  it("short-circuits to a fallback message when there is no activity at all", async () => {
    vi.mocked(transactionsService.getMonthlySummary).mockResolvedValue({
      months: [
        { month: "2026-05", label: "Mei", income: 0, expense: 0 },
        { month: "2026-06", label: "Jun", income: 0, expense: 0 },
        { month: "2026-07", label: "Jul", income: 0, expense: 0 },
      ],
    });
    vi.mocked(transactionsService.getCategoryBreakdown).mockResolvedValue({
      totalExpense: 0,
      categories: [],
    });

    const result = await advisorService.buildContext("user-1");

    expect(result).toBe("Belum ada transaksi tercatat dalam 3 bulan terakhir.");
  });

  it("shows a fallback line when there is income but no expenses", async () => {
    vi.mocked(transactionsService.getMonthlySummary).mockResolvedValue({
      months: [{ month: "2026-07", label: "Jul", income: 5000000, expense: 0 }],
    });
    vi.mocked(transactionsService.getCategoryBreakdown).mockResolvedValue({
      totalExpense: 0,
      categories: [],
    });

    const result = await advisorService.buildContext("user-1");

    expect(result).toContain("Tidak ada pengeluaran tercatat pada periode ini.");
    expect(result).not.toContain("undefined");
  });

  it("renders income as Rp0 when there is only expense activity", async () => {
    vi.mocked(transactionsService.getMonthlySummary).mockResolvedValue({
      months: [{ month: "2026-07", label: "Jul", income: 0, expense: 2000000 }],
    });
    vi.mocked(transactionsService.getCategoryBreakdown).mockResolvedValue({
      totalExpense: 2000000,
      categories: [
        {
          categoryId: "cat-1",
          categoryName: "Belanja",
          amount: 2000000,
          transactionCount: 3,
          percentage: 100,
        },
      ],
    });

    const result = await advisorService.buildContext("user-1");

    expect(result).toContain(
      `pemasukan ${rp(0)}, pengeluaran ${rp(2000000)} (selisih -${rp(2000000)})`
    );
  });

  it("propagates errors instead of swallowing them", async () => {
    vi.mocked(transactionsService.getMonthlySummary).mockRejectedValue(new Error("db down"));
    vi.mocked(transactionsService.getCategoryBreakdown).mockResolvedValue({
      totalExpense: 0,
      categories: [],
    });

    await expect(advisorService.buildContext("user-1")).rejects.toThrow("db down");
  });
});

describe("advisorService.chatMessage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-15T12:00:00.000Z"));
    vi.mocked(transactionsService.getMonthlySummary).mockResolvedValue({
      months: [{ month: "2026-07", label: "Jul", income: 5000000, expense: 1000000 }],
    });
    vi.mocked(transactionsService.getCategoryBreakdown).mockResolvedValue({
      totalExpense: 1000000,
      categories: [
        {
          categoryId: "cat-1",
          categoryName: "Belanja",
          amount: 1000000,
          transactionCount: 2,
          percentage: 100,
        },
      ],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("builds context, calls Gemini with the message and a system instruction, and returns the reply", async () => {
    vi.mocked(geminiClient.models.generateContent).mockResolvedValue({
      text: "Halo, ini balasan AI.",
    });

    const result = await advisorService.chatMessage("user-1", "Gimana pengeluaranku?");

    expect(result).toEqual({ reply: "Halo, ini balasan AI." });
    expect(geminiClient.models.generateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        contents: "Gimana pengeluaranku?",
        config: expect.objectContaining({
          systemInstruction: expect.stringContaining("Ringkasan keuangan 3 bulan terakhir"),
        }),
      })
    );
  });

  it("throws ExternalServiceError when the Gemini call rejects", async () => {
    vi.mocked(geminiClient.models.generateContent).mockRejectedValue(new Error("network error"));

    await expect(advisorService.chatMessage("user-1", "halo")).rejects.toMatchObject({
      statusCode: 502,
    });
  });

  it("throws ExternalServiceError with a distinct message when Gemini returns an empty reply", async () => {
    vi.mocked(geminiClient.models.generateContent).mockResolvedValue({ text: "" });

    await expect(advisorService.chatMessage("user-1", "halo")).rejects.toMatchObject({
      statusCode: 502,
      message: "AI Advisor tidak memberikan jawaban, coba lagi!",
    });
  });

  it("propagates buildContext failures instead of mapping them to ExternalServiceError", async () => {
    vi.mocked(transactionsService.getMonthlySummary).mockRejectedValue(new Error("db down"));

    await expect(advisorService.chatMessage("user-1", "halo")).rejects.toThrow("db down");
    expect(geminiClient.models.generateContent).not.toHaveBeenCalled();
  });
});
