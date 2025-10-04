/**
 * companies.types.ts
 *
 * This file defines the TypeScript types and interfaces for the Companies module.
 * These types are used for data transfer objects (DTOs) and to ensure type safety
 * between the different layers of the application (controller, service, repository).
 */

import { Company } from '@prisma/client';

// The primary DTO for a Company, omitting sensitive or unnecessary fields.
export type CompanyDto = Omit<Company, 'deletedAt'>;

// Defines the structure for a paginated response of companies, used in the admin flow.
export interface PaginatedCompaniesResponse {
  data: CompanyDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
