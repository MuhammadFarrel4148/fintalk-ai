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
let category2Id: string;
let cookie: string;

beforeAll(async () => {
  await prisma.user.deleteMany({ where: { email: testUser.email } });
  const user = await prisma.user.create({ data: testUser });
  userId = user.id;

  const category = await prisma.category.create({
    data: { name: "Transactions Test Category", userId, isDefault: false },
  });
  categoryId = category.id;

  const category2 = await prisma.category.create({
    data: { name: "Transactions Test Category 2", userId, isDefault: false },
  });
  category2Id = category2.id;

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
      {
        userId,
        categoryId: category2Id,
        amount: 500000,
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
  await prisma.category.delete({ where: { id: category2Id } });
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
    expect(res.body.data).toEqual({ total: 2000000 });
  });
});

describe("GET /api/transactions/analytics/category-breakdown", () => {
  it("returns 401 without a cookie", async () => {
    const res = await request(app).get("/api/transactions/analytics/category-breakdown");
    expect(res.status).toBe(401);
  });

  it("returns the expense breakdown by category for the current month", async () => {
    const res = await request(app)
      .get("/api/transactions/analytics/category-breakdown")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.data.totalExpense).toBe(2000000);
    expect(res.body.data.categories).toEqual(
      expect.arrayContaining([
        {
          categoryId,
          categoryName: "Transactions Test Category",
          amount: 1500000,
          transactionCount: 2,
          percentage: 75,
        },
        {
          categoryId: category2Id,
          categoryName: "Transactions Test Category 2",
          amount: 500000,
          transactionCount: 1,
          percentage: 25,
        },
      ])
    );
  });
});

describe("GET /api/transactions/analytics/monthly-summary", () => {
  it("returns 401 without a cookie", async () => {
    const res = await request(app).get("/api/transactions/analytics/monthly-summary");
    expect(res.status).toBe(401);
  });

  it("returns the current month's income/expense totals when months=1", async () => {
    const res = await request(app)
      .get("/api/transactions/analytics/monthly-summary?months=1")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.data.months).toHaveLength(1);
    expect(res.body.data.months[0]).toMatchObject({ income: 6500000, expense: 2000000 });
  });
});

describe("GET /api/transactions/analytics/csv", () => {
  it("returns 401 without a cookie", async () => {
    const res = await request(app).get("/api/transactions/analytics/csv");
    expect(res.status).toBe(401);
  });

  it("returns a downloadable CSV with resolved category names for the current month", async () => {
    const res = await request(app).get("/api/transactions/analytics/csv").set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/csv");
    expect(res.headers["content-disposition"]).toBe("attachment; filename=laporan.csv");

    const rows = res.text.split("\n");
    expect(rows[0]).toBe("Kategori,Jenis Transaksi,Total Transaksi,Jumlah Transaksi");
    expect(rows).toContain("Transactions Test Category,income,6500000,2");
    expect(rows).toContain("Transactions Test Category,expense,1500000,2");
    expect(rows).toContain("Transactions Test Category 2,expense,500000,1");
  });
});
