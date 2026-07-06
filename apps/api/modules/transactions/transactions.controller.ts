import { Request, Response } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { transactionsService } from "./transactions.service.js";

export const transactionsController = {
  getIncome: asyncHandler(async (req: Request, res: Response) => {
    const data = await transactionsService.getIncomeTotal(req.user!.id);
    res.status(200).json({ success: true, data });
  }),

  getExpense: asyncHandler(async (req: Request, res: Response) => {
    const data = await transactionsService.getExpenseTotal(req.user!.id);
    res.status(200).json({ success: true, data });
  }),
};
