import { ArrowUp, ArrowDown } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";
import { CategoryBadge } from "./CategoryBadge";

interface TransactionRow {
  id: string;
  date: string;
  description: string | null;
  category: { id: string; name: string };
  amount: number;
  type: "income" | "expense";
}

export function TransactionsTable({
  transactions,
  isLoading,
}: {
  transactions: TransactionRow[];
  isLoading: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-6 py-4 text-xs font-medium tracking-wide text-slate-500 uppercase">
                Tanggal
              </th>
              <th className="px-6 py-4 text-xs font-medium tracking-wide text-slate-500 uppercase">
                Deskripsi
              </th>
              <th className="px-6 py-4 text-xs font-medium tracking-wide text-slate-500 uppercase">
                Kategori
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium tracking-wide text-slate-500 uppercase">
                Nominal
              </th>
              <th className="px-6 py-4 text-center text-xs font-medium tracking-wide text-slate-500 uppercase">
                Tipe
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                  Memuat transaksi...
                </td>
              </tr>
            )}
            {!isLoading && transactions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                  Tidak ada transaksi
                </td>
              </tr>
            )}
            {!isLoading &&
              transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-600">
                    {format(new Date(tx.date), "d MMM yyyy", { locale: id })}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{tx.description}</td>
                  <td className="px-6 py-4">
                    <CategoryBadge name={tx.category.name} />
                  </td>
                  <td
                    className={`px-6 py-4 text-right text-sm font-medium whitespace-nowrap ${
                      tx.type === "income" ? "text-emerald-600" : "text-slate-900"
                    }`}
                  >
                    {tx.type === "income"
                      ? `+ ${formatCurrency(tx.amount)}`
                      : formatCurrency(tx.amount)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {tx.type === "expense" ? (
                      <ArrowUp size={16} className="mx-auto text-red-600" aria-label="Keluar" />
                    ) : (
                      <ArrowDown
                        size={16}
                        className="mx-auto text-emerald-600"
                        aria-label="Masuk"
                      />
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
