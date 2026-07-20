import { describe, it, expect, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { advisorController } from "../advisor.controller";
import { advisorService } from "../advisor.service";

vi.mock("../advisor.service", () => ({
  advisorService: { chatMessage: vi.fn() },
}));

function mockRes() {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("advisorController.chatMessage", () => {
  it("calls advisorService.chatMessage with the user id and message, and responds 200 with the reply", async () => {
    vi.mocked(advisorService.chatMessage).mockResolvedValue({ reply: "Halo!" });
    const req = { user: { id: "user-1" }, body: { message: "Gimana pengeluaranku?" } } as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    await advisorController.chatMessage(req, res, next);

    expect(advisorService.chatMessage).toHaveBeenCalledWith("user-1", "Gimana pengeluaranku?");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: { reply: "Halo!" } });
  });

  it("forwards a rejected advisorService.chatMessage to next without responding", async () => {
    const error = new Error("Gagal menghubungi advisor, coba lagi!");
    vi.mocked(advisorService.chatMessage).mockRejectedValue(error);
    const req = { user: { id: "user-1" }, body: { message: "halo" } } as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    await advisorController.chatMessage(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.json).not.toHaveBeenCalled();
  });
});
