import { ClientError } from "./ClientError.js";

export class ExternalServiceError extends ClientError {
  constructor(message: string) {
    super(message, 502);
  }
}
