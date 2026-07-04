import { ClientError } from "./ClientError.js";

export class ForbiddenError extends ClientError {
  constructor(message: string) {
    super(message, 403);
  }
}
