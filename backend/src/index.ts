import express, { NextFunction, Request, Response } from 'express';
import { Env } from './config/env.config';
import { errorHandler } from './middlewares/error-handler';
import { AppError } from './utils/app-error';
import { StatusCode } from './config/status-code.config';
import { logger } from './utils/logger';

const app = express();
const PORT = Env.PORT;

app.get('/health', (_req: Request, _res: Response) => {
  throw new Error('Test');
  // res.status(200).json({ message: 'Healthy server' });
});

app.use((req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`API route ${req.path} not found`, StatusCode.NOT_FOUND));
});

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server runnung at http://localhost:${PORT}`);
});
