import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../app";
import { prisma } from "../lib/prisma";

const testUser = {
  email: "transactions-test@fintalk.ai",
  password: "test-password-123",
};

let userId: string;
let categoryId: string;
let cookie: string;

beforeAll(async () => {
  await prisma.user.deleteMany({ where: { email: testUser.email } });
  const user = await prisma.user.create({ data: testUser });
  userId = user.id;

  const category = await prisma.category.create({
    data: { name: "Transactions Test Category", userId, isDefault: false },
  });
  categoryId = category.id;

  await prisma.transaction.createMany({
    data: [
      {
        userId,
        categoryId,
        amount: 5000000,
        type: "income",
        transactionDate: new Date(),
        source: "manual",
      },
      {
        userId,
        categoryId,
        amount: 1500000,
        type: "income",
        transactionDate: new Date(),
        source: "manual",
      },
      {
        userId,
        categoryId,
        amount: 750000,
        type: "expense",
        transactionDate: new Date(),
        source: "manual",
      },
      {
        userId,
        categoryId,
        amount: 750000,
        type: "expense",
        transactionDate: new Date(),
        source: "manual",
      },
    ],
  });

  const loginRes = await request(app).post("/api/auth/login").send(testUser);
  cookie = loginRes.headers["set-cookie"][0];
});

afterAll(async () => {
  await prisma.transaction.deleteMany({ where: { userId } });
  await prisma.category.delete({ where: { id: categoryId } });
  await prisma.user.delete({ where: { id: userId } });
  await prisma.$disconnect();
});

describe("GET /api/transactions/income", () => {
  it("returns 401 without a cookie", async () => {
    const res = await request(app).get("/api/transactions/income");
    expect(res.status).toBe(401);
  });

  it("returns the total income for the authenticated user", async () => {
    const res = await request(app).get("/api/transactions/income").set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ total: 6500000 });
  });
});

describe("GET /api/transactions/expense", () => {
  it("returns 401 without a cookie", async () => {
    const res = await request(app).get("/api/transactions/expense");
    expect(res.status).toBe(401);
  });

  it("returns the total expense for the authenticated user", async () => {
    const res = await request(app).get("/api/transactions/expense").set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ total: 1500000 });
  });
});
