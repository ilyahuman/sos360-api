/**
 * Global Error Handler Middleware
 * Centralized error processing with proper logging and response formatting
 */

import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { logger, logError } from '@/shared/utils/logger';
import { config } from '@/config/environment';
import {
  DomainError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
} from '@/api/types';
import { ApiResponse, ApiError, ErrorWithStatus } from '@/api/types';

/**
 * Global error handler middleware
 * Processes all errors and returns standardized API responses
 */
export const errorHandler = (
  error: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log the error with context
  logError(error, {
    url: req.url,
    method: req.method,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: (req as any).userId,
    companyId: (req as any).companyId,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // Determine error type and create appropriate response
  const apiResponse = createErrorResponse(error, req);

  // Set appropriate HTTP status code
  const statusCode = getHttpStatusCode(error);

  // Send error response
  res.status(statusCode).json(apiResponse);
};

/**
 * Create standardized API error response
 */
function createErrorResponse(error: ErrorWithStatus, req: Request): ApiResponse {
  const baseResponse: ApiResponse = {
    success: false,
    message: 'An error occurred',
    errors: [],
    meta: {
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      version: config.API_VERSION,
      requestId: (req as any).requestId || 'unknown',
    },
  };

  // Handle different error types
  if (error instanceof ValidationError) {
    return {
      ...baseResponse,
      message: 'Validation failed',
      errors: [
        {
          code: 'VALIDATION_ERROR',
          message: error.message,
          field: error.field,
          ...(error.details && { details: error.details }),
        },
      ],
    };
  }

  if (error instanceof NotFoundError) {
    return {
      ...baseResponse,
      message: error.message,
      errors: [
        {
          code: 'NOT_FOUND',
          message: error.message,
        },
      ],
    };
  }

  if (error instanceof UnauthorizedError) {
    return {
      ...baseResponse,
      message: 'Authentication required',
      errors: [
        {
          code: 'UNAUTHORIZED',
          message: error.message,
        },
      ],
    };
  }

  if (error instanceof ForbiddenError) {
    return {
      ...baseResponse,
      message: 'Access forbidden',
      errors: [
        {
          code: 'FORBIDDEN',
          message: error.message,
        },
      ],
    };
  }

  if (error instanceof DomainError) {
    return {
      ...baseResponse,
      message: error.message,
      errors: [
        {
          code: error.code,
          message: error.message,
          ...(error.details && { details: error.details }),
        },
      ],
    };
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(error, baseResponse);
  }

  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    return {
      ...baseResponse,
      message: 'Database error occurred',
      errors: [
        {
          code: 'DATABASE_ERROR',
          message:
            config.NODE_ENV === 'production'
              ? 'An unexpected database error occurred'
              : error.message,
        },
      ],
    };
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return {
      ...baseResponse,
      message: 'Invalid data provided',
      errors: [
        {
          code: 'VALIDATION_ERROR',
          message: config.NODE_ENV === 'production' ? 'Invalid data format' : error.message,
        },
      ],
    };
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return {
      ...baseResponse,
      message: 'Invalid token',
      errors: [
        {
          code: 'INVALID_TOKEN',
          message: 'The provided token is invalid',
        },
      ],
    };
  }

  if (error.name === 'TokenExpiredError') {
    return {
      ...baseResponse,
      message: 'Token expired',
      errors: [
        {
          code: 'TOKEN_EXPIRED',
          message: 'The provided token has expired',
        },
      ],
    };
  }

  // Handle validation library errors (joi, express-validator, etc.)
  if (error.name === 'ValidationError' && (error as any).details) {
    const validationErrors = (error as any).details.map((detail: any) => ({
      code: 'VALIDATION_ERROR',
      message: detail.message,
      field: detail.path?.join('.') || detail.context?.key,
    }));

    return {
      ...baseResponse,
      message: 'Validation failed',
      errors: validationErrors,
    };
  }

  // Handle multer file upload errors
  if (error.code === 'LIMIT_FILE_SIZE') {
    return {
      ...baseResponse,
      message: 'File too large',
      errors: [
        {
          code: 'FILE_TOO_LARGE',
          message: `File size exceeds the maximum limit of ${config.MAX_FILE_SIZE} bytes`,
        },
      ],
    };
  }

  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return {
      ...baseResponse,
      message: 'Unexpected file field',
      errors: [
        {
          code: 'UNEXPECTED_FILE',
          message: 'Unexpected file upload field',
        },
      ],
    };
  }

  // Handle rate limiting errors
  if (error.message === 'Too Many Requests') {
    return {
      ...baseResponse,
      message: 'Rate limit exceeded',
      errors: [
        {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please try again later.',
        },
      ],
    };
  }

  // Handle CORS errors
  if (error.message.includes('CORS')) {
    return {
      ...baseResponse,
      message: 'CORS error',
      errors: [
        {
          code: 'CORS_ERROR',
          message: 'Cross-origin request blocked',
        },
      ],
    };
  }

  // Generic error handling
  return {
    ...baseResponse,
    message: config.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    errors: [
      {
        code: error.code || 'INTERNAL_ERROR',
        message: config.NODE_ENV === 'production' ? 'An unexpected error occurred' : error.message,
        ...(config.NODE_ENV !== 'production' && { stack: error.stack }),
      },
    ],
  };
}

