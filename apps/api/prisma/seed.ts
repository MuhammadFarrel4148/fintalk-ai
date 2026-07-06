import { prisma } from "../lib/prisma.js";

const EXPENSE_CATEGORIES = [
  "Makanan & Minuman",
  "Transportasi",
  "Tagihan & Utilitas",
  "Belanja",
  "Hiburan",
  "Kesehatan",
  "Pendidikan",
  "Perawatan Diri",
  "Tempat Tinggal",
  "Asuransi",
  "Cicilan/Utang",
  "Donasi",
  "Lain-lain",
];

const INCOME_CATEGORIES = [
  "Gaji",
  "Bonus/THR",
  "Freelance",
  "Investasi",
  "Hadiah",
  "Refund/Reimbursement",
  "Lain-lain",
];

async function seedDefaultCategories() {
  const categories = new Map<string, string>();

  for (const name of [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]) {
    const existing = await prisma.category.findFirst({ where: { name, userId: null } });
    const category =
      existing ?? (await prisma.category.create({ data: { name, userId: null, isDefault: true } }));
    categories.set(name, category.id);
  }

  return categories;
}

async function seedDummyTransactions(userId: string, categories: Map<string, string>) {
  const existingCount = await prisma.transaction.count({ where: { userId } });
  if (existingCount > 0) return;

  const dummyTransactions: Array<{
    category: string;
    amount: number;
    type: "income" | "expense";
    description: string;
    daysAgo: number;
  }> = [
    {
      category: "Gaji",
      amount: 5_000_000,
      type: "income",
      description: "Gaji bulanan",
      daysAgo: 5,
    },
    {
      category: "Freelance",
      amount: 1_500_000,
      type: "income",
      description: "Proyek freelance",
      daysAgo: 3,
    },
    {
      category: "Makanan & Minuman",
      amount: 750_000,
      type: "expense",
      description: "Belanja bulanan",
      daysAgo: 4,
    },
    {
      category: "Transportasi",
      amount: 300_000,
      type: "expense",
      description: "Bensin & tol",
      daysAgo: 2,
    },
    {
      category: "Tagihan & Utilitas",
      amount: 450_000,
      type: "expense",
      description: "Listrik & internet",
      daysAgo: 1,
    },
  ];

  for (const tx of dummyTransactions) {
    const categoryId = categories.get(tx.category);
    if (!categoryId) throw new Error(`Category "${tx.category}" not seeded`);

    await prisma.transaction.create({
      data: {
        userId,
        categoryId,
        amount: tx.amount,
        type: tx.type,
        description: tx.description,
        source: "manual",
        transactionDate: new Date(Date.now() - tx.daysAgo * 24 * 60 * 60 * 1000),
      },
    });
  }

  const totalIncome = dummyTransactions
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalExpense = dummyTransactions
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + tx.amount, 0);

  await prisma.user.update({
    where: { id: userId },
    data: { balance: totalIncome - totalExpense },
  });
}

async function seedDummyUsers() {
  const superUser = await prisma.user.upsert({
    where: { email: "farrel@gmail.com" },
    update: {},
    create: {
      email: "farrel@gmail.com",
      password: "farrelganteng",
      telegramId: "telegramId",
      telegramUsername: "telegramUsername",
    },
  });

  const categories = await seedDefaultCategories();
  await seedDummyTransactions(superUser.id, categories);

  console.log({ superUser });
}
seedDummyUsers()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
