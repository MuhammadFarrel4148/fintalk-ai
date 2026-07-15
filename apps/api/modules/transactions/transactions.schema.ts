import { z } from "zod";

export const ListTransactionsQuerySchema = z.object({
  search: z.string().trim().optional(),
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "from must be in YYYY-MM-DD format")
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "to must be in YYYY-MM-DD format")
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type ListTransactionsQuery = z.infer<typeof ListTransactionsQuerySchema>;

export const CategoryBreakdownQuerySchema = z.object({
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "from must be in YYYY-MM-DD format")
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "to must be in YYYY-MM-DD format")
    .optional(),
});

export type CategoryBreakdownQuery = z.infer<typeof CategoryBreakdownQuerySchema>;

export const MonthlySummaryQuerySchema = z.object({
  months: z.coerce.number().int().min(1).max(24).default(6),
});

export type MonthlySummaryQuery = z.infer<typeof MonthlySummaryQuerySchema>;