/**
 * Handle Prisma-specific errors with detailed error mapping
 */
function handlePrismaError(
  error: Prisma.PrismaClientKnownRequestError,
  baseResponse: ApiResponse
): ApiResponse {
  switch (error.code) {
    case 'P2001':
      return {
        ...baseResponse,
        message: 'Record not found',
        errors: [
          {
            code: 'NOT_FOUND',
            message: 'The requested record does not exist',
            details: { target: error.meta?.target },
          },
        ],
      };

    case 'P2002':
      return {
        ...baseResponse,
        message: 'Unique constraint violation',
        errors: [
          {
            code: 'DUPLICATE_VALUE',
            message: 'A record with this value already exists',
            field: Array.isArray(error.meta?.target)
              ? (error.meta.target as string[]).join(', ')
              : (error.meta?.target as string),
          },
        ],
      };

    case 'P2003':
      return {
        ...baseResponse,
        message: 'Foreign key constraint violation',
        errors: [
          {
            code: 'FOREIGN_KEY_ERROR',
            message: 'Referenced record does not exist',
            field: error.meta?.field_name as string,
          },
        ],
      };

    case 'P2025':
      return {
        ...baseResponse,
        message: 'Record not found',
        errors: [
          {
            code: 'NOT_FOUND',
            message: 'Record to update or delete does not exist',
          },
        ],
      };

    case 'P2016':
      return {
        ...baseResponse,
        message: 'Query interpretation error',
        errors: [
          {
            code: 'QUERY_ERROR',
            message: 'Invalid query parameters provided',
          },
        ],
      };

    default:
      return {
        ...baseResponse,
        message: 'Database error',
        errors: [
          {
            code: 'DATABASE_ERROR',
            message: config.NODE_ENV === 'production' ? 'A database error occurred' : error.message,
            ...(config.NODE_ENV !== 'production' && {
              details: {
                code: error.code,
                meta: error.meta,
              }
            }),
          },
        ],
      };
  }
}

/**
 * Determine appropriate HTTP status code for error
 */
function getHttpStatusCode(error: ErrorWithStatus): number {
  // Check explicit status codes
  if (error.status || error.statusCode) {
    return error.status || error.statusCode || 500;
  }

  // Map error types to status codes
  if (error instanceof ValidationError) return 400;
  if (error instanceof UnauthorizedError) return 401;
  if (error instanceof ForbiddenError) return 403;
  if (error instanceof NotFoundError) return 404;

  // Handle specific error names
  if (error.name === 'JsonWebTokenError') return 401;
  if (error.name === 'TokenExpiredError') return 401;
  if (error.name === 'ValidationError') return 400;

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2001':
      case 'P2025':
        return 404;
      case 'P2002':
        return 409; // Conflict
      case 'P2003':
        return 400;
      default:
        return 500;
    }
  }

  // Handle rate limiting
  if (error.message === 'Too Many Requests') return 429;

  // Handle file upload errors
  if (error.code === 'LIMIT_FILE_SIZE') return 413;
  if (error.code === 'LIMIT_UNEXPECTED_FILE') return 400;

  // Default to 500 for unknown errors
  return 500;
}

/**
 * Create custom error classes for common scenarios
 */
export class HttpError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export class BadRequestError extends HttpError {
  constructor(message = 'Bad Request', code = 'BAD_REQUEST', details?: Record<string, unknown>) {
    super(message, 400, code, details);
    this.name = 'BadRequestError';
  }
}

export class ConflictError extends HttpError {
  constructor(message = 'Resource Conflict', code = 'CONFLICT', details?: Record<string, unknown>) {
    super(message, 409, code, details);
    this.name = 'ConflictError';
  }
}

export class InternalServerError extends HttpError {
  constructor(
    message = 'Internal Server Error',
    code = 'INTERNAL_ERROR',
    details?: Record<string, unknown>
  ) {
    super(message, 500, code, details);
    this.name = 'InternalServerError';
  }
}

export class ServiceUnavailableError extends HttpError {
  constructor(
    message = 'Service Unavailable',
    code = 'SERVICE_UNAVAILABLE',
    details?: Record<string, unknown>
  ) {
    super(message, 503, code, details);
    this.name = 'ServiceUnavailableError';
  }
}
