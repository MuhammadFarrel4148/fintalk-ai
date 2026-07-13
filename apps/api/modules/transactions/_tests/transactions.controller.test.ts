import { describe, it, expect, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { transactionsController } from "../transactions.controller";
import { transactionsService } from "../transactions.service";

vi.mock("../transactions.service", () => ({
  transactionsService: { list: vi.fn(), getIncomeTotal: vi.fn(), getExpenseTotal: vi.fn() },
}));

function mockRes() {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("transactionsController.list", () => {
  it("responds 200 with the paginated transaction list for the authenticated user", async () => {
    const data = {
      transactions: [
        {
          id: "tx-1",
          date: new Date("2026-07-10T00:00:00.000Z"),
          description: "Gaji bulanan",
          category: { id: "cat-1", name: "Gaji" },
          amount: 5000000,
          type: "income",
        },
      ],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    };
    vi.mocked(transactionsService.list).mockResolvedValue(data as never);
    const req = {
      user: { id: "user-1", email: "a@b.com" },
      validatedQuery: { page: 1, limit: 10 },
    } as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    await transactionsController.list(req, res, next);

    expect(transactionsService.list).toHaveBeenCalledWith("user-1", { page: 1, limit: 10 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data });
  });

  it("forwards a rejected list to next without responding", async () => {
    const error = new Error("boom");
    vi.mocked(transactionsService.list).mockRejectedValue(error);
    const req = {
      user: { id: "user-1", email: "a@b.com" },
      validatedQuery: { page: 1, limit: 10 },
    } as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    await transactionsController.list(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.json).not.toHaveBeenCalled();
  });
});

describe("transactionsController.getIncome", () => {
  it("responds 200 with the income total for the authenticated user", async () => {
    vi.mocked(transactionsService.getIncomeTotal).mockResolvedValue({ total: 6500000 });
    const req = { user: { id: "user-1", email: "a@b.com" } } as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    await transactionsController.getIncome(req, res, next);

    expect(transactionsService.getIncomeTotal).toHaveBeenCalledWith("user-1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: { total: 6500000 } });
  });

  it("forwards a rejected getIncomeTotal to next without responding", async () => {
    const error = new Error("boom");
    vi.mocked(transactionsService.getIncomeTotal).mockRejectedValue(error);
    const req = { user: { id: "user-1", email: "a@b.com" } } as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    await transactionsController.getIncome(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.json).not.toHaveBeenCalled();
  });
});

describe("transactionsController.getExpense", () => {
  it("responds 200 with the expense total for the authenticated user", async () => {
    vi.mocked(transactionsService.getExpenseTotal).mockResolvedValue({ total: 1500000 });
    const req = { user: { id: "user-1", email: "a@b.com" } } as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    await transactionsController.getExpense(req, res, next);

    expect(transactionsService.getExpenseTotal).toHaveBeenCalledWith("user-1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: { total: 1500000 } });
  });

  it("forwards a rejected getExpenseTotal to next without responding", async () => {
    const error = new Error("boom");
    vi.mocked(transactionsService.getExpenseTotal).mockRejectedValue(error);
    const req = { user: { id: "user-1", email: "a@b.com" } } as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    await transactionsController.getExpense(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.json).not.toHaveBeenCalled();
  });
});
