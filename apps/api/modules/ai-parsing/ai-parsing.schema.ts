import { z } from "zod";

export const GeminiParseResultSchema = z.object({
  amount: z.number().positive().nullable(),
  type: z.enum(["income", "expense"]).nullable(),
  category: z.string().nullable(),
  description: z.string(),
  needsClarification: z.boolean(),
  clarificationQuestion: z.string().nullable(),
});

export type GeminiParseResult = z.infer<typeof GeminiParseResultSchema>;

export interface ResolvedTransaction {
  amount: number;
  type: "income" | "expense";
  categoryId: string;
  categoryName: string;
  description: string;
}

export type ParseTextResult =
  | { needsClarification: false; transaction: ResolvedTransaction }
  | { needsClarification: true; question: string; partial: GeminiParseResult };
