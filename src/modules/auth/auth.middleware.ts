import { Request, Response, NextFunction } from 'express';
import { prisma } from '@/infrastructure/database/prisma.client';
import { logSecurityEvent } from '@/shared/utils/logger';
import { UnauthorizedError } from '@/api/types';
import { JWTService } from './jwt.service';
import { AuthenticatedRequest } from '@/api/types/requests.types';

/**
 * Main authentication middleware
 */
export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = JWTService.extractTokenFromHeader(req.get('Authorization'));

    if (!token) {
      throw new UnauthorizedError('Authentication token required');
    }

    const decoded = await JWTService.verifyAccessToken(token);

    if (!decoded.userId) {
      throw new UnauthorizedError('Invalid token payload: userId is missing');
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('User account is deactivated');
    }

    // Attach user object to the request
    req.user = {
      id: user.id,
      companyId: user.companyId,
      role: user.role,
      email: user.email,
      isActive: user.isActive,
    };

    next();
  } catch (error) {
    logSecurityEvent('Authentication Failed', {
      error: error instanceof Error ? error.message : 'Unknown authentication error',
      ip: req.ip,
      url: req.originalUrl,
    });
    next(error);
  }
};
