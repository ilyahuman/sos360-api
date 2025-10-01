/**
 * SOS360 API Application Entry Point
 * Simple initialization script that bootstraps the server
 */

import { createServer } from '@/api/core/Server';
import { logger } from '@/shared/utils/logger';

/**
 * Bootstrap the application
 */
async function bootstrap(): Promise<void> {
  try {
    logger.info('Starting SOS360 API application...');

    const server = createServer();
    await server.start();
  } catch (error) {
    logger.error('Failed to bootstrap application:', error);
    process.exit(1);
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  bootstrap();
}

// Export for testing purposes
export { createServer };
