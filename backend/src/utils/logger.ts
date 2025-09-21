import 'winston-daily-rotate-file';
import { createLogger, format, transports } from 'winston';
import { Env } from '../config/env.config';

const customFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(({ level, message, timestamp, stack }) => {
    if (message instanceof Error) {
      return `${timestamp} [${level.toUpperCase()}]: ${message.message}${
        Env.NODE_ENV !== 'production' && message.stack
          ? `\n${message.stack}`
          : ''
      }`;
    }

    if (stack) {
      return `${timestamp} [${level.toUpperCase()}]: ${message}\n${stack}`;
    }

    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
  })
);

export const logger = createLogger({
  level: Env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: customFormat,
  transports: [
    new transports.Console(),
    new transports.DailyRotateFile({
      dirname: 'logs',
      filename: 'chat-server-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
});
