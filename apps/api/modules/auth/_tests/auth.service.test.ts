import { describe, it, expect, vi } from "vitest";
import { authService } from "../auth.service";
import { authRepository } from "../auth.repository";

vi.mock("../auth.repository", () => ({
  authRepository: { findUserByEmail: vi.fn(), findUserById: vi.fn() },
}));

describe("authService.login", () => {
  it("throws 401 when user not found", async () => {
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null);
    await expect(authService.login("a@b.com", "x")).rejects.toMatchObject({ statusCode: 401 });
  });

  it("throws 401 on password mismatch", async () => {
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue({
      id: "1",
      email: "a@b.com",
      password: "correct",
    } as never);
    await expect(authService.login("a@b.com", "wrong")).rejects.toMatchObject({ statusCode: 401 });
  });

  it("returns token + user on success", async () => {
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue({
      id: "1",
      email: "a@b.com",
      password: "correct",
    } as never);
    const result = await authService.login("a@b.com", "correct");
    expect(result.user).toEqual({ id: "1", email: "a@b.com" });
    expect(result.token).toEqual(expect.any(String));
  });
});

describe("authService.me", () => {
  it("throws 404 when user not found", async () => {
    vi.mocked(authRepository.findUserById).mockResolvedValue(null);
    await expect(authService.me("1")).rejects.toMatchObject({ statusCode: 404 });
  });

  it("returns id/email/balance with the Decimal balance converted to a number", async () => {
    vi.mocked(authRepository.findUserById).mockResolvedValue({
      id: "1",
      email: "a@b.com",
      balance: "5000000.00",
    } as never);

    const result = await authService.me("1");

    expect(result).toEqual({ id: "1", email: "a@b.com", balance: 5000000 });
    expect(typeof result.balance).toBe("number");
  });
});
