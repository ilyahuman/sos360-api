/**
 * Property DTOs (Data Transfer Objects)
 * Simple types for requests and responses that work with Prisma
 */

import {
  Property,
  PropertyTypeEnum,
  Prisma,
} from '@prisma/client';

/**
 * Request DTOs
 */
export interface CreatePropertyDTO {
  name?: string | null;
  propertyType: PropertyTypeEnum;
  address: Prisma.InputJsonValue;
  coordinates?: string | null;
  primaryContactId: string;
  divisionId?: string | null;
  totalArea?: number | null;
  surfaceTypes?: Prisma.InputJsonValue;
  parkingSpacesCount?: number | null;
  accessRestrictions?: string | null;
  specialRequirements?: string | null;
  photos?: Prisma.InputJsonValue;
  sitePlans?: Prisma.InputJsonValue;
  spotonSiteProjectId?: string | null;
  autoSpotonSiteCreation?: boolean;
  mappingMethodPreference?: string | null;
  takeoffProgramPreference?: string | null;
  notes?: string | null;
  tags?: Prisma.InputJsonValue;
  customFields?: Prisma.InputJsonValue;
}

export interface UpdatePropertyDTO {
  name?: string | null;
  propertyType?: PropertyTypeEnum;
  address?: Prisma.InputJsonValue;
  coordinates?: string | null;
  primaryContactId?: string;
  divisionId?: string | null;
  totalArea?: number | null;
  surfaceTypes?: Prisma.InputJsonValue;
  parkingSpacesCount?: number | null;
  accessRestrictions?: string | null;
  specialRequirements?: string | null;
  photos?: Prisma.InputJsonValue;
  sitePlans?: Prisma.InputJsonValue;
  spotonSiteProjectId?: string | null;
  autoSpotonSiteCreation?: boolean;
  mappingMethodPreference?: string | null;
  takeoffProgramPreference?: string | null;
  notes?: string | null;
  tags?: Prisma.InputJsonValue;
  customFields?: Prisma.InputJsonValue;
}

export interface PropertyFiltersDTO {
  propertyType?: PropertyTypeEnum;
  divisionId?: string;
  primaryContactId?: string;
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
export interface PropertyResponseDTO {
  id: string;
  companyId: string;
  divisionId: string | null;
  primaryContactId: string;
  name: string | null;
  propertyType: PropertyTypeEnum;
  address: Prisma.JsonValue;
  coordinates: string | null;
  totalArea: number | null;
  surfaceTypes: Prisma.JsonValue;
  parkingSpacesCount: number | null;
  accessRestrictions: string | null;
  specialRequirements: string | null;
  photos: Prisma.JsonValue;
  sitePlans: Prisma.JsonValue;
  previousWorkHistory: Prisma.JsonValue;
  spotonSiteProjectId: string | null;
  googlePlacesId: string | null;
  autoSpotonSiteCreation: boolean;
  mappingMethodPreference: string | null;
  takeoffProgramPreference: string | null;
  notes: string | null;
  tags: Prisma.JsonValue;
  customFields: Prisma.JsonValue;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  // Relations (optional)
  primaryContact?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    companyName: string | null;
  };
  division?: {
    id: string;
    name: string;
  };
}

