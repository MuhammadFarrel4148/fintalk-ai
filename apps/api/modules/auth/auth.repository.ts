import { prisma } from "../../lib/prisma.js";

export const authRepository = {
  findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },
};
