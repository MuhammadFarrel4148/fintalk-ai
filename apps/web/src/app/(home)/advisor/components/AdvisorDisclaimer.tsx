import { Info } from "lucide-react";

export function AdvisorDisclaimer() {
  return (
    <p className="mt-3 flex items-center justify-center gap-1 text-center text-xs text-slate-400">
      <Info size={12} />
      FinTalk AI memberikan insight berdasarkan data transaksimu, bukan nasihat keuangan
      profesional.
    </p>
  );
}
