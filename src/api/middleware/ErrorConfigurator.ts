/**
 * Error Configurator
 * Centralized error handling configuration
 */

import { Application } from 'express';
import { logger } from '@/shared/utils/logger';
import { errorHandler } from '@/api/middleware/errorHandler';

export class ErrorConfigurator {
  constructor(private app: Application) {}

  public configure(): void {
    this.configureGlobalErrorHandler();

    logger.info('Error handling configuration completed');
  }

  private configureGlobalErrorHandler(): void {
    // Global error handler - must be last middleware
    this.app.use(errorHandler);
  }
}
