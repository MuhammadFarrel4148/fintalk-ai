import { Request, Response } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { authService } from "./auth.service.js";

// Keep in sync with EXPIRES_IN ("7h") in lib/jwt.ts.
const COOKIE_MAX_AGE_MS = 7 * 60 * 60 * 1000;

export const authController = {
  login: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const { token, user } = await authService.login(email, password);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: COOKIE_MAX_AGE_MS,
    });

    res.status(200).json({ success: true, data: user });
  }),

  logout: (req: Request, res: Response) => {
    res.clearCookie("token");
    res.status(200).json({ success: true, data: null });
  },

  me: (req: Request, res: Response) => {
    res.status(200).json({ success: true, data: req.user });
  },
};
