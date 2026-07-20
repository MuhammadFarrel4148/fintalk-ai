import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Page from "../page";

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <Page />
    </QueryClientProvider>
  );
}

function mockFetchByUrl(
  responses: Record<string, { ok: boolean; data?: unknown; error?: unknown }>
) {
  global.fetch = vi.fn((input: RequestInfo | URL) => {
    const url = input.toString();
    const match = Object.entries(responses).find(([key]) => url.includes(key));
    const response = match?.[1] ?? { ok: false, data: null };

    return Promise.resolve({
      ok: response.ok,
      json: async () => ({ data: response.data, error: response.error }),
    } as Response);
  }) as typeof fetch;
}

describe("Advisor page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the greeting and the required disclaimer", async () => {
    mockFetchByUrl({
      "/auth/me": { ok: true, data: { id: "1", email: "budi@example.com", balance: 0 } },
    });

    renderPage();

    expect(await screen.findByText("Halo, budi.")).toBeInTheDocument();
    expect(
      screen.getByText(
        "FinTalk AI memberikan insight berdasarkan data transaksimu, bukan nasihat keuangan profesional."
      )
    ).toBeInTheDocument();
  });

  it("sends a message and renders the assistant's reply", async () => {
    const user = userEvent.setup();
    mockFetchByUrl({
      "/auth/me": { ok: true, data: { id: "1", email: "budi@example.com", balance: 0 } },
      "/advisor/chat": {
        ok: true,
        data: { reply: "Pengeluaranmu naik 12% dibanding bulan lalu." },
      },
    });

    renderPage();

    const input = await screen.findByPlaceholderText("Tanya AI soal keuanganmu...");
    await user.type(input, "Gimana pengeluaranku bulan ini?");
    await user.click(screen.getByRole("button", { name: "Kirim pesan" }));

    expect(await screen.findByText("Gimana pengeluaranku bulan ini?")).toBeInTheDocument();
    expect(
      await screen.findByText("Pengeluaranmu naik 12% dibanding bulan lalu.")
    ).toBeInTheDocument();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/advisor/chat"),
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ message: "Gimana pengeluaranku bulan ini?" }),
      })
    );
  });
});
