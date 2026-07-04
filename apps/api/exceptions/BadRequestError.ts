import { ClientError } from "./ClientError.js";

export class BadRequestError extends ClientError {
  constructor(message: string) {
    super(message, 400);
  }
}