export interface PropertyListResponseDTO {
  properties: PropertyResponseDTO[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PropertyStatsDTO {
  totalProperties: number;
  byPropertyType: Record<string, number>;
  byDivision: Record<string, number>;
  totalSquareFootage: number;
  averagePropertySize: number;
}

/**
 * Mapper functions to convert between Prisma models and DTOs
 */
export class PropertyDTOMapper {
  static toResponse(property: Property & {
    primaryContact?: any;
    division?: any;
  }): PropertyResponseDTO {
    const response: PropertyResponseDTO = {
      id: property.id,
      companyId: property.companyId,
      divisionId: property.divisionId,
      primaryContactId: property.primaryContactId,
      name: property.name,
      propertyType: property.propertyType,
      address: property.address,
      coordinates: property.coordinates,
      totalArea: property.totalArea ? property.totalArea.toNumber() : null,
      surfaceTypes: property.surfaceTypes,
      parkingSpacesCount: property.parkingSpacesCount,
      accessRestrictions: property.accessRestrictions,
      specialRequirements: property.specialRequirements,
      photos: property.photos,
      sitePlans: property.sitePlans,
      previousWorkHistory: property.previousWorkHistory,
      spotonSiteProjectId: property.spotonSiteProjectId,
      googlePlacesId: property.googlePlacesId,
      autoSpotonSiteCreation: property.autoSpotonSiteCreation,
      mappingMethodPreference: property.mappingMethodPreference,
      takeoffProgramPreference: property.takeoffProgramPreference,
      notes: property.notes,
      tags: property.tags,
      customFields: property.customFields,
      isActive: property.isActive,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
      createdBy: property.createdBy,
      updatedBy: property.updatedBy,
    };

    if (property.primaryContact) {
      response.primaryContact = {
        id: property.primaryContact.id,
        firstName: property.primaryContact.firstName,
        lastName: property.primaryContact.lastName,
        email: property.primaryContact.email,
        phone: property.primaryContact.phone,
        companyName: property.primaryContact.companyName,
      };
    }

    if (property.division) {
      response.division = {
        id: property.division.id,
        name: property.division.name,
      };
    }

    return response;
  }

  static toResponseList(properties: (Property & {
    primaryContact?: any;
    division?: any;
  })[]): PropertyResponseDTO[] {
    return properties.map(property => this.toResponse(property));
  }

  static toCreateInput(dto: CreatePropertyDTO, userId: string, companyId: string): Prisma.PropertyUncheckedCreateInput {
    return {
      name: dto.name ?? null,
      propertyType: dto.propertyType,
      address: dto.address,
      coordinates: dto.coordinates ?? null,
      totalArea: dto.totalArea ?? null,
      surfaceTypes: dto.surfaceTypes ?? [],
      parkingSpacesCount: dto.parkingSpacesCount ?? null,
      accessRestrictions: dto.accessRestrictions ?? null,
      specialRequirements: dto.specialRequirements ?? null,
      photos: dto.photos ?? [],
      sitePlans: dto.sitePlans ?? [],
      previousWorkHistory: [],
      spotonSiteProjectId: dto.spotonSiteProjectId ?? null,
      autoSpotonSiteCreation: dto.autoSpotonSiteCreation ?? false,
      mappingMethodPreference: dto.mappingMethodPreference ?? null,
      takeoffProgramPreference: dto.takeoffProgramPreference ?? null,
      notes: dto.notes ?? null,
      tags: dto.tags ?? [],
      customFields: dto.customFields ?? {},
      isActive: true,
      // Direct field assignment instead of connect
      companyId,
      primaryContactId: dto.primaryContactId,
      // TODO(!!!): Use actual authenticated user IDs when User/Auth module is implemented
      createdBy: userId,
      updatedBy: userId,
      // Optional division
      ...(dto.divisionId && { divisionId: dto.divisionId }),
    };
  }

  static toUpdateInput(dto: UpdatePropertyDTO, userId: string): Prisma.PropertyUncheckedUpdateInput {
    const updateData: Prisma.PropertyUncheckedUpdateInput = {
      // TODO(!!!): Use actual authenticated user ID when User/Auth module is implemented
      updatedBy: userId,
      updatedAt: new Date(),
    };

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.propertyType !== undefined) updateData.propertyType = dto.propertyType;
    if (dto.address !== undefined) updateData.address = dto.address;
    if (dto.coordinates !== undefined) updateData.coordinates = dto.coordinates;
    if (dto.totalArea !== undefined) updateData.totalArea = dto.totalArea;
    if (dto.surfaceTypes !== undefined) updateData.surfaceTypes = dto.surfaceTypes;
    if (dto.parkingSpacesCount !== undefined) updateData.parkingSpacesCount = dto.parkingSpacesCount;
    if (dto.accessRestrictions !== undefined) updateData.accessRestrictions = dto.accessRestrictions;
    if (dto.specialRequirements !== undefined) updateData.specialRequirements = dto.specialRequirements;
    if (dto.photos !== undefined) updateData.photos = dto.photos;
    if (dto.sitePlans !== undefined) updateData.sitePlans = dto.sitePlans;
    if (dto.spotonSiteProjectId !== undefined) updateData.spotonSiteProjectId = dto.spotonSiteProjectId;
    if (dto.autoSpotonSiteCreation !== undefined) updateData.autoSpotonSiteCreation = dto.autoSpotonSiteCreation;
    if (dto.mappingMethodPreference !== undefined) updateData.mappingMethodPreference = dto.mappingMethodPreference;
    if (dto.takeoffProgramPreference !== undefined) updateData.takeoffProgramPreference = dto.takeoffProgramPreference;
    if (dto.notes !== undefined) updateData.notes = dto.notes;
    if (dto.tags !== undefined) updateData.tags = dto.tags;
    if (dto.customFields !== undefined) updateData.customFields = dto.customFields;

    // Handle relations separately - direct field assignment
    if (dto.primaryContactId !== undefined) {
      updateData.primaryContactId = dto.primaryContactId;
    }

    if (dto.divisionId !== undefined) {
      updateData.divisionId = dto.divisionId;
    }

    return updateData;
  }

  static toWhereInput(filters: PropertyFiltersDTO, companyId: string): Prisma.PropertyWhereInput {
    const where: Prisma.PropertyWhereInput = {
      companyId,
      deletedAt: null,
    };

    if (filters.propertyType) {
      where.propertyType = filters.propertyType;
    }

    if (filters.divisionId) {
      where.divisionId = filters.divisionId;
    }

    if (filters.primaryContactId) {
      where.primaryContactId = filters.primaryContactId;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { notes: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }
}
