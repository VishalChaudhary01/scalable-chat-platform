import { StatusCode, StatusCodeType } from '../config/status-code.config';

export class AppError extends Error {
  public statusCode: StatusCodeType;

  constructor(
    message: string,
    statusCode: StatusCodeType = StatusCode.INTERNAL_SERVER_ERROR
  ) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
