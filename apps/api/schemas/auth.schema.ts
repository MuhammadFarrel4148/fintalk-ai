import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1), // no password policy defined in prd.md — don't invent one
});
