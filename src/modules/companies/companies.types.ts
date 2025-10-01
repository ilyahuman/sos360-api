/**
 * Company Types
 * Simple types that work with Prisma and DTOs
 */

import { Company } from '@prisma/client';
import {
  CreateCompanyDTO,
  UpdateCompanyDTO,
  CompanyResponseDTO,
  CompanyStatsDTO
} from './companies.dto';

// Re-export DTOs for backward compatibility
export type CreateCompanyRequest = CreateCompanyDTO;
export type UpdateCompanyRequest = UpdateCompanyDTO;
export type CompanyResponse = CompanyResponseDTO;
export type CompanyStats = CompanyStatsDTO;

// Service response types
export interface ServiceResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

// Validation error type
export interface ValidationError {
  field: string;
  message: string;
}

// Company with relations (if needed)
export interface CompanyWithRelations extends Company {
  users?: any[];
  divisions?: any[];
  contacts?: any[];
}