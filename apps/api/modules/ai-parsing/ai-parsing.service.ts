import { geminiClient } from "../../lib/gemini.js";
import { ExternalServiceError } from "../../exceptions/ExternalServiceError.js";
import { aiParsingRepository } from "./ai-parsing.repository.js";
import {
  GeminiParseResultSchema,
  GeminiParseResult,
  ParseTextResult,
} from "./ai-parsing.schema.js";

const GEMINI_MODEL = "gemini-2.5-flash";

const RESPONSE_JSON_SCHEMA = {
  type: "object",
  properties: {
    amount: { type: ["number", "null"] },
    type: { type: ["string", "null"], enum: ["income", "expense", null] },
    category: { type: ["string", "null"] },
    description: { type: "string" },
    needsClarification: { type: "boolean" },
    clarificationQuestion: { type: ["string", "null"] },
  },
  required: [
    "amount",
    "type",
    "category",
    "description",
    "needsClarification",
    "clarificationQuestion",
  ],
};

export const aiParsingService = {
  async parseTransactionText(text: string): Promise<ParseTextResult> {
    const categories = await aiParsingRepository.listDefaultCategories();
    const parsed = await callGeminiWithRetry(
      text,
      categories.map((c) => c.name)
    );
    return resolveResult(parsed, categories);
  },
};

async function callGeminiWithRetry(
  text: string,
  categoryNames: string[]
): Promise<GeminiParseResult> {
  try {
    return await callGemini(text, categoryNames);
  } catch {
    try {
      return await callGemini(text, categoryNames);
    } catch {
      throw new ExternalServiceError("Gagal memproses pesan, coba kirim ulang ya!");
    }
  }
}

async function callGemini(text: string, categoryNames: string[]): Promise<GeminiParseResult> {
  const interaction = await geminiClient.models.generateContent({
    model: GEMINI_MODEL,
    contents: text,
    config: {
      systemInstruction: buildSystemPrompt(categoryNames),
      responseMimeType: "application/json",
      responseJsonSchema: RESPONSE_JSON_SCHEMA,
    },
  });

  const raw = interaction.text;
  if (!raw) throw new Error("Empty Gemini response");

  return GeminiParseResultSchema.parse(JSON.parse(raw));
}

function resolveResult(
  parsed: GeminiParseResult,
  categories: { id: string; name: string }[]
): ParseTextResult {
  const matchedCategory = parsed.category
    ? categories.find((c) => c.name.toLowerCase() === parsed.category!.toLowerCase())
    : undefined;

  const isComplete =
    !parsed.needsClarification &&
    parsed.amount !== null &&
    parsed.type !== null &&
    matchedCategory !== undefined;

  if (isComplete) {
    return {
      needsClarification: false,
      transaction: {
        amount: parsed.amount!,
        type: parsed.type!,
        categoryId: matchedCategory!.id,
        categoryName: matchedCategory!.name,
        description: parsed.description,
      },
    };
  }

  return {
    needsClarification: true,
    question:
      parsed.clarificationQuestion ?? "Aku belum yakin ini transaksi apa, bisa dijelaskan lagi?",
    partial: parsed,
  };
}

function buildSystemPrompt(categoryNames: string[]): string {
  return [
    "Kamu adalah parser transaksi keuangan untuk aplikasi FinTalk. Tugasmu mengubah pesan bebas dari user menjadi JSON transaksi terstruktur.",
    "",
    "Field yang harus diisi:",
    '- amount: nominal transaksi dalam Rupiah sebagai angka murni (bukan string). Normalisasi semua format umum Bahasa Indonesia: "50rb", "50k", "50.000", dan "Rp50.000" semuanya berarti 50000.',
    '- type: "income" untuk pemasukan (gaji, bonus, freelance, dll), "expense" untuk pengeluaran (beli, bayar, dll).',
    `- category: HARUS persis salah satu dari daftar berikut: ${categoryNames.join(", ")}.`,
    "- description: deskripsi singkat transaksi berdasarkan teks user.",
    "- needsClarification: true jika amount, type, atau category tidak bisa ditentukan dengan yakin dari teks user. JANGAN PERNAH menebak kategori atau nominal asal-asalan.",
    "- clarificationQuestion: kalau needsClarification true, isi pertanyaan singkat dalam Bahasa Indonesia untuk menanyakan info yang kurang. Kalau needsClarification false, isi null.",
    "",
    "Field yang belum bisa dipastikan wajib diisi null, jangan mengarang nilai.",
    "Balas HANYA dalam format JSON sesuai schema, tanpa teks tambahan apa pun.",
  ].join("\n");
}
