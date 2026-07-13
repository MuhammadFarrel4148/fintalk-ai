import { Request, Response } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { transactionsService } from "./transactions.service.js";
import { ListTransactionsQuery } from "./transactions.schema.js";

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
};
