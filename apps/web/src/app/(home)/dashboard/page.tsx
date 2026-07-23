"use client";

import { useAuth } from "@/hooks/useAuth";
import { useIncome } from "./hooks/useIncome";
import { useExpense } from "./hooks/useExpense";
import {
  SisaSaldoCard,
  TotalPemasukanCard,
  TotalPengeluaranCard,
} from "./components/CardDashboard";
import { Bot, Lightbulb, OctagonAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRecentTransactions } from "./hooks/useRecentTransactions";

import TableTransactions from "./components/TableTransactions";

export default function Page() {
  const { user } = useAuth();
  const { income } = useIncome();
  const { expense } = useExpense();
  const router = useRouter();

  const { transactions, isLoading } = useRecentTransactions();

  const onClickAdvisor = () => {
    router.push("/advisor");
  };

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
        <div className="flex flex-col rounded-xl border border-slate-200 bg-blue-100 p-6 shadow-sm lg:col-span-4">
          <div className="flex gap-2">
            <Bot size={28} className="text-blue-600" />
            <h2 className="mb-4 text-xl font-bold text-blue-600">AI Advisor</h2>
          </div>
          <div className="mb-5 flex flex-col gap-4">
            <div className="flex items-center gap-2 rounded-xl bg-white p-2">
              <Lightbulb size={28} className="text-blue-600" />
              <p>Tanyakan masalah finansialmu kepada Advisor AI</p>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white p-2">
              <OctagonAlert size={50} className="text-red-600" />
              <p>
                Advisor AI bukan sebagai penasihat, melainkan memberikan ide sesuai dengan finansial
                yang kamu alami
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClickAdvisor}
            className="mt-auto w-full cursor-pointer rounded-xl bg-blue-200 p-2 text-blue-600 transition duration-400 ease-in-out hover:bg-blue-600 hover:text-white"
          >
            Tanya Advisor Fintalk
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-8">
          <div className="flex justify-between">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Transaksi Terakhir</h2>
            <a href="/transactions" className="cursor-pointer text-blue-600 hover:text-blue-800">
              Lihat semua
            </a>
          </div>
          <TableTransactions transactions={transactions} isLoading={isLoading} />
        </div>
      </div>
    </>
  );
}
