import { getEnv } from '../utils/getEnv';

export const Env = {
  NODE_ENV: getEnv('NODE_ENV'),
  PORT: getEnv('PORT'),
} as const;
