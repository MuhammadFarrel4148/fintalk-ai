import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app";

describe("GET /", () => {
  it("returns 200 with a greeting", async () => {
    const res = await request(app).get("/");

    expect(res.status).toBe(200);
    expect(res.text).toBe("Hello World!!");
  });
});
