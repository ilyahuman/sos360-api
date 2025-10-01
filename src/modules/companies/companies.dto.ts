/**
 * Company DTOs (Data Transfer Objects)
 * Simple types for requests and responses that work with Prisma
 */

import {
  Company,
  CompanyBusinessType,
  SubscriptionPlanType,
  SubscriptionStatusType,
  BillingCycleType,
  Prisma,
} from '@prisma/client';

/**
 * Request DTOs
 */
export interface CreateCompanyDTO {
  businessName: string;
  businessType: CompanyBusinessType;
  taxId?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: Prisma.InputJsonValue | null;
  timezone?: string;
  currency?: string;
}

export interface UpdateCompanyDTO {
  businessName?: string;
  businessType?: CompanyBusinessType;
  taxId?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: Prisma.InputJsonValue | null;
  settings?: Prisma.InputJsonValue;
  timezone?: string;
  currency?: string;
}

export interface UpdateSubscriptionDTO {
  subscriptionPlan?: SubscriptionPlanType;
  subscriptionStatus?: SubscriptionStatusType;
  billingCycle?: BillingCycleType;
  mrr?: number;
  stripeCustomerId?: string | null;
}

export interface CompanyFiltersDTO {
  businessName?: string;
  businessType?: CompanyBusinessType;
  subscriptionStatus?: SubscriptionStatusType;
  isActive?: boolean;
  search?: string;
}

export interface PaginationDTO {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Response DTOs
 */
export interface CompanyResponseDTO {
  id: string;
  businessName: string;
  businessType: CompanyBusinessType;
  taxId: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: Prisma.JsonValue | null;
  subscriptionPlan: SubscriptionPlanType;
  subscriptionStatus: SubscriptionStatusType;
  billingCycle: BillingCycleType;
  mrr: number;
  stripeCustomerId: string | null;
  settings: Prisma.JsonValue;
  timezone: string;
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyListResponseDTO {
  companies: CompanyResponseDTO[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CompanyStatsDTO {
  userCount: number;
  contactCount: number;
  propertyCount: number;
  opportunityCount: number;
  projectCount: number;
  divisionCount: number;
}

/**
 * Mapper functions to convert between Prisma models and DTOs
 */
export class CompanyDTOMapper {
  static toResponse(company: Company): CompanyResponseDTO {
    return {
      id: company.id,
      businessName: company.businessName,
      businessType: company.businessType,
      taxId: company.taxId,
      email: company.email,
      phone: company.phone,
      website: company.website,
      address: company.address,
      subscriptionPlan: company.subscriptionPlan,
      subscriptionStatus: company.subscriptionStatus,
      billingCycle: company.billingCycle,
      mrr: company.mrr.toNumber(),
      stripeCustomerId: company.stripeCustomerId,
      settings: company.settings,
      timezone: company.timezone,
      currency: company.currency,
      isActive: company.isActive,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    };
  }

  static toResponseList(companies: Company[]): CompanyResponseDTO[] {
    return companies.map(company => this.toResponse(company));
  }

  static toCreateInput(dto: CreateCompanyDTO, userId: string): Prisma.CompanyCreateInput {
    return {
      businessName: dto.businessName,
      businessType: dto.businessType,
      taxId: dto.taxId ?? null,
      email: dto.email ?? null,
      phone: dto.phone ?? null,
      website: dto.website ?? null,
      address: dto.address ?? Prisma.JsonNull,
      settings: {},
      timezone: dto.timezone || 'America/New_York',
      currency: dto.currency || 'USD',
      subscriptionPlan: SubscriptionPlanType.BASIC,
      subscriptionStatus: SubscriptionStatusType.TRIAL,
      billingCycle: BillingCycleType.MONTHLY,
      mrr: 0,
      isActive: true,
      createdBy: userId,
      updatedBy: userId,
    };
  }

  static toUpdateInput(dto: UpdateCompanyDTO, userId: string): Prisma.CompanyUpdateInput {
    const updateData: Prisma.CompanyUpdateInput = {
      updatedBy: userId,
      updatedAt: new Date(),
    };

    if (dto.businessName !== undefined) updateData.businessName = dto.businessName;
    if (dto.businessType !== undefined) updateData.businessType = dto.businessType;
    if (dto.taxId !== undefined) updateData.taxId = dto.taxId;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.website !== undefined) updateData.website = dto.website;
    if (dto.address !== undefined) updateData.address = dto.address ?? Prisma.JsonNull;
    if (dto.settings !== undefined) updateData.settings = dto.settings;
    if (dto.timezone !== undefined) updateData.timezone = dto.timezone;
    if (dto.currency !== undefined) updateData.currency = dto.currency;

    return updateData;
  }

  static toWhereInput(filters: CompanyFiltersDTO): Prisma.CompanyWhereInput {
    const where: Prisma.CompanyWhereInput = {};

    if (filters.businessName) {
      where.businessName = {
        contains: filters.businessName,
        mode: 'insensitive',
      };
    }

    if (filters.businessType) {
      where.businessType = filters.businessType;
    }

    if (filters.subscriptionStatus) {
      where.subscriptionStatus = filters.subscriptionStatus;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.search) {
      where.OR = [
        { businessName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search } },
      ];
    }

    // Always exclude soft-deleted records
    where.deletedAt = null;

    return where;
  }
}
