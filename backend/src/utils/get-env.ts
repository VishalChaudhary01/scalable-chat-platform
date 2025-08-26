export const getEnv = (key: string, defaultValue: string = ''): string => {
  const value = process.env[key];
  if (!value) {
    if (!defaultValue) {
      throw new Error(`Environment variable ${key} not found in .env file`);
    }
    return defaultValue;
  }
  return value;
};
