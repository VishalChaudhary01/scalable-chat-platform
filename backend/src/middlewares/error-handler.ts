import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error';
import { StatusCode } from '../config/status-code.config';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  console.log(`Error occure at PATH: ${req.path}`, error);

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
    message:
      error.message ??
      'We are sorry for the inconvenience. Something went wrong on the server. Please try again later.',
  });
}
