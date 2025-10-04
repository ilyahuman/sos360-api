/**
 * Property Repository
 * Data access layer using Prisma with proper types
 */

import { Property, Prisma } from '@prisma/client';
import { ExtendedPrismaClient } from '@/infrastructure/database/prisma.client';
import {
  CreatePropertyDTO,
  UpdatePropertyDTO,
  PropertyFiltersDTO,
  PaginationDTO,
  PropertyDTOMapper,
  PropertyStatsDTO,
} from './properties.dto';

export class PropertyRepository {
  constructor(private readonly prisma: ExtendedPrismaClient) {}

  async create(data: CreatePropertyDTO, userId: string, companyId: string): Promise<Property> {
    const input = PropertyDTOMapper.toCreateInput(data, userId, companyId);
    return await this.prisma.property.create({
      data: input,
      include: {
        primaryContact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            companyName: true,
          },
        },
        division: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findById(id: string, companyId: string): Promise<Property | null> {
    return await this.prisma.property.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
      include: {
        primaryContact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            companyName: true,
          },
        },
        division: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findAll(
    companyId: string,
    filters: PropertyFiltersDTO = {},
    pagination: PaginationDTO = {}
  ): Promise<{
    properties: Property[];
    total: number;
  }> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    const where = PropertyDTOMapper.toWhereInput(filters, companyId);
    const orderBy = { [sortBy]: sortOrder };

    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          primaryContact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              companyName: true,
            },
          },
          division: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.property.count({ where }),
    ]);

    return { properties, total };
  }

  async findByContact(contactId: string, companyId: string): Promise<Property[]> {
    return await this.prisma.property.findMany({
      where: {
        primaryContactId: contactId,
        companyId,
        deletedAt: null,
      },
      include: {
        primaryContact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            companyName: true,
          },
        },
        division: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByDivision(divisionId: string, companyId: string): Promise<Property[]> {
    return await this.prisma.property.findMany({
      where: {
        divisionId,
        companyId,
        deletedAt: null,
      },
      include: {
        primaryContact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            companyName: true,
          },
        },
        division: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // TODO: Implement spatial search when PostGIS is configured
  // Currently using simple radius calculation (not production-ready)
  async findByCoordinates(
    lat: number,
    lng: number,
    radiusMiles: number,
    companyId: string
  ): Promise<Property[]> {
    // TODO: Implement proper PostGIS spatial queries
    // For now, return properties that have coordinates set
    return await this.prisma.property.findMany({
      where: {
        companyId,
        deletedAt: null,
        coordinates: {
          not: null,
        },
      },
      include: {
        primaryContact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            companyName: true,
          },
        },
        division: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      take: 50,
    });
  }

  async update(id: string, data: UpdatePropertyDTO, userId: string, companyId: string): Promise<Property | null> {
    const input = PropertyDTOMapper.toUpdateInput(data, userId);

    try {
      return await this.prisma.property.update({
        where: {
          id,
          companyId,
        },
        data: input as any,
        include: {
          primaryContact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              companyName: true,
            },
          },
          division: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null;
      }
      throw error;
    }
  }

  async softDelete(id: string, userId: string, companyId: string): Promise<Property | null> {
    try {
      return await this.prisma.property.update({
        where: {
          id,
          companyId,
        },
        data: {
          deletedAt: new Date(),
          isActive: false,
          // TODO(!!!): Use actual authenticated user ID when User/Auth module is implemented
          // updatedBy: userId,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null;
      }
      throw error;
    }
  }

  async restore(id: string, companyId: string): Promise<Property | null> {
    try {
      return await this.prisma.property.update({
        where: {
          id,
          companyId,
        },
        data: {
          deletedAt: null,
          isActive: true,
          updatedAt: new Date(),
        },
        include: {
          primaryContact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              companyName: true,
            },
          },
          division: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null;
      }
      throw error;
    }
  }

  async count(companyId: string, filters: PropertyFiltersDTO = {}): Promise<number> {
    const where = PropertyDTOMapper.toWhereInput(filters, companyId);
    return await this.prisma.property.count({ where });
  }

  async getStats(companyId: string, divisionId?: string): Promise<PropertyStatsDTO> {
    const where: Prisma.PropertyWhereInput = {
      companyId,
      deletedAt: null,
    };

    if (divisionId) {
      where.divisionId = divisionId;
    }

    // Get total properties count
    const totalProperties = await this.prisma.property.count({ where });

    // Get properties grouped by type
    const propertiesByType = await this.prisma.property.groupBy({
      by: ['propertyType'],
      where,
      _count: {
        id: true,
      },
    });

    const byPropertyType: Record<string, number> = {};
    propertiesByType.forEach((group) => {
      byPropertyType[group.propertyType] = group._count.id;
    });

    // Get properties grouped by division
    const propertiesByDivision = await this.prisma.property.groupBy({
      by: ['divisionId'],
      where: {
        ...where,
        divisionId: { not: null },
      },
      _count: {
        id: true,
      },
    });

    const byDivision: Record<string, number> = {};
    propertiesByDivision.forEach((group) => {
      if (group.divisionId) {
        byDivision[group.divisionId] = group._count.id;
      }
    });

    // Get total square footage
    const squareFootageResult = await this.prisma.property.aggregate({
      where,
      _sum: {
        totalArea: true,
      },
    });

    const totalSquareFootage = squareFootageResult._sum.totalArea?.toNumber() || 0;

    // Calculate average property size
    const averagePropertySize = totalProperties > 0 ? totalSquareFootage / totalProperties : 0;

    return {
      totalProperties,
      byPropertyType,
      byDivision,
      totalSquareFootage,
      averagePropertySize,
    };
  }

  async exists(id: string, companyId: string): Promise<boolean> {
    const count = await this.prisma.property.count({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    });
    return count > 0;
  }

  async hasActiveOpportunities(propertyId: string, companyId: string): Promise<boolean> {
    const count = await this.prisma.opportunity.count({
      where: {
        propertyId,
        companyId,
        status: {
          in: ['ACTIVE', 'WON'],
        },
      },
    });
    return count > 0;
  }

  async assignToDivision(
    propertyId: string,
    divisionId: string,
    userId: string,
    companyId: string
  ): Promise<Property | null> {
    try {
      return await this.prisma.property.update({
        where: {
          id: propertyId,
          companyId,
        },
        data: {
          divisionId,
          // TODO(!!!): Use actual authenticated user ID when User/Auth module is implemented
          // updatedBy: userId,
          updatedAt: new Date(),
        },
        include: {
          primaryContact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              companyName: true,
            },
          },
          division: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null;
      }
      throw error;
    }
  }
}