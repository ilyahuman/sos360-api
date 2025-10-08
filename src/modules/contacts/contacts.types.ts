/**
 * Contact Types
 * Simple types that work with Prisma and DTOs
 */

import { Contact } from '@prisma/client';
import {
  CreateContactDTO,
  UpdateContactDTO,
  ContactResponseDTO,
  ContactStatsDTO,
} from './contacts.dto';

// Re-export DTOs for backward compatibility
export type CreateContactRequest = CreateContactDTO;
export type UpdateContactRequest = UpdateContactDTO;
export type ContactResponse = ContactResponseDTO;
export type ContactStats = ContactStatsDTO;

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

// Contact with relations (if needed for future)
export interface ContactWithRelations extends Contact {
  properties?: any[];
  opportunities?: any[];
  webFormSubmissions?: any[];
}