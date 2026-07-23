import { CategoryIcon } from "@/components/CategoryIcon";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { RecentTransaction } from "../hooks/useRecentTransactions";

export default function TableTransactions({ transactions, isLoading }: TableTransactionsProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="text-md font-semibold text-slate-400">
            <th>Kategori</th>
            <th>Keterangan</th>
            <th>Tanggal</th>
            <th>Jumlah</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan={4} className="py-4 text-center text-slate-400">
                Memuat transaksi...
              </td>
            </tr>
          )}
          {!isLoading && transactions.length === 0 && (
            <tr>
              <td colSpan={4} className="py-4 text-center text-slate-400">
                Belum ada transaksi
              </td>
            </tr>
          )}
          {!isLoading &&
            transactions.map((transaction) => (
              <tr key={transaction.id} className="text-md">
                <td className="py-3">
                  <CategoryIcon categoryName={transaction.category.name} />
                </td>
                <td className="py-3">{transaction.description}</td>
                <td className="py-3">
                  {format(new Date(transaction.date), "d MMM yyyy", { locale: id })}
                </td>
                <td
                  className={
                    transaction.type === "income" ? "py-4 text-emerald-600" : "py-3 text-red-600"
                  }
                >
                  {transaction.type === "income" ? "+ " : "- "}
                  {formatCurrency(transaction.amount)}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

interface TableTransactionsProps {
  transactions: RecentTransaction[];
  isLoading: boolean;
}
