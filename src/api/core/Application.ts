/**
 * Application Core Class
 * Handles server initialization and lifecycle management
 */

import express, { Application as ExpressApp } from 'express';
import { config, isDevelopment } from '@/config/environment';
import { logger } from '@/shared/utils/logger';
import { MiddlewareConfigurator, ErrorConfigurator } from '@/api/middleware';
import { RouteConfigurator } from '@/api/routes/RouteConfigurator';
import databaseService from '@/infrastructure/database/prisma.client';

export class Application {
  private readonly app: ExpressApp;
  private server: any;

  constructor() {
    this.app = express();
    this.setupApplication();
  }

  private setupApplication(): void {
    // Configure middleware
    const middlewareConfigurator = new MiddlewareConfigurator(this.app);
    middlewareConfigurator.configure();

    // Configure routes
    const routeConfigurator = new RouteConfigurator(this.app);
    routeConfigurator.configure();

    // Configure error handling
    const errorConfigurator = new ErrorConfigurator(this.app);
    errorConfigurator.configure();
  }

  public async initialize(): Promise<void> {
    try {
      logger.info('Initializing SOS360 application...');

      // Initialize database connection
      await databaseService.connect();
      logger.info('Database connection established');

      // Initialize Firebase (if configured)
      // try {
      //   const firebaseHealth = await firebaseService.health();
      //   if (firebaseHealth) {
      //     logger.info('Firebase connection established');
      //   } else {
      //     logger.warn('Firebase health check failed, but continuing...');
      //   }
      // } catch (error) {
      //   logger.warn('Firebase initialization failed, but continuing...', error);
      // }

      logger.info('SOS360 application initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize application:', error);
      throw error;
    }
  }

  public async start(): Promise<void> {
    try {
      await this.initialize();

      this.server = this.app.listen(config.PORT, () => {
        this.logStartupInfo();
      });

      // Set server timeout
      this.server.timeout = 30000; // 30 seconds

      // Store server reference for graceful shutdown
      (global as any).__server = this.server;

      // Setup graceful shutdown handlers
      this.setupGracefulShutdown();
    } catch (error) {
      logger.error('Failed to start server:', error);
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
    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', error);
      this.gracefulShutdown('uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
      logger.error('Unhandled Rejection:', {
        reason,
        promise: promise.toString(),
      });
      this.gracefulShutdown('unhandledRejection');
    });

    // Handle SIGTERM (Docker, Kubernetes)
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received');
      this.gracefulShutdown('SIGTERM');
    });

    // Handle SIGINT (Ctrl+C)
    process.on('SIGINT', () => {
      logger.info('SIGINT received');
      this.gracefulShutdown('SIGINT');
    });

    logger.info('Graceful shutdown handlers configured');
  }

  private async gracefulShutdown(signal: string): Promise<void> {
    logger.info(`Starting graceful shutdown due to ${signal}...`);

    if (this.server) {
      this.server.close(async () => {
        try {
          // Close database connections
          await databaseService.disconnect();
          logger.info('Database connections closed');
          //
          // // Close Firebase connections
          // await firebaseService.shutdown();
          // logger.info('Firebase connections closed');

          logger.info('Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during graceful shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after timeout
      setTimeout(() => {
        logger.error('Graceful shutdown timeout, forcing exit');
        process.exit(1);
      }, 10000); // 10 seconds
    } else {
      process.exit(0);
    }
  }

  public getApp(): ExpressApp {
    return this.app;
  }

  public getServer(): any {
    return this.server;
  }
}
