/**
 * SOS360 API Application Entry Point (Final)
 * Initializes and starts the server.
 */

import 'reflect-metadata'; // Must be the first import for dependency injection to work.
import { Application } from '@/api/core/Application';
import { logger } from '@/shared/utils/logger';

async function bootstrap(): Promise<void> {
  try {
    const app = new Application();
    await app.start();
  } catch (error) {
    logger.error('❌ Fatal error during application bootstrap:', error);
    process.exit(1);
  }
}

bootstrap();
