/**
 * Company Repository
 * Data access layer using Prisma with proper types
 */

import { PrismaClient, Company, Prisma } from '@prisma/client';
import {
  CreateCompanyDTO,
  UpdateCompanyDTO,
  UpdateSubscriptionDTO,
  CompanyFiltersDTO,
  PaginationDTO,
  CompanyDTOMapper
} from './companies.dto';

export class CompanyRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateCompanyDTO, userId: string): Promise<Company> {
    const input = CompanyDTOMapper.toCreateInput(data, userId);
    return await this.prisma.company.create({
      data: input,
    });
  }

  async findById(id: string): Promise<Company | null> {
    return await this.prisma.company.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<Company | null> {
    return await this.prisma.company.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
        deletedAt: null,
      },
    });
  }

  async findByBusinessName(businessName: string): Promise<Company | null> {
    return await this.prisma.company.findFirst({
      where: {
        businessName: {
          equals: businessName,
          mode: 'insensitive',
        },
        deletedAt: null,
      },
    });
  }

  async findAll(filters: CompanyFiltersDTO = {}, pagination: PaginationDTO = {}): Promise<{
    companies: Company[];
    total: number;
  }> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    const where = CompanyDTOMapper.toWhereInput(filters);
    const orderBy = { [sortBy]: sortOrder };

    const [companies, total] = await Promise.all([
      this.prisma.company.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.company.count({ where }),
    ]);

    return { companies, total };
  }

  async update(id: string, data: UpdateCompanyDTO, userId: string): Promise<Company | null> {
    const input = CompanyDTOMapper.toUpdateInput(data, userId);

    try {
      return await this.prisma.company.update({
        where: { id },
        data: input,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null; // Record not found
      }
      throw error;
    }
  }

  async updateSubscription(id: string, data: UpdateSubscriptionDTO, userId: string): Promise<Company | null> {
    try {
      return await this.prisma.company.update({
        where: { id },
        data: {
          ...data,
          updatedBy: userId,
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

  async softDelete(id: string, userId: string): Promise<Company | null> {
    try {
      return await this.prisma.company.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          isActive: false,
          updatedBy: userId,
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

  async restore(id: string, userId: string): Promise<Company | null> {
    try {
      return await this.prisma.company.update({
        where: { id },
        data: {
          deletedAt: null,
          isActive: true,
          updatedBy: userId,
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

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.company.count({
      where: { id },
    });
    return count > 0;
  }

  async businessNameExists(businessName: string, excludeId?: string): Promise<boolean> {
    const where: Prisma.CompanyWhereInput = {
      businessName: {
        equals: businessName,
        mode: 'insensitive',
      },
      deletedAt: null,
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const count = await this.prisma.company.count({ where });
    return count > 0;
  }

  async getStats(companyId: string): Promise<{
    userCount: number;
    contactCount: number;
    propertyCount: number;
    opportunityCount: number;
    projectCount: number;
    divisionCount: number;
  }> {
    const [
      userCount,
      contactCount,
      propertyCount,
      opportunityCount,
      projectCount,
      divisionCount,
    ] = await Promise.all([
      this.prisma.user.count({ where: { companyId } }),
      this.prisma.contact.count({ where: { companyId } }),
      this.prisma.property.count({ where: { companyId } }),
      this.prisma.opportunity.count({ where: { companyId } }),
      this.prisma.project.count({ where: { companyId } }),
      this.prisma.division.count({ where: { companyId } }),
    ]);

    return {
      userCount,
      contactCount,
      propertyCount,
      opportunityCount,
      projectCount,
      divisionCount,
    };
  }

  async updateSettings(id: string, settings: Prisma.InputJsonValue, userId: string): Promise<Company | null> {
    try {
      return await this.prisma.company.update({
        where: { id },
        data: {
          settings,
          updatedBy: userId,
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
}