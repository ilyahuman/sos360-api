/**
 * Request Type Definitions (Refactored)
 * Provides a single, unified, and type-safe structure for the application's request context.
 */
import { Request } from 'express';
import { UserRoleType } from '@prisma/client'; // Assuming enum is available

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
 * Defines the application-specific context that is built up by our middleware stack.
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

// Augment the global Express Request interface with our custom context.
// This provides type safety and autocompletion throughout the application.
declare global {
  namespace Express {
    export interface Request {
      context: AppContext;
    }
  }
}

// Request body types for specific operations remain the same.
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  companyName: string;
}

export interface AuthenticatedRequest extends Request {
  user: UserIdentity;
  userId?: string;
  companyId?: string;
  userRole?: string;
}
