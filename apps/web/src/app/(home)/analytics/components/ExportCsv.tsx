import { Download } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ExportCsvProps {
  from?: string;
  to?: string;
}

export function ExportCsv({ from, to }: ExportCsvProps) {
  const qs = new URLSearchParams();
  if (from) qs.set("from", from);
  if (to) qs.set("to", to);

  const href = `${process.env.NEXT_PUBLIC_API_URL}/api/transactions/analytics/csv?${qs}`;

  return (
    <a
      href={href}
      className={cn(
        buttonVariants({ variant: "outline", size: "lg" }),
        "justify-start border-slate-200 bg-white text-left font-normal text-slate-700 hover:bg-slate-50"
      )}
    >
      <Download className="text-slate-500" />
      Ekspor
    </a>
  );
}
