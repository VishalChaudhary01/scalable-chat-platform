import { StatusCode } from '../config/status-code.config';
import { AppError } from './app-error';

export function getEnv(key: string, defaultValue = ''): string {
  const value = process.env[key];
  if (!value) {
    if (!defaultValue) {
      throw new AppError(
        `Environment variable ${key} not set in .env file`,
        StatusCode.NOT_FOUND
      );
    }
    return defaultValue;
  }
  return value;
}
