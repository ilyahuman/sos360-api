/**
 * Tenant Isolation Middleware (Refactored)
 * Enforces data isolation using the type-safe request context.
 */
import { Request, Response, NextFunction } from 'express';
import { logger, logSecurityEvent } from '@/shared/utils/logger';
import { ForbiddenError } from '@/api/types';

export const tenantIsolation = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { user, bypassTenantIsolation } = req.context;

    // Bypass for super admins or unauthenticated routes
    if (bypassTenantIsolation || !user || !user.companyId) {
      if (bypassTenantIsolation) {
        logSecurityEvent('Super Admin Tenant Bypass', { userId: user?.id, url: req.originalUrl });
      }
      return next();
    }

    // Set the tenant context for downstream services
    req.context.tenantContext = {
      companyId: user.companyId,
      userId: user.id,
    };

    // Validate request against user's tenant
    validateTenantAccess(req, user.companyId);

    next();
  } catch (error) {
    logSecurityEvent('Tenant Isolation Violation', {
      context: req.context,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    next(error);
  }
};

function validateTenantAccess(req: Request, userCompanyId: string): void {
  // 1. Check URL parameters and query string
  const requestedCompanyId =
    req.params.companyId || (typeof req.query.companyId === 'string' ? req.query.companyId : null);
  if (requestedCompanyId && requestedCompanyId !== userCompanyId) {
    throw new ForbiddenError('Access denied to the requested organization.');
  }

  // 2. Recursively check request body
  if (req.body) {
    checkNestedCompanyIds(req.body, userCompanyId);
  }
}

function checkNestedCompanyIds(obj: any, userCompanyId: string): void {
  if (typeof obj !== 'object' || obj === null) return;
  if (Array.isArray(obj)) {
    obj.forEach(item => checkNestedCompanyIds(item, userCompanyId));
    return;
  }
  for (const [key, value] of Object.entries(obj)) {
    if (key === 'companyId' && typeof value === 'string' && value !== userCompanyId) {
      throw new ForbiddenError('Invalid companyId reference in request body.');
    }
    if (typeof value === 'object') {
      checkNestedCompanyIds(value, userCompanyId);
    }
  }
}
