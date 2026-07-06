"use client";

import { useAuth } from "@/hooks/useAuth";
import { useIncome } from "./hooks/useIncome";
import { useExpense } from "./hooks/useExpense";
import {
  SisaSaldoCard,
  TotalPemasukanCard,
  TotalPengeluaranCard,
} from "./components/CardDashboard";

export default function Page() {
  const { user } = useAuth();
  const { income } = useIncome();
  const { expense } = useExpense();

  return (
    <>
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl font-bold">Ringkasan Finansial</h1>
        <h1 className="text-md text-gray-500">Pantau arus kas dan dapatkan wawasan AI.</h1>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SisaSaldoCard balance={user?.balance ?? 0} />
        <TotalPemasukanCard income={income} />
        <TotalPengeluaranCard expense={expense} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-4">
          <h2 className="mb-4 text-xl font-bold text-slate-900">AI Advisor</h2>
          <p className="text-center text-slate-400">Coming Soon</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-8">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Transaksi Terakhir</h2>
          <p className="text-center text-slate-400">Coming Soon</p>
        </div>
      </div>
    </>
  );
}
