import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Page from "../page";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

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

function mockFetchResolvedOnce(response: { ok: boolean; json: () => Promise<unknown> }) {
  vi.mocked(global.fetch).mockResolvedValueOnce(response as Response);
}

describe("Login page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("renders email/password fields and an enabled submit button", () => {
    renderPage();

    expect(screen.getByPlaceholderText("nama@email.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();

    const button = screen.getByRole("button", { name: "Masuk" });
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
  });

  it("updates input values as the user types", async () => {
    const user = userEvent.setup();
    renderPage();

    const emailInput = screen.getByPlaceholderText("nama@email.com") as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText("••••••••") as HTMLInputElement;

    await user.type(emailInput, "user@example.com");
    await user.type(passwordInput, "secret123");

    expect(emailInput.value).toBe("user@example.com");
    expect(passwordInput.value).toBe("secret123");
  });

  it("submits credentials and redirects to / on success", async () => {
    const user = userEvent.setup();
    mockFetchResolvedOnce({
      ok: true,
      json: async () => ({ data: { id: "1", email: "user@example.com" } }),
    });
    renderPage();

    await user.type(screen.getByPlaceholderText("nama@email.com"), "user@example.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "secret123");
    await user.click(screen.getByRole("button", { name: "Masuk" }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/"));

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/auth/login"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "user@example.com", password: "secret123" }),
      })
    );
  });

  it("shows the server error message and does not redirect on failed login", async () => {
    const user = userEvent.setup();
    mockFetchResolvedOnce({
      ok: false,
      json: async () => ({ error: { message: "Email atau password salah" } }),
    });
    renderPage();

    await user.type(screen.getByPlaceholderText("nama@email.com"), "user@example.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "wrongpass");
    await user.click(screen.getByRole("button", { name: "Masuk" }));

    expect(await screen.findByText("Email atau password salah")).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("shows a generic connection error message when fetch throws", async () => {
    const user = userEvent.setup();
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error("network down"));
    renderPage();

    await user.type(screen.getByPlaceholderText("nama@email.com"), "user@example.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "secret123");
    await user.click(screen.getByRole("button", { name: "Masuk" }));

    expect(await screen.findByText("Tidak dapat terhubung ke server.")).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("disables the submit button and shows loading text while pending", async () => {
    const user = userEvent.setup();
    let resolveFetch: (value: { ok: boolean; json: () => Promise<unknown> }) => void;
    const pendingFetch = new Promise<{ ok: boolean; json: () => Promise<unknown> }>((resolve) => {
      resolveFetch = resolve;
    });
    vi.mocked(global.fetch).mockReturnValueOnce(pendingFetch as unknown as Promise<Response>);
    renderPage();

    await user.type(screen.getByPlaceholderText("nama@email.com"), "user@example.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "secret123");
    await user.click(screen.getByRole("button", { name: "Masuk" }));

    const button = await screen.findByRole("button", { name: "Memproses..." });
    expect(button).toBeDisabled();

    resolveFetch!({
      ok: true,
      json: async () => ({ data: { id: "1", email: "user@example.com" } }),
    });

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/"));
  });
});
