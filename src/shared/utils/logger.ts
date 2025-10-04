/**
 * Winston Logger Configuration (Refactored)
 * A standard, simple, and powerful logging setup.
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

const logsDir = path.join(process.cwd(), 'logs');

// Use process.env directly to avoid circular dependency with config
const NODE_ENV = process.env.NODE_ENV || 'development';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const APP_NAME = process.env.APP_NAME || 'SOS360-API';

// Define transports based on environment
const transports: winston.transport[] = [
  // Always log errors to a rotating file
  new DailyRotateFile({
    level: 'error',
    filename: path.join(logsDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
  }),
  // Log all levels to a general rotating file
  new DailyRotateFile({
    filename: path.join(logsDir, 'application-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
  }),
];

// Add a console transport for development
if (NODE_ENV === 'development') {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    })
  );
}

export const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: APP_NAME },
  transports,
  exitOnError: false, // Do not exit on handled exceptions
});

// Create a stream for Morgan to pipe HTTP request logs through Winston
export const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

/**
 * Logs a security-related event.
 * These logs are directed to the 'warn' level for high visibility.
 * @param message - A descriptive message for the security event.
 * @param meta - An object containing relevant context for the event.
 */
export const logSecurityEvent = (message: string, meta: Record<string, any>): void => {
  logger.warn(`[SECURITY] ${message}`, meta);
};
