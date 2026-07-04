import { UserPayload, signToken } from "../../lib/jwt.js";
import { UnauthorizedError } from "../../exceptions/index.js";
import { authRepository } from "./auth.repository.js";

export const authService = {
  async login(email: string, password: string): Promise<{ token: string; user: UserPayload }> {
    const user = await authRepository.findUserByEmail(email);

    if (!user || user.password !== password) {
      throw new UnauthorizedError("Email atau password salah");
    }

    const payload: UserPayload = { id: user.id, email: user.email };
    return { token: signToken(payload), user: payload };
  },
};
