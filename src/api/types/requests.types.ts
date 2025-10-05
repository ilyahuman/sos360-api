/**
 * Request Type Definitions
 * Provides a single, unified, and type-safe structure for the application's request context.
 */
import { Request } from 'express';
import { UserRoleType } from '@prisma/client';

/**
 * Defines the core user identity object, derived from the authentication token.
 * This is the source of truth for the user's identity within a request.
 */
export interface UserIdentity {
  id: string;
  companyId: string;
  role: UserRoleType;
  email: string;
}

/**
 * Defines the application-specific context built up by our middleware stack.
 * This provides a consistent, type-safe object on every authenticated request.
 */
export interface AppContext {
  requestId: string;
  startTime: number;
  user: UserIdentity;
  tenantContext?: {
    companyId: string;
    userId: string;
  };
  bypassTenantIsolation?: boolean;
}

/**
 * Augments the global Express Request interface with our custom context.
 * This provides type safety and autocompletion throughout the application.
 */
declare global {
  namespace Express {
    export interface Request {
      context: AppContext;
    }
  }
}
