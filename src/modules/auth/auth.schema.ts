/**
 * Auth Module Validation Schemas
 *
 * Zod schemas for input validation in authentication and registration endpoints.
 */

import { z } from 'zod';

/**
 * Register Company Schema
 *
 * Validates the entire registration payload including company info,
 * first user info, and terms agreement.
 */
export const registerCompanySchema = z.object({
  company: z.object({
    businessName: z
      .string()
      .min(2, 'Business name must be at least 2 characters')
      .max(255, 'Business name must not exceed 255 characters'),
    email: z.string().email('Invalid email address'),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format (E.164)')
      .optional(),
  }),
  user: z.object({
    firstName: z
      .string()
      .min(1, 'First name is required')
      .max(100, 'First name must not exceed 100 characters'),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .max(100, 'Last name must not exceed 100 characters'),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[@$!%*?&#]/, 'Password must contain at least one special character (@$!%*?&#)'),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format (E.164)')
      .optional(),
  }),
  agreeToTerms: z.literal(true).refine(val => val === true, {
    message: 'You must agree to the terms of service',
  }),
});

/**
 * Login Schema
 *
 * Validates user login credentials.
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Refresh Token Schema
 *
 * Validates refresh token request.
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Export inferred types for use in controllers and services
export type RegisterCompanyDTO = z.infer<typeof registerCompanySchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
export type RefreshTokenDTO = z.infer<typeof refreshTokenSchema>;
