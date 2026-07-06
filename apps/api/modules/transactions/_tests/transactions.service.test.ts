import { describe, it, expect, vi } from "vitest";
import { transactionsService } from "../transactions.service";
import { transactionsRepository } from "../transactions.repository";

vi.mock("../transactions.repository", () => ({
  transactionsRepository: { sumByType: vi.fn() },
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
