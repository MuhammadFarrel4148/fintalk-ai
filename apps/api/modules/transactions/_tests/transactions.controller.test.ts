import { describe, it, expect, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { transactionsController } from "../transactions.controller";
import { transactionsService } from "../transactions.service";

vi.mock("../transactions.service", () => ({
  transactionsService: { getIncomeTotal: vi.fn(), getExpenseTotal: vi.fn() },
}));

function mockRes() {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

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
