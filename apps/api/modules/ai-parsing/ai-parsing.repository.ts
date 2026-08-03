import { prisma } from "../../lib/prisma.js";

export const aiParsingRepository = {
  listDefaultCategories() {
    return prisma.category.findMany({
      where: { userId: null },
      select: { id: true, name: true },
    });
  },
};
