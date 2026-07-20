"use client";

import { useRef, useState } from "react";
import { ArrowUp } from "lucide-react";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }
  };

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;

    onSend(trimmed);
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow focus-within:border-blue-600/50 focus-within:shadow-md">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        rows={1}
        placeholder="Tanya AI soal keuanganmu..."
        className="flex max-h-[120px] min-h-[52px] w-full resize-none items-center justify-center rounded-2xl border-0 bg-transparent py-3.5 pr-14 pl-4 text-sm text-slate-900 placeholder-slate-400 focus:ring-0 focus:outline-none"
      />
      <div className="absolute right-2 bottom-2">
        <button
          type="button"
          onClick={submit}
          disabled={disabled || !value.trim()}
          aria-label="Kirim pesan"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white transition-colors hover:bg-blue-600/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowUp size={18} />
        </button>
      </div>
    </div>
  );
}
