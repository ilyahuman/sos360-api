/**
 * Tenant Isolation Middleware (Updated)
 *
 * This middleware runs AFTER the `authenticate` middleware. It uses the
 * verified `UserIdentity` from `req.context.user` to enforce data isolation.
 *
 * Responsibilities:
 * 1. Check the user's role to determine the flow (Admin vs. Customer).
 *
 * 2. **Admin Flow**: If the user is a SUPER_ADMIN, set `bypassTenantIsolation = true`.
 * This acts as a "master key", signaling to services that they can query across all tenants.
 *
 * 3. **Customer Flow**: For all other roles, create the `tenantContext` object.
 * This acts as a "room key", providing an explicit, non-negotiable scope for all
 * downstream database operations.
 *
 * 4. Perform security checks to ensure the user is not trying to access or manipulate
 * data from another tenant via URL parameters or request body payloads.
 */
import { Request, Response, NextFunction } from 'express';
import { UserRoleType } from '@prisma/client';
import { logger, logSecurityEvent } from '@/shared/utils/logger';
import { ForbiddenError, UnauthorizedError } from '@/api/types';

export const tenantIsolation = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // This middleware requires an authenticated user. If `req.context.user` doesn't exist,
    // it means the authenticate middleware did not run or failed.
    if (!req.context.user) {
      throw new UnauthorizedError('Authentication context is missing.');
    }

    const { user } = req.context;

    // 1. Check the user's role to determine the flow.
    // 2. **Admin Flow**: SUPER_ADMINs can bypass tenant checks.
    if (user.role === UserRoleType.SUPER_ADMIN) {
      req.context.bypassTenantIsolation = true;
      logSecurityEvent('Super Admin Tenant Bypass', { userId: user.id, url: req.originalUrl });
      return next();
    }

    // 3. **Customer Flow**: For everyone else, we create the explicit tenant context.
    // This `tenantContext` is the "room key" for this request.
    req.context.tenantContext = {
      companyId: user.companyId,
      userId: user.id,
    };

    // 4. Validate the request against the user's assigned tenant to prevent tampering.
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

/**
 * Validates that the request does not attempt to cross tenant boundaries.
 * @param req The Express request object.
 * @param userCompanyId The companyId from the user's verified token.
 */
function validateTenantAccess(req: Request, userCompanyId: string): void {
  // Check URL parameters like /api/v1/companies/:companyId/divisions
  const requestedCompanyIdInParams = req.params.companyId;
  if (requestedCompanyIdInParams && requestedCompanyIdInParams !== userCompanyId) {
    throw new ForbiddenError('Access denied: URL parameter references a different organization.');
  }

  // Recursively check the request body for any `companyId` fields.
  if (req.body) {
    checkNestedCompanyIds(req.body, userCompanyId);
  }
}

/**
 * Recursively scans an object or array to find any `companyId` key and ensures its
 * value matches the user's companyId.
 * @param obj The object or array to scan.
 * @param userCompanyId The user's legitimate companyId.
 */
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
    // Continue scanning nested objects.
    if (typeof value === 'object') {
      checkNestedCompanyIds(value, userCompanyId);
    }
  }
}
