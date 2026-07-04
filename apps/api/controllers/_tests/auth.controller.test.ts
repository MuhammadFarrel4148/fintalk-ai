import { describe, it, expect, vi, afterEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { authController } from "../auth.controller";
import { authService } from "../../services/auth.service";

vi.mock("../../services/auth.service", () => ({
  authService: { login: vi.fn() },
}));

function mockRes() {
  const res = {} as Response;
  res.cookie = vi.fn().mockReturnValue(res);
  res.clearCookie = vi.fn().mockReturnValue(res);
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("authController.login", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("calls authService.login with email/password from req.body", async () => {
    const user = { id: "1", email: "a@b.com" };
    vi.mocked(authService.login).mockResolvedValue({ token: "signed-token", user });
    const req = { body: { email: "a@b.com", password: "correct" } } as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    await authController.login(req, res, next);

    expect(authService.login).toHaveBeenCalledWith("a@b.com", "correct");
  });

  it("sets a non-secure token cookie and responds 200 with the user outside production", async () => {
    process.env.NODE_ENV = "test";
    const user = { id: "1", email: "a@b.com" };
    vi.mocked(authService.login).mockResolvedValue({ token: "signed-token", user });
    const req = { body: { email: "a@b.com", password: "correct" } } as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    await authController.login(req, res, next);

    expect(res.cookie).toHaveBeenCalledWith("token", "signed-token", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 7 * 60 * 60 * 1000,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: user });
  });

  it("sets a secure cookie in production", async () => {
    process.env.NODE_ENV = "production";
    const user = { id: "1", email: "a@b.com" };
    vi.mocked(authService.login).mockResolvedValue({ token: "signed-token", user });
    const req = { body: { email: "a@b.com", password: "correct" } } as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    await authController.login(req, res, next);

    expect(res.cookie).toHaveBeenCalledWith(
      "token",
      "signed-token",
      expect.objectContaining({ secure: true })
    );
  });

  it("forwards a rejected authService.login to next without responding", async () => {
    const error = new Error("Email atau password salah");
    vi.mocked(authService.login).mockRejectedValue(error);
    const req = { body: { email: "a@b.com", password: "wrong" } } as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    await authController.login(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.cookie).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});

describe("authController.logout", () => {
  it("clears the token cookie and responds 200 with null data", () => {
    const req = {} as Request;
    const res = mockRes();

    authController.logout(req, res);

    expect(res.clearCookie).toHaveBeenCalledWith("token");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: null });
  });
});

describe("authController.me", () => {
  it("responds 200 with req.user", () => {
    const user = { id: "1", email: "a@b.com" };
    const req = { user } as Request;
    const res = mockRes();

    authController.me(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: user });
  });
});
