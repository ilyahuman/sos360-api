/**
 * Application Core Class (Refactored)
 * Handles server initialization and lifecycle management.
 */

import express, { Application as ExpressApp } from 'express';
import { Server as HttpServer } from 'http';
import { config, isDevelopment } from '@/config/environment';
import { logger } from '@/shared/utils/logger';
import { MiddlewareConfigurator, ErrorConfigurator } from '@/api/middleware';
import { RouteConfigurator } from '@/api/routes/RouteConfigurator';
import databaseService from '@/infrastructure/database/prisma.client';

export class Application {
  private readonly app: ExpressApp;
  private server?: HttpServer;

  constructor() {
    this.app = express();
    this.setupApplication();
  }

  private setupApplication(): void {
    // The order of configuration is critical.
    // 1. Middleware (CORS, security, body-parsing) must come before routes.
    new MiddlewareConfigurator(this.app).configure();

    // 2. Routes are registered after core middleware.
    new RouteConfigurator(this.app).configure();

    // 3. Error handling must be the last middleware to catch all errors.
    new ErrorConfigurator(this.app).configure();
  }

  public async start(): Promise<void> {
    try {
      logger.info('Initializing application...');
      await databaseService.connect();
      logger.info('Database connection established successfully.');

      this.server = this.app.listen(config.PORT, () => {
        this.logStartupInfo();
      });

      this.server.timeout = 30000; // 30-second timeout for requests
      this.setupGracefulShutdown();
    } catch (error) {
      logger.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  private logStartupInfo(): void {
    logger.info(`🚀 SOS360 API Server started successfully!`);
    logger.info(`📍 Environment: ${config.NODE_ENV}`);
    logger.info(`🌐 Server: http://localhost:${config.PORT}`);
    logger.info(`🔍 Health Check: http://localhost:${config.PORT}${config.HEALTH_CHECK_PATH}`);

    if (isDevelopment) {
      logger.info(`📚 API Docs: http://localhost:${config.PORT}/api-docs`);
    }

    logger.info(`🔄 API Version: ${config.API_VERSION}`);
    logger.info('🎯 Ready to handle requests!');
  }

  private setupGracefulShutdown(): void {
    const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT'];

    const shutdown = (signal: string) => {
      logger.warn(`Signal [${signal}] received, starting graceful shutdown...`);
      if (!this.server) {
        logger.info('Server not started, exiting immediately.');
        process.exit(0);
      }

      this.server.close(async () => {
        logger.info('HTTP server closed.');
        await databaseService.disconnect();
        logger.info('Database connections closed.');
        logger.info('✅ Graceful shutdown completed.');
        process.exit(0);
      });

      // Force shutdown after a timeout
      setTimeout(() => {
        logger.error('Graceful shutdown timed out, forcing exit.');
        process.exit(1);
      }, 10000).unref(); // unref() allows the program to exit if this is the only event left.
    };

    signals.forEach(signal => {
      process.on(signal, () => shutdown(signal));
    });

    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', error);
      // We shutdown gracefully even on uncaught exceptions to leave the system in a clean state.
      shutdown('uncaughtException');
    });

    logger.info('Graceful shutdown handlers configured.');
  }

  public getApp(): ExpressApp {
    return this.app;
  }
}
