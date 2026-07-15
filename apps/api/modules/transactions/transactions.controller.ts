import { Request, Response } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { transactionsService } from "./transactions.service.js";
import {
  ListTransactionsQuery,
  CategoryBreakdownQuery,
  MonthlySummaryQuery,
} from "./transactions.schema.js";

export const transactionsController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const query = req.validatedQuery as ListTransactionsQuery;
    const data = await transactionsService.list(req.user!.id, query);
    res.status(200).json({ success: true, data });
  }),

  getIncome: asyncHandler(async (req: Request, res: Response) => {
    const data = await transactionsService.getIncomeTotal(req.user!.id);
    res.status(200).json({ success: true, data });
  }),

  getExpense: asyncHandler(async (req: Request, res: Response) => {
    const data = await transactionsService.getExpenseTotal(req.user!.id);
    res.status(200).json({ success: true, data });
  }),

  getCategoryBreakdown: asyncHandler(async (req: Request, res: Response) => {
    const query = req.validatedQuery as CategoryBreakdownQuery;
    const data = await transactionsService.getCategoryBreakdown(req.user!.id, query);
    res.status(200).json({ success: true, data });
  }),

  getMonthlySummary: asyncHandler(async (req: Request, res: Response) => {
    const query = req.validatedQuery as MonthlySummaryQuery;
    const data = await transactionsService.getMonthlySummary(req.user!.id, query);
    res.status(200).json({ success: true, data });
  }),

  getCsv: asyncHandler(async (req: Request, res: Response) => {
    const query = req.validatedQuery as CategoryBreakdownQuery;
    const csvContent = await transactionsService.getCsv(req.user!.id, query);
    res.setHeader("Content-Disposition", "attachment; filename=laporan.csv");
    res.status(200).type("text/csv").send(csvContent);
  }),
};
