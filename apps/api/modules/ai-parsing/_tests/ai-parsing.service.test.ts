import { describe, it, expect, vi, afterEach } from "vitest";
import { aiParsingService } from "../ai-parsing.service";
import { aiParsingRepository } from "../ai-parsing.repository";
import { geminiClient } from "../../../lib/gemini";

vi.mock("../ai-parsing.repository", () => ({
  aiParsingRepository: { listDefaultCategories: vi.fn() },
}));

vi.mock("../../../lib/gemini", () => ({
  geminiClient: { models: { generateContent: vi.fn() } },
}));

const CATEGORIES = [
  { id: "cat-transport", name: "Transportasi" },
  { id: "cat-food", name: "Makanan & Minuman" },
  { id: "cat-lain", name: "Lain-lain" },
];

function mockGeminiOnce(payload: unknown) {
  vi.mocked(geminiClient.models.generateContent).mockResolvedValueOnce({
    text: JSON.stringify(payload),
  } as never);
}

describe("aiParsingService.parseTransactionText", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns a resolved transaction when Gemini returns complete, valid data", async () => {
    vi.mocked(aiParsingRepository.listDefaultCategories).mockResolvedValue(CATEGORIES as never);
    mockGeminiOnce({
      amount: 50000,
      type: "expense",
      category: "Transportasi",
      description: "beli bensin",
      needsClarification: false,
      clarificationQuestion: null,
    });

    const result = await aiParsingService.parseTransactionText("beli bensin 50rb");

    expect(result).toEqual({
      needsClarification: false,
      transaction: {
        amount: 50000,
        type: "expense",
        categoryId: "cat-transport",
        categoryName: "Transportasi",
        description: "beli bensin",
      },
    });
  });

  it("injects the category names from the repository into the system prompt", async () => {
    vi.mocked(aiParsingRepository.listDefaultCategories).mockResolvedValue(CATEGORIES as never);
    mockGeminiOnce({
      amount: 50000,
      type: "expense",
      category: "Transportasi",
      description: "beli bensin",
      needsClarification: false,
      clarificationQuestion: null,
    });

    await aiParsingService.parseTransactionText("beli bensin 50rb");

    expect(geminiClient.models.generateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        contents: "beli bensin 50rb",
        config: expect.objectContaining({
          systemInstruction: expect.stringContaining("Transportasi, Makanan & Minuman, Lain-lain"),
          responseMimeType: "application/json",
        }),
      })
    );
  });

  it("returns needsClarification when Gemini flags it, using its clarificationQuestion", async () => {
    vi.mocked(aiParsingRepository.listDefaultCategories).mockResolvedValue(CATEGORIES as never);
    mockGeminiOnce({
      amount: 50000,
      type: "expense",
      category: null,
      description: "bayar",
      needsClarification: true,
      clarificationQuestion: "Ini buat bayar apa ya?",
    });

    const result = await aiParsingService.parseTransactionText("bayar 50rb");

    expect(result).toEqual({
      needsClarification: true,
      question: "Ini buat bayar apa ya?",
      partial: {
        amount: 50000,
        type: "expense",
        category: null,
        description: "bayar",
        needsClarification: true,
        clarificationQuestion: "Ini buat bayar apa ya?",
      },
    });
  });

  it("treats a category not in the known list as needing clarification, even if Gemini marked it complete", async () => {
    vi.mocked(aiParsingRepository.listDefaultCategories).mockResolvedValue(CATEGORIES as never);
    mockGeminiOnce({
      amount: 50000,
      type: "expense",
      category: "Kategori Ngarang",
      description: "beli sesuatu",
      needsClarification: false,
      clarificationQuestion: null,
    });

    const result = await aiParsingService.parseTransactionText("beli sesuatu 50rb");

    expect(result.needsClarification).toBe(true);
  });

  it("retries once on a Gemini failure before succeeding", async () => {
    vi.mocked(aiParsingRepository.listDefaultCategories).mockResolvedValue(CATEGORIES as never);
    vi.mocked(geminiClient.models.generateContent)
      .mockRejectedValueOnce(new Error("timeout"))
      .mockResolvedValueOnce({
        text: JSON.stringify({
          amount: 50000,
          type: "expense",
          category: "Transportasi",
          description: "beli bensin",
          needsClarification: false,
          clarificationQuestion: null,
        }),
      } as never);

    const result = await aiParsingService.parseTransactionText("beli bensin 50rb");

    expect(geminiClient.models.generateContent).toHaveBeenCalledTimes(2);
    expect(result.needsClarification).toBe(false);
  });

  it("throws ExternalServiceError after two consecutive Gemini failures", async () => {
    vi.mocked(aiParsingRepository.listDefaultCategories).mockResolvedValue(CATEGORIES as never);
    vi.mocked(geminiClient.models.generateContent).mockRejectedValue(new Error("timeout"));

    await expect(aiParsingService.parseTransactionText("beli bensin 50rb")).rejects.toMatchObject({
      statusCode: 502,
    });
    expect(geminiClient.models.generateContent).toHaveBeenCalledTimes(2);
  });
});
