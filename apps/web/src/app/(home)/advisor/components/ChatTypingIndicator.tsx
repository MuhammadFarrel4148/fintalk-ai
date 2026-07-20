import { Bot } from "lucide-react";

export function ChatTypingIndicator() {
  return (
    <div className="flex items-start gap-3 opacity-70">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
        <Bot size={18} />
      </div>
      <div className="flex items-center gap-2 pt-1.5 text-sm text-slate-400 italic">
        Menganalisis data transaksimu...
        <span className="flex gap-1">
          <span
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600"
            style={{ animationDelay: "300ms" }}
          />
        </span>
      </div>
    </div>
  );
}
