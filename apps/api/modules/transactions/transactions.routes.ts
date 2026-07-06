import { Router } from "express";
import { transactionsController } from "./transactions.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

router.get("/income", authenticate, transactionsController.getIncome);
router.get("/expense", authenticate, transactionsController.getExpense);

export default router;
