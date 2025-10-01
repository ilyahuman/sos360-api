/**
 * Middleware Configurator
 * Centralized middleware configuration and setup
 */

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { config, isDevelopment } from '@/config/environment';
import { logger, morganStream } from '@/shared/utils/logger';
import { requestLogger } from '@/api/middleware/requestLogger';
import { securityHeaders } from '@/api/middleware/security';

export class MiddlewareConfigurator {
  constructor(private app: Application) {}

  public configure(): void {
    this.configureTrustProxy();
    this.configureSecurityMiddleware();
    this.configureCors();
    this.configureBodyParsing();
    this.configureCookieParsing();
    this.configureLogging();
    this.configureCustomMiddleware();
    this.configureDevelopmentMiddleware();

    logger.info('Middleware configuration completed');
  }

  private configureTrustProxy(): void {
    // Trust proxy for accurate IP addresses
    this.app.set('trust proxy', 1);
  }

  private configureSecurityMiddleware(): void {
    // Security headers - must be first
    this.app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
          },
        },
        crossOriginEmbedderPolicy: false,
      })
    );
  }

  private configureCors(): void {
    this.app.use(
      cors({
        origin: (origin, callback) => {
          // Allow requests with no origin (mobile apps, etc.)
          if (!origin) return callback(null, true);

          if (config.CORS_ORIGIN.includes(origin)) {
            return callback(null, true);
          }

          // In development, allow localhost with any port
          if (isDevelopment && origin.startsWith('http://localhost:')) {
            return callback(null, true);
          }

          callback(new Error('Not allowed by CORS'));
        },
        credentials: config.CORS_CREDENTIALS,
        methods: config.CORS_METHODS,
        allowedHeaders: [
          'Content-Type',
          'Authorization',
          'X-Requested-With',
          'X-Company-ID',
          'X-API-Version',
          'Accept',
          'Origin',
        ],
        exposedHeaders: ['X-Total-Count', 'X-Page-Count', 'X-Current-Page', 'X-Per-Page'],
        maxAge: 86400, // 24 hours
      })
    );
  }

  private configureBodyParsing(): void {
    // JSON body parsing
    this.app.use(
      express.json({
        limit: '10mb',
        strict: true,
        verify: (req, res, buf) => {
          // Store raw body for webhook verification
          (req as any).rawBody = buf;
        },
      })
    );

    // URL encoded body parsing
    this.app.use(
      express.urlencoded({
        extended: true,
        limit: '10mb',
        parameterLimit: 1000,
      })
    );
  }

  private configureCookieParsing(): void {
    this.app.use(cookieParser(config.COOKIE_SECRET));
  }

  private configureLogging(): void {
    // HTTP request logging
    this.app.use(morgan('combined', { stream: morganStream }));

    // Custom request logger
    this.app.use(requestLogger);
  }

  private configureCustomMiddleware(): void {
    // Custom security middleware
    this.app.use(securityHeaders);
  }

  private configureDevelopmentMiddleware(): void {
    if (isDevelopment) {
      this.app.use('/api-docs', this.createSwaggerRouter());
    }
  }

  private createSwaggerRouter(): express.Router {
    const router = express.Router();

    // Placeholder for Swagger setup
    router.get('/', (req, res) => {
      res.json({
        message: 'API Documentation',
        note: 'Swagger setup will be implemented in future iterations',
        endpoints: {
          health: config.HEALTH_CHECK_PATH,
          auth: `/api/${config.API_VERSION}/auth`,
          companies: `/api/${config.API_VERSION}/companies`,
          contacts: `/api/${config.API_VERSION}/contacts`,
        },
      });
    });

    return router;
  }
}
