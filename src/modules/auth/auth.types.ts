/**
 * Auth Module Type Definitions
 *
 * TypeScript interfaces and types for authentication and registration.
 */

import { UserRoleType } from '@prisma/client';

/**
 * Input for company registration.
 * This combines company info, first user info, and terms agreement.
 */
export interface RegisterCompanyInput {
  company: {
    businessName: string;
    email: string;
    phone?: string;
  };
  user: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  };
  agreeToTerms: boolean;
}

/**
 * Input for user login.
 */
export interface LoginInput {
  email: string;
  password: string;
}

/**
 * Input for token refresh.
 */
export interface RefreshTokenInput {
  refreshToken: string;
}

/**
 * Response from successful registration.
 */
export interface RegisterCompanyResponse {
  company: {
    id: string;
    businessName: string;
    email: string;
  };
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRoleType;
  };
  division: {
    id: string;
    name: string;
  };
}

/**
 * Response from successful login.
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number; // seconds
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRoleType;
    companyId: string;
    divisionId: string;
  };
}

/**
 * Response from token refresh.
 */
export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number; // seconds
}

/**
 * User profile response.
 */
export interface UserProfileResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: UserRoleType;
  permissions: unknown;
  companyId: string;
  divisionId: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  company: {
    id: string;
    businessName: string;
    subscriptionPlan: string;
    subscriptionStatus: string;
  };
  division: {
    id: string;
    name: string;
    divisionType: string;
  };
}
