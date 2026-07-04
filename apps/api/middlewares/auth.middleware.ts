import { Request, Response, NextFunction } from "express";
import { verifyToken, UserPayload } from "../lib/jwt.js";

declare module "express" {
  interface Request {
    user?: UserPayload;
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token;
  if (!token) {
    return res
      .status(401)
      .json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } });
  }
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({
      success: false,
      error: { code: "INVALID_TOKEN", message: "Invalid or expired token" },
    });
  }
}
