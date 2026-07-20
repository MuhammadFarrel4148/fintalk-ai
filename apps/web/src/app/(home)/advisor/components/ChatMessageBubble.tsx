import { Bot } from "lucide-react";
import type { ChatMessage } from "../hooks/useAdvisorChat";

export function ChatMessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-blue-600 px-5 py-3 text-white shadow-sm md:max-w-[70%]">
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
        <Bot size={18} />
      </div>
      <div
        className={`max-w-[85%] rounded-2xl rounded-tl-sm border px-5 py-3 shadow-sm md:max-w-[70%] ${
          message.isError
            ? "border-red-200 bg-red-50 text-red-700"
            : "border-slate-200 bg-slate-50 text-slate-800"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}
