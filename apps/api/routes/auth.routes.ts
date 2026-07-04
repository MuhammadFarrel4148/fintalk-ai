import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { LoginSchema } from "../schemas/auth.schema.js";

const router = Router();

router.post("/login", validate(LoginSchema), authController.login);
router.post("/logout", authController.logout);
router.get("/me", authenticate, authController.me);

export default router;
