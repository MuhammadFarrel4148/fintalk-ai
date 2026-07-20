import { z } from "zod";

export const ChatSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Pesan tidak boleh kosong")
    .max(2000, "Karakter terlalu panjang"),
});

export type Chat = z.infer<typeof ChatSchema>;
