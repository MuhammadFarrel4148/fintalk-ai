"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
}

async function sendChatMessage(message: string): Promise<string> {
  let res: Response;
  try {
    res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advisor/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ message }),
    });
  } catch {
    throw new Error("Tidak dapat terhubung ke server.");
  }

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body?.error?.message ?? "Gagal menghubungi advisor, coba lagi!");
  }

  return body.data.reply;
}

let messageIdCounter = 0;
function createMessageId() {
  messageIdCounter += 1;
  return `msg-${messageIdCounter}`;
}

export function useAdvisorChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const mutation = useMutation({
    mutationFn: sendChatMessage,
    onSuccess: (reply) => {
      setMessages((prev) => [
        ...prev,
        { id: createMessageId(), role: "assistant", content: reply },
      ]);
    },
    onError: (error: Error) => {
      setMessages((prev) => [
        ...prev,
        { id: createMessageId(), role: "assistant", content: error.message, isError: true },
      ]);
    },
  });

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { id: createMessageId(), role: "user", content: trimmed }]);
    mutation.mutate(trimmed);
  };

  return { messages, sendMessage, isPending: mutation.isPending };
}
