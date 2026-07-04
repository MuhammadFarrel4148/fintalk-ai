import { prisma } from "../lib/prisma.js";

async function main() {
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

  console.log({ superUser });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
