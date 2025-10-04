/**
 * companies.schema.ts
 *
 * This file contains all Zod schemas for input validation in the Companies module.
 * Schemas are defined for creating, updating, and listing companies, with distinctions
 * between the customer and admin flows where necessary.
 */

import { z } from 'zod';

// Shared schema for UUID validation in route parameters.
export const companyIdParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: 'Invalid company ID format' }),
  }),
});

// Schema for creating a new company (used by admins).
export const createCompanySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Company name must be at least 2 characters long'),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Invalid email address'),
  }),
});

// Schema for updating a company.
// Customer flow will update their own profile. Admin flow can update any company.
export const updateCompanySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Company name must be at least 2 characters long').optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Invalid email address').optional(),
    // Admin-only field
    isActive: z.boolean().optional(),
  }),
});

// Schema for list/query parameters, primarily for the admin flow's paginated list.
export const listCompaniesQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(20),
    sortBy: z.string().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    search: z.string().optional(),
  }),
});

// Export types inferred from schemas for use in services and controllers.
export type CreateCompanyInput = z.infer<typeof createCompanySchema>['body'];
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>['body'];
export type ListCompaniesQuery = z.infer<typeof listCompaniesQuerySchema>['query'];