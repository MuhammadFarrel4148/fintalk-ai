import { describe, it, expect, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { transactionsController } from "../transactions.controller";
import { transactionsService } from "../transactions.service";

vi.mock("../transactions.service", () => ({
  transactionsService: {
    list: vi.fn(),
    getIncomeTotal: vi.fn(),
    getExpenseTotal: vi.fn(),
    getCategoryBreakdown: vi.fn(),
    getMonthlySummary: vi.fn(),
    getCsv: vi.fn(),
  },
}));

function mockRes() {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.setHeader = vi.fn().mockReturnValue(res);
  res.type = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
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

describe("transactionsController.getCategoryBreakdown", () => {
  it("responds 200 with the category breakdown for the authenticated user", async () => {
    const data = {
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
    };
    vi.mocked(transactionsService.getCategoryBreakdown).mockResolvedValue(data);
    const req = {
      user: { id: "user-1", email: "a@b.com" },
      validatedQuery: { from: "2026-07-01", to: "2026-07-31" },
    } as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    await transactionsController.getCategoryBreakdown(req, res, next);

    expect(transactionsService.getCategoryBreakdown).toHaveBeenCalledWith("user-1", {
      from: "2026-07-01",
      to: "2026-07-31",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data });
  });

  it("forwards a rejected getCategoryBreakdown to next without responding", async () => {
    const error = new Error("boom");
    vi.mocked(transactionsService.getCategoryBreakdown).mockRejectedValue(error);
    const req = { user: { id: "user-1", email: "a@b.com" }, validatedQuery: {} } as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    await transactionsController.getCategoryBreakdown(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.json).not.toHaveBeenCalled();
  });
});

describe("transactionsController.getMonthlySummary", () => {
  it("responds 200 with the monthly summary for the authenticated user", async () => {
    const data = {
      months: [{ month: "2026-07", label: "Jul", income: 1500000, expense: 300000 }],
    };
    vi.mocked(transactionsService.getMonthlySummary).mockResolvedValue(data);
    const req = {
      user: { id: "user-1", email: "a@b.com" },
      validatedQuery: { months: 1 },
    } as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    await transactionsController.getMonthlySummary(req, res, next);

    expect(transactionsService.getMonthlySummary).toHaveBeenCalledWith("user-1", { months: 1 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data });
  });

  it("forwards a rejected getMonthlySummary to next without responding", async () => {
    const error = new Error("boom");
    vi.mocked(transactionsService.getMonthlySummary).mockRejectedValue(error);
    const req = {
      user: { id: "user-1", email: "a@b.com" },
      validatedQuery: { months: 6 },
    } as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    await transactionsController.getMonthlySummary(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.json).not.toHaveBeenCalled();
  });
});

describe("transactionsController.getCsv", () => {
  it("responds 200 with the CSV content and a download-friendly Content-Disposition header", async () => {
    const csvContent =
      "Kategori,Jenis Transaksi,Total Transaksi,Jumlah Transaksi\nGaji,income,5000000,1";
    vi.mocked(transactionsService.getCsv).mockResolvedValue(csvContent);
    const req = {
      user: { id: "user-1", email: "a@b.com" },
      validatedQuery: { from: "2026-07-01", to: "2026-07-31" },
    } as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    await transactionsController.getCsv(req, res, next);

    expect(transactionsService.getCsv).toHaveBeenCalledWith("user-1", {
      from: "2026-07-01",
      to: "2026-07-31",
    });
    expect(res.setHeader).toHaveBeenCalledWith(
      "Content-Disposition",
      "attachment; filename=laporan.csv"
    );
    expect(res.type).toHaveBeenCalledWith("text/csv");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(csvContent);
    expect(res.json).not.toHaveBeenCalled();
  });

  it("forwards a rejected getCsv to next without responding", async () => {
    const error = new Error("boom");
    vi.mocked(transactionsService.getCsv).mockRejectedValue(error);
    const req = { user: { id: "user-1", email: "a@b.com" }, validatedQuery: {} } as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    await transactionsController.getCsv(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.send).not.toHaveBeenCalled();
  });
});
