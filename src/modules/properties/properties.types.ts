/**
 * Property Types
 * Simple types that work with Prisma and DTOs
 */

import { Property } from '@prisma/client';
import {
  CreatePropertyDTO,
  UpdatePropertyDTO,
  PropertyResponseDTO,
  PropertyStatsDTO
} from './properties.dto';

// Re-export DTOs for backward compatibility
export type CreatePropertyRequest = CreatePropertyDTO;
export type UpdatePropertyRequest = UpdatePropertyDTO;
export type PropertyResponse = PropertyResponseDTO;
export type PropertyStats = PropertyStatsDTO;

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

// Property with relations
export interface PropertyWithRelations extends Property {
  primaryContact?: any;
  division?: any;
  company?: any;
  opportunities?: any[];
}

// Address type
export interface AddressType {
  street: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
}

// Coordinates type
export interface CoordinatesType {
  latitude: number;
  longitude: number;
}