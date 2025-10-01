/**
 * Contact DTOs (Data Transfer Objects)
 * Handles leads and contacts for the CRM system
 */

import {
  Contact,
  ContactTypeEnum,
  LeadSourceEnum,
  LeadStatusEnum,
  ContactMethodEnum,
  LeadTypeClassificationEnum,
  LeadNoteStyleEnum,
  Prisma,
} from '@prisma/client';

/**
 * Request DTOs
 */
export interface CreateContactDTO {
  // Personal Information
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  jobTitle?: string | null;
  companyName?: string | null;

  // Optional Division Assignment
  divisionId?: string | null;

  // Classification
  contactType?: ContactTypeEnum;
  leadSource?: LeadSourceEnum;
  leadStatus?: LeadStatusEnum;

  // Lead Type Classification System
  leadTypeClassification?: LeadTypeClassificationEnum | null;
  leadColorCode?: string | null;
  leadNoteStyle?: LeadNoteStyleEnum | null;
  qualificationRequired?: boolean;

  // Web Form Integration
  webFormSourceId?: string | null;
  servicePreferences?: any[];
  timelinePreference?: string | null;
  estimatedProjectSize?: string | null;
  propertyTypePreference?: string | null;

  // Relationship Management
  assignedUserId?: string | null;
  relationshipStage?: string | null;

  // Communication
  preferredContactMethod?: ContactMethodEnum;
  communicationPreferences?: Prisma.InputJsonValue;

  // Additional Information
  notes?: string | null;
  tags?: any[];
  customFields?: Prisma.InputJsonValue;
  address?: Prisma.InputJsonValue | null;
}

export interface UpdateContactDTO {
  // Personal Information
  firstName?: string;
  lastName?: string;
  email?: string | null;
  phone?: string | null;
  jobTitle?: string | null;
  companyName?: string | null;

  // Division Assignment
  divisionId?: string | null;

  // Classification
  contactType?: ContactTypeEnum;
  leadSource?: LeadSourceEnum;
  leadStatus?: LeadStatusEnum;

  // Lead Type Classification System
  leadTypeClassification?: LeadTypeClassificationEnum | null;
  leadColorCode?: string | null;
  leadNoteStyle?: LeadNoteStyleEnum | null;
  qualificationRequired?: boolean;

  // Relationship Management
  assignedUserId?: string | null;
  relationshipStage?: string | null;

  // Communication Tracking
  lastContactDate?: Date | string;
  nextFollowUpDate?: Date | string | null;
  followUpCount?: number;

  // Preferences
  preferredContactMethod?: ContactMethodEnum;
  communicationPreferences?: Prisma.InputJsonValue;

  // Additional Information
  notes?: string | null;
  tags?: any[];
  customFields?: Prisma.InputJsonValue;
  address?: Prisma.InputJsonValue | null;

  // Service Preferences (from web forms)
  servicePreferences?: any[];
  timelinePreference?: string | null;
  estimatedProjectSize?: string | null;
  propertyTypePreference?: string | null;
}

export interface ContactFiltersDTO {
  // Basic filters
  search?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  companyName?: string;

  // Classification filters
  contactType?: ContactTypeEnum;
  leadSource?: LeadSourceEnum;
  leadStatus?: LeadStatusEnum;
  leadTypeClassification?: LeadTypeClassificationEnum;

  // Assignment filters
  divisionId?: string;
  assignedUserId?: string;

  // Status filters
  isActive?: boolean;
  qualificationRequired?: boolean;

  // Date filters
  nextFollowUpDateFrom?: Date | string;
  nextFollowUpDateTo?: Date | string;
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
export interface ContactResponseDTO {
  id: string;
  companyId: string;
  divisionId: string | null;

  // Personal Information
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  jobTitle: string | null;
  companyName: string | null;

  // Classification
  contactType: ContactTypeEnum;
  leadSource: LeadSourceEnum;
  leadStatus: LeadStatusEnum;

  // Lead Type Classification System
  leadTypeClassification: LeadTypeClassificationEnum | null;
  leadColorCode: string | null;
  leadNoteStyle: LeadNoteStyleEnum | null;
  qualificationRequired: boolean;

  // Web Form Integration
  webFormSourceId: string | null;
  servicePreferences: any[];
  timelinePreference: string | null;
  estimatedProjectSize: string | null;
  propertyTypePreference: string | null;

  // Relationship Management
  assignedUserId: string | null;
  relationshipStage: string | null;

  // Communication Tracking
  lastContactDate: Date | null;
  nextFollowUpDate: Date | null;
  followUpCount: number;

  // Preferences
  preferredContactMethod: ContactMethodEnum;
  communicationPreferences: Prisma.JsonValue;

  // Additional Information
  notes: string | null;
  tags: any[];
  customFields: Prisma.JsonValue;
  address: Prisma.JsonValue | null;

  // Status
  isActive: boolean;

