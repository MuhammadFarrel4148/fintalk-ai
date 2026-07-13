import { Router } from "express";
import { transactionsController } from "./transactions.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { ListTransactionsQuerySchema } from "./transactions.schema.js";

const router = Router();

router.get(
  "/",
  authenticate,
  validate(ListTransactionsQuerySchema, "query"),
  transactionsController.list
);
router.get("/income", authenticate, transactionsController.getIncome);
router.get("/expense", authenticate, transactionsController.getExpense);

export default router;
