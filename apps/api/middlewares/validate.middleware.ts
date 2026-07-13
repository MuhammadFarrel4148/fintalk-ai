import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

declare module "express" {
  interface Request {
    validatedQuery?: unknown;
  }
}

export function validate(schema: ZodSchema, source: "body" | "query" = "body") {
  return (req: Request, res: Response, next: NextFunction) => {
    const input = source === "query" ? req.query : req.body;
    const result = schema.safeParse(input);
    if (!result.success) {
      return res.status(422).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: result.error.issues,
        },
      });
    }
    if (source === "query") {
      req.validatedQuery = result.data;
    } else {
      req.body = result.data;
    }
    next();
  };
}