  // Audit Trail
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactListResponseDTO {
  contacts: ContactResponseDTO[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ContactStatsDTO {
  totalContacts: number;
  leadCount: number;
  prospectCount: number;
  qualifiedCount: number;
  customerCount: number;
  inactiveCount: number;

  // By Type
  commercialCount: number;
  residentialCount: number;
  hoaCount: number;
  municipalCount: number;
  industrialCount: number;

  // Follow-ups
  overdueFollowUps: number;
  upcomingFollowUps: number;
}

/**
 * Mapper functions to convert between Prisma models and DTOs
 */
export class ContactDTOMapper {
  static toResponse(contact: Contact): ContactResponseDTO {
    return {
      id: contact.id,
      companyId: contact.companyId,
      divisionId: contact.divisionId,

      // Personal Information
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      jobTitle: contact.jobTitle,
      companyName: contact.companyName,

      // Classification
      contactType: contact.contactType,
      leadSource: contact.leadSource,
      leadStatus: contact.leadStatus,

      // Lead Type Classification
      leadTypeClassification: contact.leadTypeClassification,
      leadColorCode: contact.leadColorCode,
      leadNoteStyle: contact.leadNoteStyle,
      qualificationRequired: contact.qualificationRequired,

      // Web Form Integration
      webFormSourceId: contact.webFormSourceId,
      servicePreferences: contact.servicePreferences as any[],
      timelinePreference: contact.timelinePreference,
      estimatedProjectSize: contact.estimatedProjectSize,
      propertyTypePreference: contact.propertyTypePreference,

      // Relationship Management
      assignedUserId: contact.assignedUserId,
      relationshipStage: contact.relationshipStage,

      // Communication
      lastContactDate: contact.lastContactDate,
      nextFollowUpDate: contact.nextFollowUpDate,
      followUpCount: contact.followUpCount,
      preferredContactMethod: contact.preferredContactMethod,
      communicationPreferences: contact.communicationPreferences,

      // Additional
      notes: contact.notes,
      tags: contact.tags as any[],
      customFields: contact.customFields,
      address: contact.address,

      // Status
      isActive: contact.isActive,

      // Audit
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
    };
  }

  static toResponseList(contacts: Contact[]): ContactResponseDTO[] {
    return contacts.map(contact => this.toResponse(contact));
  }

  static toCreateInput(
    dto: CreateContactDTO,
    companyId: string,
    userId: string
  ): Prisma.ContactCreateInput {
    return {
      // Company relationship
      company: { connect: { id: companyId } },
      // Required fields
      firstName: dto.firstName,
      lastName: dto.lastName,

      // Division relationship (optional)
      ...(dto.divisionId && { division: { connect: { id: dto.divisionId } } }),

      // Optional personal info
      email: dto.email ?? null,
      phone: dto.phone ?? null,
      jobTitle: dto.jobTitle ?? null,
      companyName: dto.companyName ?? null,

      // Classification with defaults
      contactType: dto.contactType ?? ContactTypeEnum.COMMERCIAL,
      leadSource: dto.leadSource ?? LeadSourceEnum.OTHER,
      leadStatus: dto.leadStatus ?? LeadStatusEnum.LEAD,

      // Lead Type Classification
      leadTypeClassification: dto.leadTypeClassification ?? null,
      leadColorCode: dto.leadColorCode ?? null,
      leadNoteStyle: dto.leadNoteStyle ?? null,
      qualificationRequired: dto.qualificationRequired ?? false,

      // Web Form Integration
      webFormSourceId: dto.webFormSourceId ?? null,
      servicePreferences: dto.servicePreferences ?? [],
      timelinePreference: dto.timelinePreference ?? null,
      estimatedProjectSize: dto.estimatedProjectSize ?? null,
      propertyTypePreference: dto.propertyTypePreference ?? null,

      // Relationship Management
      ...(dto.assignedUserId && { assignedUserId: dto.assignedUserId }),
      relationshipStage: dto.relationshipStage ?? null,

      // Communication
      preferredContactMethod: dto.preferredContactMethod ?? ContactMethodEnum.EMAIL,
      communicationPreferences: dto.communicationPreferences ?? {},

      // Additional
      notes: dto.notes ?? null,
      tags: dto.tags ?? [],
      customFields: dto.customFields ?? {},
      address: dto.address === null ? Prisma.DbNull : (dto.address ?? Prisma.JsonNull),

      // Status
      isActive: true,

      // Audit - TODO: Use actual user IDs when auth is implemented
      creator: { connect: { id: userId } },
      updater: { connect: { id: userId } },
    };
  }

  static toUpdateInput(dto: UpdateContactDTO, userId: string): Prisma.ContactUpdateInput {
    const updateData: Prisma.ContactUpdateInput = {
      // TODO: Use actual user ID when auth is implemented
      updater: { connect: { id: userId } },
      updatedAt: new Date(),
    };

    // Personal Information
    if (dto.firstName !== undefined) updateData.firstName = dto.firstName;
    if (dto.lastName !== undefined) updateData.lastName = dto.lastName;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.jobTitle !== undefined) updateData.jobTitle = dto.jobTitle;
    if (dto.companyName !== undefined) updateData.companyName = dto.companyName;

    // Division Assignment
    if (dto.divisionId !== undefined) {
      updateData.division = dto.divisionId
        ? { connect: { id: dto.divisionId } }
        : { disconnect: true };
    }

    // Classification
    if (dto.contactType !== undefined) updateData.contactType = dto.contactType;
    if (dto.leadSource !== undefined) updateData.leadSource = dto.leadSource;
    if (dto.leadStatus !== undefined) updateData.leadStatus = dto.leadStatus;

    // Lead Type Classification
    if (dto.leadTypeClassification !== undefined)
      updateData.leadTypeClassification = dto.leadTypeClassification;
    if (dto.leadColorCode !== undefined) updateData.leadColorCode = dto.leadColorCode;
    if (dto.leadNoteStyle !== undefined) updateData.leadNoteStyle = dto.leadNoteStyle;
    if (dto.qualificationRequired !== undefined)
      updateData.qualificationRequired = dto.qualificationRequired;

    // Relationship Management
    if (dto.assignedUserId !== undefined) updateData.assignedUserId = dto.assignedUserId;
    if (dto.relationshipStage !== undefined) updateData.relationshipStage = dto.relationshipStage;

    // Communication Tracking
    if (dto.lastContactDate !== undefined)
      updateData.lastContactDate = new Date(dto.lastContactDate);
    if (dto.nextFollowUpDate !== undefined) {
      updateData.nextFollowUpDate = dto.nextFollowUpDate ? new Date(dto.nextFollowUpDate) : null;
    }
    if (dto.followUpCount !== undefined) updateData.followUpCount = dto.followUpCount;

    // Preferences
    if (dto.preferredContactMethod !== undefined)
      updateData.preferredContactMethod = dto.preferredContactMethod;
    if (dto.communicationPreferences !== undefined)
      updateData.communicationPreferences = dto.communicationPreferences;

    // Additional
    if (dto.notes !== undefined) updateData.notes = dto.notes;
    if (dto.tags !== undefined) updateData.tags = dto.tags;
    if (dto.customFields !== undefined) updateData.customFields = dto.customFields;
    if (dto.address !== undefined)
      updateData.address = dto.address === null ? Prisma.DbNull : (dto.address ?? Prisma.JsonNull);

    // Service Preferences
    if (dto.servicePreferences !== undefined)
      updateData.servicePreferences = dto.servicePreferences;
    if (dto.timelinePreference !== undefined)
      updateData.timelinePreference = dto.timelinePreference;
    if (dto.estimatedProjectSize !== undefined)
      updateData.estimatedProjectSize = dto.estimatedProjectSize;
    if (dto.propertyTypePreference !== undefined)
      updateData.propertyTypePreference = dto.propertyTypePreference;

    return updateData;
  }

  static toWhereInput(filters: ContactFiltersDTO, companyId?: string): Prisma.ContactWhereInput {
    const where: Prisma.ContactWhereInput = {};

    // Company scope (multi-tenant)
    if (companyId) {
      where.companyId = companyId;
    }

    // Search across multiple fields
    if (filters.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search } },
        { companyName: { contains: filters.search, mode: 'insensitive' } },
        { jobTitle: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Direct field filters
    if (filters.firstName) {
      where.firstName = { contains: filters.firstName, mode: 'insensitive' };
    }
    if (filters.lastName) {
      where.lastName = { contains: filters.lastName, mode: 'insensitive' };
    }
    if (filters.email) {
      where.email = { contains: filters.email, mode: 'insensitive' };
    }
    if (filters.phone) {
      where.phone = { contains: filters.phone };
    }
    if (filters.companyName) {
      where.companyName = { contains: filters.companyName, mode: 'insensitive' };
    }

    // Classification filters
    if (filters.contactType) where.contactType = filters.contactType;
    if (filters.leadSource) where.leadSource = filters.leadSource;
    if (filters.leadStatus) where.leadStatus = filters.leadStatus;
    if (filters.leadTypeClassification)
      where.leadTypeClassification = filters.leadTypeClassification;

    // Assignment filters
    if (filters.divisionId !== undefined) {
      where.divisionId = filters.divisionId;
    }
    if (filters.assignedUserId !== undefined) {
      where.assignedUserId = filters.assignedUserId;
    }

    // Status filters
    if (filters.isActive !== undefined) where.isActive = filters.isActive;
    if (filters.qualificationRequired !== undefined)
      where.qualificationRequired = filters.qualificationRequired;

    // Date range filters for follow-ups
    if (filters.nextFollowUpDateFrom || filters.nextFollowUpDateTo) {
      where.nextFollowUpDate = {};
      if (filters.nextFollowUpDateFrom) {
        where.nextFollowUpDate.gte = new Date(filters.nextFollowUpDateFrom);
      }
      if (filters.nextFollowUpDateTo) {
        where.nextFollowUpDate.lte = new Date(filters.nextFollowUpDateTo);
      }
    }

    // Always exclude soft-deleted records
    where.deletedAt = null;

    return where;
  }
}
