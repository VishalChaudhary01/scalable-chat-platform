import { getEnv } from '../utils/get-env';

export const config = {
  PORT: getEnv('PORT'),
} as const;
