import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../app";
import { prisma } from "../lib/prisma";

const testUser = {
  email: "auth-test@fintalk.ai",
  password: "test-password-123",
};

beforeAll(async () => {
  await prisma.user.deleteMany({ where: { email: testUser.email } });
  await prisma.user.create({ data: testUser });
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: testUser.email } });
  await prisma.$disconnect();
});

describe("POST /api/auth/login", () => {
  it("returns 200 and sets a token cookie on correct credentials", async () => {
    const res = await request(app).post("/api/auth/login").send(testUser);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ id: expect.any(String), email: testUser.email });
    expect(res.headers["set-cookie"]?.[0]).toMatch(/^token=/);
  });

  it("returns 401 on wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ ...testUser, password: "wrong" });

    expect(res.status).toBe(401);
  });

  it("returns 422 on invalid body", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "not-an-email" });

    expect(res.status).toBe(422);
  });
});

describe("GET /api/auth/me", () => {
  it("returns 401 without a cookie", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("returns the user when authenticated", async () => {
    const loginRes = await request(app).post("/api/auth/login").send(testUser);
    const cookie = loginRes.headers["set-cookie"][0];

    const res = await request(app).get("/api/auth/me").set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ id: expect.any(String), email: testUser.email });
  });
});

describe("POST /api/auth/logout", () => {
  it("clears the cookie", async () => {
    const res = await request(app).post("/api/auth/logout");
    expect(res.status).toBe(200);
    expect(res.headers["set-cookie"]?.[0]).toMatch(/^token=;/);
  });
});
