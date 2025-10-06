/**
 * Auth Routes
 *
 * Route configuration and dependency injection factory for authentication module.
 * Follows the established module pattern from companies module.
 */

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { authenticate } from '@/api/middleware/authentication';

/**
 * Create and configure auth routes with dependency injection.
 *
 * @param prisma - Global Prisma client instance
 * @returns Configured Express router
 */
export default (prisma: PrismaClient): Router => {
  const router = Router();

  // --- Dependency Injection Container ---
  const authRepository = new AuthRepository(prisma);
  const authService = new AuthService(authRepository);
  const authController = new AuthController(authService);
  // --- End of DI Container ---

  // --- Route Mounting ---

  // Public Routes (No authentication required)
  router.post('/register', authController.register);
  router.post('/login', authController.login);
  router.post('/refresh', authController.refresh);

  // Protected Routes (Authentication required)
  router.post('/logout', authenticate, authController.logout);
  router.get('/me', authenticate, authController.getProfile);

  return router;
};
