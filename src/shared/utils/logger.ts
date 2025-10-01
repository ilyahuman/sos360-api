/**
 * Winston Logger Configuration
 * Enterprise-grade logging with multiple transports and formatting
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

// Custom log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(logColors);

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(info => {
    return `${info.timestamp} ${info.level}: ${info.message}${
      info.stack ? `\n${info.stack}` : ''
    }`;
  })
);

// Custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');

// Daily rotate file transport for general logs
const fileRotateTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: process.env.LOG_MAX_SIZE || '20m',
  maxFiles: process.env.LOG_MAX_FILES || '14d',
  format: fileFormat,
});

// Daily rotate file transport for error logs
const errorFileRotateTransport = new DailyRotateFile({
  level: 'error',
  filename: path.join(logsDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: process.env.LOG_MAX_SIZE || '20m',
  maxFiles: process.env.LOG_MAX_FILES || '14d',
  format: fileFormat,
});

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels: logLevels,
  format: fileFormat,
  defaultMeta: {
    service: process.env.APP_NAME || 'sos360-api',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    // Console transport for development
    ...(process.env.NODE_ENV !== 'production'
      ? [
          new winston.transports.Console({
            format: consoleFormat,
          }),
        ]
      : []),

    // File transports for all environments
    fileRotateTransport,
    errorFileRotateTransport,
  ],
  exceptionHandlers: [
    new DailyRotateFile({
      filename: path.join(logsDir, 'exceptions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: process.env.LOG_MAX_SIZE || '20m',
      maxFiles: process.env.LOG_MAX_FILES || '14d',
      format: fileFormat,
    }),
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      filename: path.join(logsDir, 'rejections-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: process.env.LOG_MAX_SIZE || '20m',
      maxFiles: process.env.LOG_MAX_FILES || '14d',
      format: fileFormat,
    }),
  ],
  exitOnError: false,
});

// Extend logger with custom methods
interface ExtendedLogger extends winston.Logger {
  request: (message: string, meta?: Record<string, unknown>) => void;
  security: (message: string, meta?: Record<string, unknown>) => void;
  performance: (message: string, meta?: Record<string, unknown>) => void;
  audit: (message: string, meta?: Record<string, unknown>) => void;
}

const extendedLogger = logger as ExtendedLogger;

// Custom log methods
extendedLogger.request = (message: string, meta?: Record<string, unknown>) => {
  logger.http(message, { type: 'request', ...meta });
};

extendedLogger.security = (message: string, meta?: Record<string, unknown>) => {
  logger.warn(message, { type: 'security', ...meta });
};

extendedLogger.performance = (message: string, meta?: Record<string, unknown>) => {
  logger.info(message, { type: 'performance', ...meta });
};

extendedLogger.audit = (message: string, meta?: Record<string, unknown>) => {
  logger.info(message, { type: 'audit', ...meta });
};

// Create Morgan stream for HTTP request logging
export const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Error logging helper
export const logError = (error: Error, context?: Record<string, unknown>): void => {
  logger.error(error.message, {
    stack: error.stack,
    name: error.name,
    ...context,
  });
};

// Performance logging helper
export const logPerformance = (
  operation: string,
  duration: number,
  context?: Record<string, unknown>
): void => {
  extendedLogger.performance(`${operation} completed in ${duration}ms`, {
    operation,
    duration,
    ...context,
  });
};

// Security event logging helper
export const logSecurityEvent = (
  event: string,
  details: Record<string, unknown>
): void => {
  extendedLogger.security(`Security event: ${event}`, {
    event,
    timestamp: new Date().toISOString(),
    ...details,
  });
};

// Audit logging helper
export const logAudit = (
  action: string,
  userId: string,
  entityType: string,
  entityId: string,
  details?: Record<string, unknown>
): void => {
  extendedLogger.audit(`Audit: ${action}`, {
    action,
    userId,
    entityType,
    entityId,
    timestamp: new Date().toISOString(),
    ...details,
  });
};

// Database query logging helper
export const logQuery = (
  query: string,
  duration: number,
  params?: unknown[]
): void => {
  logger.debug('Database query executed', {
    type: 'database',
    query,
    duration,
    params: params ? params.slice(0, 5) : undefined, // Log first 5 params only
  });
};

// API request logging helper
export const logApiRequest = (
  method: string,
  url: string,
  statusCode: number,
  duration: number,
  userId?: string,
  companyId?: string
): void => {
  extendedLogger.request(`${method} ${url} ${statusCode}`, {
    method,
    url,
    statusCode,
    duration,
    userId,
    companyId,
  });
};

// Business event logging helper
export const logBusinessEvent = (
  event: string,
  companyId: string,
  userId: string,
  details: Record<string, unknown>
): void => {
  logger.info(`Business event: ${event}`, {
    type: 'business',
    event,
    companyId,
    userId,
    timestamp: new Date().toISOString(),
    ...details,
  });
};

// Integration logging helper
export const logIntegration = (
  service: string,
  operation: string,
  success: boolean,
  duration: number,
  details?: Record<string, unknown>
): void => {
  const level = success ? 'info' : 'error';
  logger.log(level, `Integration: ${service} ${operation} ${success ? 'succeeded' : 'failed'}`, {
    type: 'integration',
    service,
    operation,
    success,
    duration,
    ...details,
  });
};

// Graceful shutdown handler
export const closeLogger = (): Promise<void> => {
  return new Promise(resolve => {
    logger.end(() => {
      resolve();
    });
  });
};

export { extendedLogger as logger };
export default extendedLogger;
