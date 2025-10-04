/**
 * Middleware Configurator (Refactored)
 * Centralized, clean middleware configuration.
 */

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { config, isDevelopment } from '@/config/environment';
import { logger, morganStream } from '@/shared/utils/logger';
import { requestContext } from '@/api/middleware/requestLogger';
import { applySecurity } from '@/api/middleware/security';

export class MiddlewareConfigurator {
  constructor(private app: Application) {}

  public configure(): void {
    // Trust proxy to ensure req.ip is accurate behind a load balancer or reverse proxy.
    this.app.set('trust proxy', 1);

    // Core security headers with Helmet, configured for a stateless API.
    this.app.use(helmet());

    // CORS configuration to allow specified origins.
    this.app.use(
      cors({
        origin: (origin, callback) => {
          if (
            !origin ||
            config.CORS_ORIGIN.includes(origin) ||
            (isDevelopment && origin.startsWith('http://localhost:'))
          ) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        },
        credentials: config.CORS_CREDENTIALS,
        methods: config.CORS_METHODS,
      })
    );

    // Parsers for JSON, URL-encoded data, and cookies.
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    this.app.use(cookieParser(config.COOKIE_SECRET));

    // HTTP request logging.
    this.app.use(morgan('short', { stream: morganStream }));

    // Custom middleware to build our application context for each request.
    this.app.use(requestContext);

    // Apply additional security middleware.
    applySecurity(this.app);

    logger.info('Middleware configuration completed.');
  }
}
