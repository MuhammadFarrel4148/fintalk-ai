import { ClientError } from "./ClientError.js";

export class UnauthorizedError extends ClientError {
  constructor(message: string) {
    super(message, 401);
  }
}
