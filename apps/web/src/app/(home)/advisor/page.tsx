"use client";

import { useEffect, useRef } from "react";
import { Bot } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useAdvisorChat } from "./hooks/useAdvisorChat";
import { ChatMessageBubble } from "./components/ChatMessageBubble";
import { ChatTypingIndicator } from "./components/ChatTypingIndicator";
import { ChatInput } from "./components/ChatInput";
import { AdvisorDisclaimer } from "./components/AdvisorDisclaimer";

export default function Page() {
  const { user } = useAuth();
  const { messages, sendMessage, isPending } = useAdvisorChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView?.({ behavior: "smooth" });
  }, [messages.length, isPending]);

  const displayName = user?.email ? user.email.split("@")[0] : "";

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6 shrink-0 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
          <Bot size={28} className="text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          Halo{displayName ? `, ${displayName}` : ""}.
        </h1>
        <p className="mt-1 text-slate-500">
          Saya AI Advisor FinTalk. Mari bahas kondisi keuanganmu hari ini.
        </p>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto">
        {messages.map((message) => (
          <ChatMessageBubble key={message.id} message={message} />
        ))}
        {isPending && <ChatTypingIndicator />}
        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 pt-4">
        <ChatInput onSend={sendMessage} disabled={isPending} />
        <AdvisorDisclaimer />
      </div>
    </div>
  );
}
