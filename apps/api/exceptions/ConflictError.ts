import { ClientError } from "./ClientError.js";

export class ConflictError extends ClientError {
  constructor(message: string) {
    super(message, 409);
  }
}
