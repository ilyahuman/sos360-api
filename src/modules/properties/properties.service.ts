/**
 * Property Service
 * Business logic layer using DTOs
 */

import { PropertyRepository } from './properties.repository';
import {
  CreatePropertyDTO,
  UpdatePropertyDTO,
  PropertyResponseDTO,
  PropertyListResponseDTO,
  PropertyFiltersDTO,
  PaginationDTO,
  PropertyDTOMapper,
  PropertyStatsDTO,
} from './properties.dto';
import { logger } from '@/shared/utils/logger';

export class PropertyService {
  constructor(private readonly propertyRepository: PropertyRepository) {}

  async createProperty(
    data: CreatePropertyDTO,
    userId: string,
    companyId: string
  ): Promise<PropertyResponseDTO> {
    // TODO: Validate primaryContactId exists and belongs to company when ContactService is available
    // TODO: Validate divisionId exists and belongs to company when DivisionService is available

    // TODO: Implement geocoding if address provided but coordinates missing (Google Maps API integration)

    logger.info(`Creating property for company ${companyId} by user ${userId}`);

    const property = await this.propertyRepository.create(data, userId, companyId);
    return PropertyDTOMapper.toResponse(property);
  }

  async getPropertyById(id: string, companyId: string): Promise<PropertyResponseDTO | null> {
    const property = await this.propertyRepository.findById(id, companyId);

    if (!property) {
      logger.warn(`Property ${id} not found for company ${companyId}`);
      return null;
    }

    return PropertyDTOMapper.toResponse(property);
  }

  async getAllProperties(
    companyId: string,
    filters: PropertyFiltersDTO = {},
    pagination: PaginationDTO = {}
  ): Promise<PropertyListResponseDTO> {
    const { properties, total } = await this.propertyRepository.findAll(
      companyId,
      filters,
      pagination
    );

    const { page = 1, limit = 10 } = pagination;

    return {
      properties: PropertyDTOMapper.toResponseList(properties),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPropertiesByContact(contactId: string, companyId: string): Promise<PropertyResponseDTO[]> {
    // TODO: Validate contactId exists and belongs to company when ContactService is available

    const properties = await this.propertyRepository.findByContact(contactId, companyId);
    return PropertyDTOMapper.toResponseList(properties);
  }

  async getPropertiesByDivision(divisionId: string, companyId: string): Promise<PropertyResponseDTO[]> {
    // TODO: Validate divisionId exists and belongs to company when DivisionService is available

    const properties = await this.propertyRepository.findByDivision(divisionId, companyId);
    return PropertyDTOMapper.toResponseList(properties);
  }

  async searchPropertiesByLocation(
    lat: number,
    lng: number,
    radiusMiles: number,
    companyId: string
  ): Promise<PropertyResponseDTO[]> {
    logger.info(`Searching properties near ${lat},${lng} within ${radiusMiles} miles`);

    // TODO: Implement proper PostGIS spatial search
    const properties = await this.propertyRepository.findByCoordinates(
      lat,
      lng,
      radiusMiles,
      companyId
    );

    return PropertyDTOMapper.toResponseList(properties);
  }

  async updateProperty(
    id: string,
    data: UpdatePropertyDTO,
    userId: string,
    companyId: string
  ): Promise<PropertyResponseDTO | null> {
    // Validate property exists
    const exists = await this.propertyRepository.exists(id, companyId);
    if (!exists) {
      logger.warn(`Property ${id} not found for company ${companyId}`);
      return null;
    }

    // TODO: Validate primaryContactId if changed and belongs to company
    // TODO: Validate divisionId if changed and belongs to company

    // TODO: Re-geocode if address changed (Google Maps API integration)

    logger.info(`Updating property ${id} for company ${companyId} by user ${userId}`);

    const property = await this.propertyRepository.update(id, data, userId, companyId);
    return property ? PropertyDTOMapper.toResponse(property) : null;
  }

  async deleteProperty(id: string, userId: string, companyId: string): Promise<boolean> {
    // Validate property exists
    const exists = await this.propertyRepository.exists(id, companyId);
    if (!exists) {
      logger.warn(`Property ${id} not found for company ${companyId}`);
      return false;
    }

    // Check for active opportunities
    const hasActiveOpportunities = await this.propertyRepository.hasActiveOpportunities(id, companyId);
    if (hasActiveOpportunities) {
      throw new Error('Cannot delete property with active opportunities');
    }

    logger.info(`Soft deleting property ${id} for company ${companyId} by user ${userId}`);

    const property = await this.propertyRepository.softDelete(id, userId, companyId);
    return property !== null;
  }

  async restoreProperty(id: string, companyId: string): Promise<PropertyResponseDTO | null> {
    logger.info(`Restoring property ${id} for company ${companyId}`);

    const property = await this.propertyRepository.restore(id, companyId);
    return property ? PropertyDTOMapper.toResponse(property) : null;
  }

  async getPropertyStats(companyId: string, divisionId?: string): Promise<PropertyStatsDTO> {
    logger.info(`Getting property stats for company ${companyId}${divisionId ? ` and division ${divisionId}` : ''}`);

    return await this.propertyRepository.getStats(companyId, divisionId);
  }

  async assignPropertyToDivision(
    propertyId: string,
    divisionId: string,
    userId: string,
    companyId: string
  ): Promise<PropertyResponseDTO | null> {
    // Validate property exists
    const exists = await this.propertyRepository.exists(propertyId, companyId);
    if (!exists) {
      logger.warn(`Property ${propertyId} not found for company ${companyId}`);
      return null;
    }

    // TODO: Validate divisionId exists and belongs to company when DivisionService is available

    logger.info(`Assigning property ${propertyId} to division ${divisionId} by user ${userId}`);

    const property = await this.propertyRepository.assignToDivision(
      propertyId,
      divisionId,
      userId,
      companyId
    );

    return property ? PropertyDTOMapper.toResponse(property) : null;
  }

  async propertyExists(id: string, companyId: string): Promise<boolean> {
    return await this.propertyRepository.exists(id, companyId);
  }
}