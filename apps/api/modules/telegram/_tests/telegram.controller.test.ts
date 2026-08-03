import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { telegramController } from "../telegram.controller";
import { telegramService } from "../telegram.service";
import { telegramClient } from "../../../lib/telegram";

vi.mock("../telegram.service", () => ({
  telegramService: { handleUpdate: vi.fn() },
}));
vi.mock("../../../lib/telegram", () => ({
  telegramClient: { sendMessage: vi.fn(), setWebhook: vi.fn() },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

function mockRes() {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("telegramController.webhook", () => {
  it("calls telegramService.handleUpdate with the parsed body and responds 200", async () => {
    vi.mocked(telegramService.handleUpdate).mockResolvedValue(undefined);
    const update = { message: { message_id: 1, from: { id: 1 }, chat: { id: 2 }, text: "hi" } };
    const req = { body: update } as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    await telegramController.webhook(req, res, next);

    expect(telegramService.handleUpdate).toHaveBeenCalledWith(update);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: null });
  });

  it("still responds 200 and notifies the user when handleUpdate throws", async () => {
    vi.mocked(telegramService.handleUpdate).mockRejectedValue(new Error("boom"));
    vi.mocked(telegramClient.sendMessage).mockResolvedValue(undefined);
    const update = { message: { message_id: 1, from: { id: 1 }, chat: { id: 2 }, text: "hi" } };
    const req = { body: update } as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    await telegramController.webhook(req, res, next);

    expect(telegramClient.sendMessage).toHaveBeenCalledWith(
      2,
      expect.stringContaining("kesalahan")
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(next).not.toHaveBeenCalled();
  });

  it("does not attempt to notify the user when there is no chat id to reply to", async () => {
    vi.mocked(telegramService.handleUpdate).mockRejectedValue(new Error("boom"));
    const req = { body: {} } as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    await telegramController.webhook(req, res, next);

    expect(telegramClient.sendMessage).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
