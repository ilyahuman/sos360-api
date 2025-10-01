/**
 * Tenant Isolation Middleware
 * Ensures complete data isolation between different companies (tenants)
 */

import { Request, Response, NextFunction } from 'express';
import { logger, logSecurityEvent } from '@/shared/utils/logger';
import { ForbiddenError, TenantRequest } from '@/api/types';

/**
 * Tenant isolation middleware
 * Ensures users can only access data from their own company
 */
export const tenantIsolation = (req: TenantRequest, res: Response, next: NextFunction): void => {
  try {
    // Skip tenant isolation for public routes or if no user is authenticated
    if (!req.user || !req.user.companyId) {
      next();
      return;
    }

    // Set company ID from authenticated user
    req.companyId = req.user.companyId;

    // Add company ID to response headers for debugging (in development)
    if (process.env.NODE_ENV === 'development') {
      res.setHeader('X-Company-ID', req.companyId);
    }

    // Validate tenant access for route parameters
    validateTenantAccess(req);

    // Validate tenant access for request body
    validateTenantBodyAccess(req);

    // Log tenant access for audit purposes
    logger.debug('Tenant access validated', {
      userId: req.userId,
      companyId: req.companyId,
      url: req.originalUrl,
      method: req.method,
    });

    next();
  } catch (error) {
    logSecurityEvent('Tenant Isolation Violation', {
      userId: req.userId,
      requestedCompanyId: extractCompanyIdFromRequest(req),
      userCompanyId: req.user?.companyId,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    next(error);
  }
};

/**
 * Validate tenant access for route parameters
 */
function validateTenantAccess(req: TenantRequest): void {
  const requestedCompanyId = extractCompanyIdFromRequest(req);

  if (requestedCompanyId && requestedCompanyId !== req.companyId) {
    throw new ForbiddenError('Access denied: You can only access data from your own organization');
  }
}

/**
 * Validate tenant access for request body data
 */
function validateTenantBodyAccess(req: TenantRequest): void {
  if (!req.body) return;

  // Check if request body contains companyId field
  const bodyCompanyId = req.body.companyId;

  if (bodyCompanyId && bodyCompanyId !== req.companyId) {
    throw new ForbiddenError('Access denied: Cannot create or modify data for other organizations');
  }

  // Recursively check nested objects for companyId references
  if (req.companyId) {
    checkNestedCompanyIds(req.body, req.companyId);
  }
}

/**
 * Extract company ID from various parts of the request
 */
function extractCompanyIdFromRequest(req: TenantRequest): string | null {
  // Check route parameters
  if (req.params.companyId) {
    return req.params.companyId;
  }

  // Check query parameters
  if (req.query.companyId && typeof req.query.companyId === 'string') {
    return req.query.companyId;
  }

  // Check custom header
  const headerCompanyId = req.get('X-Company-ID');
  if (headerCompanyId) {
    return headerCompanyId;
  }

  return null;
}

/**
 * Recursively check nested objects for unauthorized companyId references
 */
function checkNestedCompanyIds(obj: any, userCompanyId: string, path = ''): void {
  if (typeof obj !== 'object' || obj === null) {
    return;
  }

  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      checkNestedCompanyIds(item, userCompanyId, `${path}[${index}]`);
    });
    return;
  }

  for (const [key, value] of Object.entries(obj)) {
    const currentPath = path ? `${path}.${key}` : key;

    if (key === 'companyId' && typeof value === 'string' && value !== userCompanyId) {
      throw new ForbiddenError(`Access denied: Invalid companyId reference at ${currentPath}`);
    }

    if (typeof value === 'object' && value !== null) {
      checkNestedCompanyIds(value, userCompanyId, currentPath);
    }
  }
}

/**
 * Middleware to automatically inject company ID into request body
 */
export const injectCompanyId = (req: TenantRequest, res: Response, next: NextFunction): void => {
  if (req.companyId && req.body && typeof req.body === 'object') {
    // Only inject if companyId is not already present
    if (!req.body.companyId) {
      req.body.companyId = req.companyId;
    }
  }

  next();
};

/**
 * Middleware to filter query results by company ID
 */
