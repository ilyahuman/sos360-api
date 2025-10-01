/**
 * Server Factory
 * Creates and configures the server instance
 */

import 'reflect-metadata';

import { Application } from '@/api/core/Application';
import { logger } from '@/shared/utils/logger';

class Server {
  private readonly application: Application;

  constructor() {
    this.application = new Application();
  }

  public async start(): Promise<void> {
    try {
      await this.application.start();
    } catch (error) {
      logger.error('Failed to start server:', error);
      throw error;
    }
  }

  public getApplication(): Application {
    return this.application;
  }
}

// Factory function to create a server instance
export const createServer = (): Server => {
  return new Server();
};
