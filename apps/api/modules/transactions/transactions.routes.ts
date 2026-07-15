import { Router } from "express";
import { transactionsController } from "./transactions.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  ListTransactionsQuerySchema,
  CategoryBreakdownQuerySchema,
  MonthlySummaryQuerySchema,
} from "./transactions.schema.js";

const router = Router();

router.get(
  "/",
  authenticate,
  validate(ListTransactionsQuerySchema, "query"),
  transactionsController.list
);
router.get("/income", authenticate, transactionsController.getIncome);
router.get("/expense", authenticate, transactionsController.getExpense);
router.get(
  "/analytics/category-breakdown",
  authenticate,
  validate(CategoryBreakdownQuerySchema, "query"),
  transactionsController.getCategoryBreakdown
);
router.get(
  "/analytics/monthly-summary",
  authenticate,
  validate(MonthlySummaryQuerySchema, "query"),
  transactionsController.getMonthlySummary
);
router.get(
  "/analytics/csv",
  authenticate,
  validate(CategoryBreakdownQuerySchema, "query"),
  transactionsController.getCsv
);

export default router;
