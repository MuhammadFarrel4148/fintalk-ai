import { Wallet, TrendingUp, TrendingDown } from "lucide-react";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function SisaSaldoCard({ balance }: { balance: number }) {
  return (
    <div className="rounded-xl border border-l-4 border-slate-200 border-l-blue-600 bg-white p-6 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-slate-500">
        <Wallet size={18} className="text-blue-600" />
        <p className="text-sm font-medium tracking-wide uppercase">Sisa Saldo</p>
      </div>
      <h3 className="text-3xl font-bold text-slate-900">{formatCurrency(balance)}</h3>
    </div>
  );
}

export function TotalPemasukanCard({ income }: { income: number }) {
  return (
    <div className="rounded-xl border border-l-4 border-slate-200 border-l-emerald-600 bg-white p-6 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-slate-500">
        <TrendingUp size={18} className="text-emerald-600" />
        <p className="text-sm font-medium tracking-wide uppercase">Total Pemasukan</p>
      </div>
      <h3 className="text-3xl font-bold text-emerald-600">{formatCurrency(income)}</h3>
    </div>
  );
}

export function TotalPengeluaranCard({ expense }: { expense: number }) {
  return (
    <div className="rounded-xl border border-l-4 border-slate-200 border-l-red-600 bg-white p-6 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-slate-500">
        <TrendingDown size={18} className="text-red-600" />
        <p className="text-sm font-medium tracking-wide uppercase">Total Pengeluaran</p>
      </div>
      <h3 className="text-3xl font-bold text-red-600">{formatCurrency(expense)}</h3>
    </div>
  );
}
