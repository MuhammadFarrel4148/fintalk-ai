import { asyncHandler } from "../../lib/asyncHandler.js";
import { Chat } from "./advisor.schema.js";
import { advisorService } from "./advisor.service.js";
import { Request, Response } from "express";

export const advisorController = {
  chatMessage: asyncHandler(async (req: Request, res: Response) => {
    const { message } = req.body as Chat;
    const data = await advisorService.chatMessage(req.user!.id, message);
    res.status(200).json({ success: true, data });
  }),
};
