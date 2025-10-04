/**
 * Prisma Client Configuration (Minimized for MVP)
 * Exports a basic, un-extended Prisma Client instance.
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '@/shared/utils/logger';
import { config } from '@/config/environment';

// Create a standard Prisma Client instance
const prisma = new PrismaClient({
  log: config.NODE_ENV === 'development' ? ['warn', 'error'] : ['warn', 'error'],
});

logger.info('Prisma client initialized.');

// Export the single client instance for use throughout the application
export { prisma };

// Default export containing the client and essential lifecycle methods
export default {
  client: prisma,
  connect: () => prisma.$connect(),
  disconnect: () => prisma.$disconnect(),
  health: async (): Promise<boolean> => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error('Database health check failed:', error);
      return false;
    }
  },
};
