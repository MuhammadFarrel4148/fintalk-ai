import { getLastNMonthsRange, toDateOnly } from "../../lib/dateRange.js";
import { transactionsService } from "../transactions/transactions.service.js";
import { geminiClient } from "../../lib/gemini.js";
import { ExternalServiceError } from "../../exceptions/ExternalServiceError.js";

const ADVISOR_WINDOW_MONTHS = 3;
const GEMINI_MODEL = "gemini-3.5-flash";

type MonthlySummary = Awaited<ReturnType<typeof transactionsService.getMonthlySummary>>;
type CategoryBreakdown = Awaited<ReturnType<typeof transactionsService.getCategoryBreakdown>>;

export const advisorService = {
  async buildContext(userId: string): Promise<string> {
    const { from, to } = getLastNMonthsRange(ADVISOR_WINDOW_MONTHS);

    const [monthlySummary, categoryBreakdown] = await Promise.all([
      transactionsService.getMonthlySummary(userId, { months: ADVISOR_WINDOW_MONTHS }),
      transactionsService.getCategoryBreakdown(userId, {
        from: toDateOnly(from),
        to: toDateOnly(to),
      }),
    ]);

    return formatContext(monthlySummary, categoryBreakdown);
  },

  async chatMessage(userId: string, message: string): Promise<{ reply: string }> {
    const context = await advisorService.buildContext(userId);

    let interaction;
    try {
      interaction = await geminiClient.models.generateContent({
        model: GEMINI_MODEL,
        contents: message,
        config: { systemInstruction: buildSystemPrompt(context) },
      });
    } catch {
      throw new ExternalServiceError("Gagal menghubungi advisor, coba lagi!");
    }

    const reply = interaction.text;

    if (!reply) {
      throw new ExternalServiceError("AI Advisor tidak memberikan jawaban, coba lagi!");
    }

    return { reply };
  },
};

function formatContext(monthly: MonthlySummary, breakdown: CategoryBreakdown): string {
  const hasAnyActivity = monthly.months.some((m) => m.income > 0 || m.expense > 0);

  if (!hasAnyActivity) {
    return "Belum ada transaksi tercatat dalam 3 bulan terakhir.";
  }

  const first = monthly.months[0];
  const last = monthly.months[monthly.months.length - 1];
  const windowLabel = `${first.label} ${first.month.slice(0, 4)} - ${last.label} ${last.month.slice(0, 4)}`;

  const monthLines = monthly.months.map((m) => {
    const diff = m.income - m.expense;
    const sign = diff >= 0 ? "+" : "-";
    return `- ${m.label} ${m.month.slice(0, 4)}: pemasukan ${formatRupiah(m.income)}, pengeluaran ${formatRupiah(m.expense)} (selisih ${sign}${formatRupiah(Math.abs(diff))})`;
  });

  const totalIncome = monthly.months.reduce((sum, m) => sum + m.income, 0);
  const totalExpense = monthly.months.reduce((sum, m) => sum + m.expense, 0);

  const categorySection =
    breakdown.categories.length === 0
      ? "Tidak ada pengeluaran tercatat pada periode ini."
      : breakdown.categories
          .map(
            (c) =>
              `- ${c.categoryName}: ${formatRupiah(c.amount)} (${c.percentage.toFixed(1)}%, ${c.transactionCount} transaksi)`
          )
          .join("\n");

  return [
    `Ringkasan keuangan 3 bulan terakhir (${windowLabel}):`,
    "",
    "Pemasukan & pengeluaran per bulan:",
    ...monthLines,
    "",
    `Total 3 bulan: pemasukan ${formatRupiah(totalIncome)}, pengeluaran ${formatRupiah(totalExpense)}`,
    "",
    `Rincian pengeluaran per kategori (total ${formatRupiah(breakdown.totalExpense)}):`,
    categorySection,
  ].join("\n");
}

function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function buildSystemPrompt(context: string): string {
  return [
    "Kamu adalah AI Advisor FinTalk, asisten yang membantu pengguna memahami kondisi keuangan pribadinya berdasarkan data transaksi mereka.",
    "",
    "Aturan yang wajib diikuti:",
    '- Jawaban HARUS berupa observasi berbasis data historis yang diberikan di bawah (contoh: "pengeluaran makananmu naik 12% dibanding bulan lalu").',
    '- JANGAN PERNAH memberi nasihat investasi atau rekomendasi finansial preskriptif (contoh: "kamu sebaiknya investasi di X" atau perintah eksplisit "kurangi/tambah pengeluaran Y").',
    "- Jika pertanyaan user di luar topik keuangan pribadinya, arahkan kembali dengan sopan ke topik data keuangannya.",
    "- Jawab singkat, jelas, dan dalam Bahasa Indonesia.",
    "- Tulis dalam paragraf teks polos saja, TANPA format markdown (jangan pakai **, *, #, atau penomoran list).",
    "",
    "Data keuangan pengguna (3 bulan terakhir):",
    context,
  ].join("\n");
}
