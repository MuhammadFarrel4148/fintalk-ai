import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useAdvisorChat } from "../hooks/useAdvisorChat";

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

function mockFetchResolvedOnce(response: { ok: boolean; json: () => Promise<unknown> }) {
  vi.mocked(global.fetch).mockResolvedValueOnce(response as Response);
}

describe("useAdvisorChat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("appends a user message immediately when sending", () => {
    mockFetchResolvedOnce({ ok: true, json: async () => ({ data: { reply: "Halo!" } }) });
    const { result } = renderHook(() => useAdvisorChat(), { wrapper });

    act(() => {
      result.current.sendMessage("Gimana pengeluaranku bulan ini?");
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0]).toMatchObject({
      role: "user",
      content: "Gimana pengeluaranku bulan ini?",
    });
  });

  it("appends the assistant reply on a successful response", async () => {
    mockFetchResolvedOnce({
      ok: true,
      json: async () => ({ data: { reply: "Pengeluaranmu naik 12% bulan ini." } }),
    });
    const { result } = renderHook(() => useAdvisorChat(), { wrapper });

    act(() => {
      result.current.sendMessage("Gimana pengeluaranku?");
    });

    await waitFor(() => expect(result.current.messages).toHaveLength(2));
    expect(result.current.messages[1]).toMatchObject({
      role: "assistant",
      content: "Pengeluaranmu naik 12% bulan ini.",
    });
    expect(result.current.messages[1].isError).toBeFalsy();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/advisor/chat"),
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ message: "Gimana pengeluaranku?" }),
      })
    );
  });

  it("appends an error message when the server responds with a failure", async () => {
    mockFetchResolvedOnce({
      ok: false,
      json: async () => ({ error: { message: "Gagal menghubungi advisor, coba lagi!" } }),
    });
    const { result } = renderHook(() => useAdvisorChat(), { wrapper });

    act(() => {
      result.current.sendMessage("Halo");
    });

    await waitFor(() => expect(result.current.messages).toHaveLength(2));
    expect(result.current.messages[1]).toMatchObject({
      role: "assistant",
      content: "Gagal menghubungi advisor, coba lagi!",
      isError: true,
    });
  });

  it("appends a generic connection error message when fetch throws", async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error("network down"));
    const { result } = renderHook(() => useAdvisorChat(), { wrapper });

    act(() => {
      result.current.sendMessage("Halo");
    });

    await waitFor(() => expect(result.current.messages).toHaveLength(2));
    expect(result.current.messages[1]).toMatchObject({
      role: "assistant",
      content: "Tidak dapat terhubung ke server.",
      isError: true,
    });
  });

  it("ignores empty or whitespace-only messages", () => {
    const { result } = renderHook(() => useAdvisorChat(), { wrapper });

    act(() => {
      result.current.sendMessage("   ");
    });

    expect(result.current.messages).toHaveLength(0);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
