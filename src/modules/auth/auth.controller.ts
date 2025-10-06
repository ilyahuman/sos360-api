/**
 * Auth Controller
 *
 * HTTP request/response handling for authentication endpoints.
 * Validates requests, delegates to service layer, and returns standardized responses.
 */

import { Request, Response, NextFunction } from 'express';
import { BaseController } from '@/api/controllers/baseController';
import { AuthService } from './auth.service';
import { registerCompanySchema, loginSchema, refreshTokenSchema } from './auth.schema';
import { status } from 'http-status';

export class AuthController extends BaseController {
  constructor(private readonly authService: AuthService) {
    super();
  }

  /**
   * POST /api/v1/auth/register
   * Register a new company with first admin user.
   */
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate request body
      if (!this.validateRequestBody(req, res, registerCompanySchema)) {
        return;
      }

      // Delegate to service layer
      const result = await this.authService.registerCompany(req.body);

      // Send success response
      this.sendSuccessResponse(
        res,
        'Company registration successful. You can now login.',
        result,
        status.CREATED
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/auth/login
   * Authenticate user and return JWT tokens.
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate request body
      if (!this.validateRequestBody(req, res, loginSchema)) {
        return;
      }

      // Delegate to service layer
      const result = await this.authService.login(req.body);

      // Send success response
      this.sendSuccessResponse(res, 'Login successful', result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/auth/refresh
   * Refresh access token using refresh token.
   */
  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate request body
      if (!this.validateRequestBody(req, res, refreshTokenSchema)) {
        return;
      }

      // Delegate to service layer
      const result = await this.authService.refreshAccessToken(req.body.refreshToken);

      // Send success response
      this.sendSuccessResponse(res, 'Token refreshed successfully', result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/auth/logout
   * Logout user (client-side token deletion for MVP).
   */
  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // MVP: No server-side action (stateless JWT)
      // Post-MVP: Add token to blacklist in Redis

      this.sendSuccessResponse(res, 'Logout successful', null);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/auth/me
   * Get current user profile (protected route).
   */
  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // User ID is extracted from JWT by authentication middleware
      const userId = req.context.user!.id;

      // Delegate to service layer
      const result = await this.authService.getUserProfile(userId);

      // Send success response
      this.sendSuccessResponse(res, 'User profile retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  };
}
