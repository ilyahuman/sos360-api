/**
 * Request Context Middleware (Refactored)
 * Establishes a consistent, typed context for every request.
 */

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/shared/utils/logger';
import { AppContext } from '@/api/types';

/**
 * Creates and attaches a context object to every incoming request.
 * This context includes a unique request ID, performance timers, and user identity
 * once authenticated, providing a single source of truth for request-scoped information.
 */
export const requestContext = (req: Request, res: Response, next: NextFunction): void => {
  const user = (req as any).user; // Assumes a previous auth middleware populates this

  // Build the context object
  const context: Partial<AppContext> = {
    requestId: uuidv4(),
    startTime: Date.now(),
    // If user is populated by an auth middleware, create the user identity
    ...(user && {
      user: {
        id: user.id,
        companyId: user.companyId,
        role: user.role,
        email: user.email,
      },
    }),
  };

  // Attach context to the request object
  (req as any).context = context;

  // Add request ID to the response headers for client-side tracing
  res.setHeader('X-Request-ID', context.requestId!);

  // Log the start of the request
  logger.info(`[${req.method} ${req.originalUrl}] - Request Start`, {
    requestId: context.requestId,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Log the end of the request on 'finish' event
  res.on('finish', () => {
    const duration = Date.now() - context.startTime!;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

    logger.log(level, `[${req.method} ${req.originalUrl}] - Request End`, {
      requestId: context.requestId,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: context.user?.id,
      companyId: context.user?.companyId,
    });
  });

  next();
};