export const filterByCompanyId = (req: TenantRequest, res: Response, next: NextFunction): void => {
  if (req.companyId) {
    // Add company filter to query parameters
    if (!req.query.companyId) {
      req.query.companyId = req.companyId;
    }

    // Store original send method
    const originalSend = res.send;

    // Override send method to filter response data
    res.send = function (data: any): Response {
      if (typeof data === 'string') {
        try {
          const parsedData = JSON.parse(data);
          const filteredData = filterResponseData(parsedData, req.companyId!);
          return originalSend.call(this, JSON.stringify(filteredData));
        } catch {
          // If not JSON, send as-is
          return originalSend.call(this, data);
        }
      }

      const filteredData = filterResponseData(data, req.companyId!);
      return originalSend.call(this, filteredData);
    };
  }

  next();
};

/**
 * Filter response data to ensure only company-owned data is returned
 */
function filterResponseData(data: any, companyId: string): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.filter(item => {
      if (item && typeof item === 'object' && item.companyId) {
        return item.companyId === companyId;
      }
      return true; // Keep items without companyId (might be metadata, etc.)
    });
  }

  // For objects with data property (API responses)
  if (data.data && Array.isArray(data.data)) {
    return {
      ...data,
      data: data.data.filter((item: any) => {
        if (item && typeof item === 'object' && item.companyId) {
          return item.companyId === companyId;
        }
        return true;
      }),
    };
  }

  // For single objects, check if they belong to the company
  if (data.companyId && data.companyId !== companyId) {
    throw new ForbiddenError('Access denied to resource from different organization');
  }

  return data;
}

/**
 * Middleware to validate multi-tenant database queries
 */
export const validateDatabaseQuery = (
  req: TenantRequest,
  res: Response,
  next: NextFunction
): void => {
  // Store company ID for use in repository/service layers
  if (req.companyId) {
    (req as any).tenantContext = {
      companyId: req.companyId,
      userId: req.userId,
      userRole: req.userRole,
    };
  }

  next();
};

/**
 * Super admin bypass middleware
 * Allows super admins to access data across all tenants (use sparingly)
 */
export const superAdminBypass = (req: TenantRequest, res: Response, next: NextFunction): void => {
  // Check if user is super admin
  const isSuperAdmin = req.user?.role === 'SUPER_ADMIN' || req.userRole === 'SUPER_ADMIN';

  if (isSuperAdmin) {
    // Log super admin access for audit
    logSecurityEvent('Super Admin Access', {
      userId: req.userId,
      targetCompanyId: extractCompanyIdFromRequest(req),
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    // Allow access to any tenant data
    (req as any).bypassTenantIsolation = true;
  }

  next();
};

/**
 * Cross-tenant access validator
 * For specific business cases where cross-tenant access is legitimate
 */
export const validateCrossTenantAccess = (allowedRelationships: string[] = []) => {
  return (req: TenantRequest, res: Response, next: NextFunction): void => {
    const requestedCompanyId = extractCompanyIdFromRequest(req);

    if (requestedCompanyId && requestedCompanyId !== req.companyId) {
      // Check if this cross-tenant access is allowed
      const isAllowed = allowedRelationships.some(relationship => {
        // Implement relationship validation logic here
        // For example: parent-subsidiary relationships, partnerships, etc.
        return validateRelationship(req.companyId!, requestedCompanyId, relationship);
      });

      if (!isAllowed) {
        throw new ForbiddenError('Cross-tenant access not authorized');
      }

      // Log authorized cross-tenant access
      logSecurityEvent('Authorized Cross-Tenant Access', {
        userId: req.userId,
        sourceCompanyId: req.companyId,
        targetCompanyId: requestedCompanyId,
        allowedRelationships,
        url: req.originalUrl,
        method: req.method,
      });
    }

    next();
  };
};

/**
 * Validate relationship between companies
 * This would typically query a relationships table or service
 */
function validateRelationship(
  sourceCompanyId: string,
  targetCompanyId: string,
  relationship: string
): boolean {
  // Placeholder implementation
  // In a real application, this would check a relationships database
  // Examples: parent-subsidiary, partnership, vendor-client, etc.

  logger.debug('Validating company relationship', {
    sourceCompanyId,
    targetCompanyId,
    relationship,
  });

  // For now, return false (no cross-tenant access allowed)
  return false;
}
