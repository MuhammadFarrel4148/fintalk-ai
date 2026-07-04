"use client";

import { Mail, Lock } from "lucide-react";
import InputForm from "./InputForm";
import { useState } from "react";
import { useLogin } from "../hooks/useLogin";

export default function MainContent() {
  const [inputEmail, setInputEmail] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const { login, isPending, errorMessage } = useLogin();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    login(inputEmail, inputPassword);
  }

  return (
    <main className="flex flex-grow items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-3xl font-semibold text-slate-900">Selamat Datang</h1>
          <p className="text-base text-slate-500">Masuk untuk melanjutkan ke FinTalk.ai</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <InputForm
            label="email"
            title="Email"
            logoUrl={
              <Mail className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" size={18} />
            }
            placeholder="nama@email.com"
            onChangeInput={setInputEmail}
            value={inputEmail}
          />

          <InputForm
            label="password"
            title="Password"
            logoUrl={
              <Lock className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" size={18} />
            }
            placeholder="••••••••"
            onChangeInput={setInputPassword}
            value={inputPassword}
          />

          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 accent-blue-600"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-500">
              Ingat Saya
            </label>
          </div>

          {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="mt-6 flex w-full justify-center rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
          >
            {isPending ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
    </main>
  );
}
