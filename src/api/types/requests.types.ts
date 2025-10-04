/**
 * Request Type Definitions (Final)
 * Provides a single, unified, and type-safe structure for the application's request context.
 */
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
 * Defines the application-specific context built by our middleware.
 * This provides a consistent, type-safe object on every request.
 */
export interface AppContext {
  requestId: string;
  startTime: number;
  user?: UserIdentity; // User is optional for public routes
  tenantContext?: {
    companyId: string;
    userId: string;
  };
  bypassTenantIsolation?: boolean;
}

// Augment the global Express Request interface with our custom context.
declare global {
  namespace Express {
    export interface Request {
      context: AppContext;
      user?: UserIdentity;
    }
  }
}

// --- Request Body DTOs ---

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
