/**
 * Global Error Handler (Refactored)
 * Centralized, modular error processing with zod-validation-error.
 */
import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { status } from 'http-status';
import { fromZodError, ValidationError as ZodValidationError } from 'zod-validation-error';
import { logger } from '@/shared/utils/logger';
import { config } from '@/config/environment';
import {
  DomainError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
} from '@/api/types';
import { ApiResponse, ApiError, ErrorWithStatus } from '@/api/types';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  const statusCode = mapErrorToStatusCode(err);
  const response = buildApiResponse(err, req);

  logger.error('An error occurred during a request', {
    error: {
      message: err.message,
      name: err.name,
      stack: config.NODE_ENV !== 'production' ? err.stack : undefined,
    },
    context: req.context,
  });

  res.status(statusCode).json(response);
};

const mapErrorToStatusCode = (err: ErrorWithStatus): number => {
  if (err instanceof NotFoundError) return status.NOT_FOUND;
  if (err instanceof ZodError) return 400;
  if (err instanceof UnauthorizedError) return 401;
  if (err instanceof ForbiddenError) return 403;
  if (err instanceof ConflictError) return 409;
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') return 409;
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') return 404;
  return err.statusCode || 500;
};

const buildApiResponse = (err: Error, req: Request): ApiResponse => {
  let message = 'An internal server error occurred.';
  let errors: ApiError[] = [{ code: 'INTERNAL_SERVER_ERROR', message }];

  if (err instanceof DomainError) {
    message = err.message;
    errors = [{ code: err.code, message: err.message, details: err.details }];
  } else if (err instanceof ZodError) {
    const validationError: ZodValidationError = fromZodError(err);
    message = validationError.message;
    errors = validationError.details.map(d => ({
      code: 'VALIDATION_ERROR',
      message: d.message,
      field: d.path.join('.'),
    }));
  } else if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    const field = (err.meta?.target as string[])?.join(', ') || 'field';
    message = `A record with this value for '${field}' already exists.`;
    errors = [{ code: 'UNIQUE_CONSTRAINT_VIOLATION', message, field }];
  } else if (config.NODE_ENV !== 'production') {
    // Provide detailed errors in development
    message = err.message;
    errors = [{ code: err.name || 'INTERNAL_SERVER_ERROR', message: err.message }];
  }

  return {
    success: false,
    message,
    errors,
    meta: {
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method,
      requestId: req.context?.requestId || 'unknown',
    },
  };
};
