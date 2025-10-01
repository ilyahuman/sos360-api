import { Router } from 'express';
import { prisma } from '@/infrastructure/database/prisma.client';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { loginValidationRules, registerValidationRules } from './auth.validator';
import { AuthController } from './auth.controller';

const router: Router = Router();

// --- Dependency Injection Setup ---
const authRepository = new AuthRepository(prisma);
const authService = new AuthService(authRepository);
const authController = new AuthController(authService);

/**
 * User login
 * POST /api/v1/auth/login
 */
router.post('/login', loginValidationRules(), authController.login);

/**
 * User registration
 * POST /api/v1/auth/register
 */
router.post('/register', registerValidationRules(), authController.register);

// --- Placeholder Routes ---

router.post('/forgot-password', authController.forgotPassword);

router.post('/refresh', authController.refresh);

router.post('/logout', authController.logout);

export default router;
