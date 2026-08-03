import { z } from "zod";

export const TelegramUpdateSchema = z.object({
  message: z
    .object({
      message_id: z.number(),
      from: z.object({ id: z.number() }),
      chat: z.object({ id: z.number() }),
      text: z.string().optional(),
    })
    .optional(),
});

export type TelegramUpdate = z.infer<typeof TelegramUpdateSchema>;
