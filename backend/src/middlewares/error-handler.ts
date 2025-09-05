import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error';
import { HttpStatus } from '../config/http.config';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  console.log(`Error occure at path: ${req.path}`, error);

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
    });
  }

  return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    message: error?.message ?? 'Internal server',
  });
}
