import jwt from "jsonwebtoken";

export interface UserPayload {
  id: string;
  email: string;
}

// Hardcoded per project decision — keep in sync with COOKIE_MAX_AGE_MS in controllers/auth.controller.ts.
const EXPIRES_IN = "7h";

export function signToken(payload: UserPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token: string): UserPayload {
  return jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;
}
