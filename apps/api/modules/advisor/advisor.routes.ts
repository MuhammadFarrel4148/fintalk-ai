import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { advisorController } from "./advisor.controller.js";
import { ChatSchema } from "./advisor.schema.js";

const router = Router();

router.post("/chat", authenticate, validate(ChatSchema), advisorController.chatMessage);

export default router;
