import { DivisionTypeEnum, Division as PrismaDivision } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// Address interface matching Company address structure
export interface DivisionAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  [key: string]: any;
}

// Settings interface matching Prisma JSON structure
export interface DivisionSettings {
  operatingRegion?: string[];
  specializations?: string[];
  budgetLimits?: {
    maxJobValue?: number;
    dailySpendLimit?: number;
  };
  customFields?: Record<string, any>;
  automationRules?: Record<string, any>;
  [key: string]: any;
}

// Request/Response Types
export interface CreateDivisionRequest {
  name: string;
  description?: string;
  divisionType?: DivisionTypeEnum;
  phone?: string;
  email?: string;
  address?: DivisionAddress;
  divisionManagerId?: string;
  parentDivisionId?: string;
  targetRevenue?: number;
  targetMarginPercentage?: number;
  colorCode?: string;
  icon?: string;
  settings?: DivisionSettings;
}

export interface UpdateDivisionRequest {
  name?: string;
  description?: string;
  divisionType?: DivisionTypeEnum;
  phone?: string;
  email?: string;
  address?: DivisionAddress;
  divisionManagerId?: string;
  parentDivisionId?: string;
  targetRevenue?: number;
  targetMarginPercentage?: number;
  colorCode?: string;
  icon?: string;
  settings?: DivisionSettings;
  isActive?: boolean;
}

export interface DivisionResponse {
  id: string;
  companyId: string;
  name: string;
  description?: string | null;
  divisionType: DivisionTypeEnum;
  phone?: string | null;
  email?: string | null;
  address?: DivisionAddress | null;
  divisionManagerId?: string | null;
  parentDivisionId?: string | null;
  targetRevenue?: number | null;
  targetMarginPercentage?: number | null;
  employeeCount: number;
  activeProjectsCount: number;
  colorCode: string;
  icon?: string | null;
  sortOrder: number;
  settings: DivisionSettings;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
  updatedBy?: string | null;
}

// Internal service layer types
export interface CreateDivisionData extends CreateDivisionRequest {
  companyId: string;
  createdBy: string;
  updatedBy: string;
}

export interface UpdateDivisionData extends UpdateDivisionRequest {
  updatedBy: string;
}

// Division statistics interface
export interface DivisionStats {
  id: string;
  name: string;
  divisionType: DivisionTypeEnum;
  employeeCount: number;
  activeProjectsCount: number;
  totalRevenue: number;
  totalOpportunities: number;
  avgProjectValue: number;
  completionRate: number;
  targetRevenue?: number | null;
  targetMarginPercentage?: number | null;
  performanceStatus: 'above_target' | 'on_target' | 'below_target' | 'no_target';
}

// Division hierarchy types
export interface DivisionHierarchy {
  division: DivisionResponse;
  children: DivisionHierarchy[];
  level: number;
  path: string[];
}

// Entity reassignment types
export interface EntityReassignmentRequest {
  entityType: 'user' | 'contact' | 'property' | 'opportunity' | 'project';
  entityId: string;
  newDivisionId?: string; // null means assign to company level
}

export interface EntityReassignmentResponse {
  success: boolean;
  entityType: string;
  entityId: string;
  previousDivisionId?: string | null;
  newDivisionId?: string | null;
  message: string;
}

// Bulk reassignment types
export interface BulkReassignmentRequest {
  assignments: EntityReassignmentRequest[];
}

export interface BulkReassignmentResponse {
  successCount: number;
  failureCount: number;
  results: EntityReassignmentResponse[];
}

// Type utilities for working with Prisma Decimal
export type DivisionWithDecimal = PrismaDivision;
export type DivisionForResponse = Omit<
  DivisionWithDecimal,
  'targetRevenue' | 'targetMarginPercentage' | 'address' | 'settings'
> & {
  targetRevenue?: number | null;
  targetMarginPercentage?: number | null;
  address?: DivisionAddress | null;
  settings: DivisionSettings;
};
