/**
 * Request Validation Middleware
 * Validates incoming requests against Zod DTO schemas and returns formatted errors.
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { status } from 'http-status';
import { ApiResponse, AppContext } from '@/api/types';

type RequestSegments = {
  body?: unknown;
  query?: unknown;
  params?: unknown;
  headers?: unknown;
};

export const validate = <T extends z.ZodTypeAny>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    schema
      .safeParseAsync(collectRequestSegments(req))
      .then(result => {
        if (!result.success) {
          handleValidationError(req, res, result.error);
          return;
        }

        applySanitizedSegments(req, result.data);

        next();
      })
      .catch(err => {
        next(err);
      });
  };
};

const collectRequestSegments = (req: Request): RequestSegments => ({
  body: req.body,
  query: req.query,
  params: req.params,
  headers: req.headers,
});

const applySanitizedSegments = (req: Request, segments: unknown): void => {
  if (!segments || typeof segments !== 'object') return;
  const normalized = segments as Record<string, unknown>;

  if ('body' in normalized) req.body = normalized.body;
  if ('query' in normalized) req.query = normalized.query as Request['query'];
  if ('params' in normalized) req.params = normalized.params as Request['params'];
  if ('headers' in normalized) req.headers = normalized.headers as Request['headers'];
};

const handleValidationError = (req: Request, res: Response, error: z.ZodError): void => {
  const validationError = fromZodError(error);

  const context = getRequestContext(req);

  const response: ApiResponse = {
    success: false,
    message: 'Validation failed. Please check your input.',
    errors: validationError.details.map(detail => ({
      code: 'VALIDATION_ERROR',
      message: detail.message,
      field: detail.path.join('.'),
    })),
    meta: {
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method,
      requestId: context?.requestId || 'unknown',
    },
  };

  res.status(status.BAD_REQUEST).json(response);
};

type RequestWithContext = Request & { context?: Partial<AppContext> };

const getRequestContext = (req: Request): Partial<AppContext> | undefined => {
  return (req as RequestWithContext).context;
};
