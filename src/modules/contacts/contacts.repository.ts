/**
 * Contact Repository
 * Data access layer using Prisma with proper types
 */

import { PrismaClient, Contact, Prisma } from '@prisma/client';
import {
  CreateContactDTO,
  UpdateContactDTO,
  ContactFiltersDTO,
  PaginationDTO,
  ContactDTOMapper,
} from './contacts.dto';

export class ContactRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateContactDTO, companyId: string, userId: string): Promise<Contact> {
    const input = ContactDTOMapper.toCreateInput(data, companyId, userId);
    return await this.prisma.contact.create({
      data: input,
    });
  }

  async findById(id: string): Promise<Contact | null> {
    return await this.prisma.contact.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string, companyId: string): Promise<Contact | null> {
    return await this.prisma.contact.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
        companyId,
        deletedAt: null,
      },
    });
  }

  async findByPhone(phone: string, companyId: string): Promise<Contact | null> {
    return await this.prisma.contact.findFirst({
      where: {
        phone,
        companyId,
        deletedAt: null,
      },
    });
  }

  async findAll(
    companyId: string,
    filters: ContactFiltersDTO = {},
    pagination: PaginationDTO = {}
  ): Promise<{
    contacts: Contact[];
    total: number;
  }> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    const where = ContactDTOMapper.toWhereInput(filters, companyId);
    const orderBy = { [sortBy]: sortOrder };

    const [contacts, total] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.contact.count({ where }),
    ]);

    return { contacts, total };
  }

  async update(id: string, data: UpdateContactDTO, userId: string): Promise<Contact | null> {
    const input = ContactDTOMapper.toUpdateInput(data, userId);

    try {
      return await this.prisma.contact.update({
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

  async updateLeadStatus(id: string, leadStatus: string, userId: string): Promise<Contact | null> {
    try {
      return await this.prisma.contact.update({
        where: { id },
        data: {
          leadStatus: leadStatus as any,
          // TODO: Use actual user ID when auth is implemented
          updater: { connect: { id: userId } },
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

  async assignToUser(id: string, assignedUserId: string | null, userId: string): Promise<Contact | null> {
    try {
      return await this.prisma.contact.update({
        where: { id },
        data: {
          assignedUserId,
          // TODO: Use actual user ID when auth is implemented
          updater: { connect: { id: userId } },
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

  async updateFollowUp(
    id: string,
    nextFollowUpDate: Date | null,
    userId: string
  ): Promise<Contact | null> {
    try {
      const contact = await this.prisma.contact.findUnique({ where: { id } });
      if (!contact) return null;

      return await this.prisma.contact.update({
        where: { id },
        data: {
          nextFollowUpDate,
          lastContactDate: new Date(),
          followUpCount: contact.followUpCount + 1,
          // TODO: Use actual user ID when auth is implemented
          updater: { connect: { id: userId } },
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

  async softDelete(id: string, userId: string): Promise<Contact | null> {
    try {
      return await this.prisma.contact.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          isActive: false,
          // TODO: Use actual user ID when auth is implemented
          updater: { connect: { id: userId } },
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

  async restore(id: string, userId: string): Promise<Contact | null> {
    try {
      return await this.prisma.contact.update({
        where: { id },
        data: {
          deletedAt: null,
          isActive: true,
          // TODO: Use actual user ID when auth is implemented
          updater: { connect: { id: userId } },
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
    const count = await this.prisma.contact.count({
      where: { id },
    });
    return count > 0;
  }

  async emailExists(email: string, companyId: string, excludeId?: string): Promise<boolean> {
    const where: Prisma.ContactWhereInput = {
      email: {
        equals: email,
        mode: 'insensitive',
      },
      companyId,
      deletedAt: null,
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const count = await this.prisma.contact.count({ where });
    return count > 0;
  }

  async getStats(companyId: string, divisionId?: string): Promise<{
    totalContacts: number;
    leadCount: number;
    prospectCount: number;
    qualifiedCount: number;
    customerCount: number;
    inactiveCount: number;
    commercialCount: number;
    residentialCount: number;
    hoaCount: number;
    municipalCount: number;
    industrialCount: number;
    overdueFollowUps: number;
    upcomingFollowUps: number;
  }> {
    const baseWhere: Prisma.ContactWhereInput = {
      companyId,
      deletedAt: null,
      ...(divisionId && { divisionId }),
    };

    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalContacts,
      leadCount,
      prospectCount,
      qualifiedCount,
      customerCount,
      inactiveCount,
      commercialCount,
      residentialCount,
      hoaCount,
      municipalCount,
      industrialCount,
      overdueFollowUps,
      upcomingFollowUps,
    ] = await Promise.all([
      // Total active contacts
      this.prisma.contact.count({ where: { ...baseWhere, isActive: true } }),

      // Lead status counts
      this.prisma.contact.count({ where: { ...baseWhere, leadStatus: 'LEAD' } }),
      this.prisma.contact.count({ where: { ...baseWhere, leadStatus: 'PROSPECT' } }),
      this.prisma.contact.count({ where: { ...baseWhere, leadStatus: 'QUALIFIED' } }),
      this.prisma.contact.count({ where: { ...baseWhere, leadStatus: 'CUSTOMER' } }),
      this.prisma.contact.count({ where: { ...baseWhere, leadStatus: 'INACTIVE' } }),

      // Contact type counts
      this.prisma.contact.count({ where: { ...baseWhere, contactType: 'COMMERCIAL' } }),
      this.prisma.contact.count({ where: { ...baseWhere, contactType: 'RESIDENTIAL' } }),
      this.prisma.contact.count({ where: { ...baseWhere, contactType: 'HOA' } }),
      this.prisma.contact.count({ where: { ...baseWhere, contactType: 'MUNICIPAL' } }),
      this.prisma.contact.count({ where: { ...baseWhere, contactType: 'INDUSTRIAL' } }),

      // Follow-up counts
      this.prisma.contact.count({
        where: {
          ...baseWhere,
          nextFollowUpDate: {
            lt: now,
            not: null,
          },
        },
      }),
      this.prisma.contact.count({
        where: {
          ...baseWhere,
          nextFollowUpDate: {
            gte: now,
            lt: tomorrow,
          },
        },
      }),
    ]);

    return {
      totalContacts,
      leadCount,
      prospectCount,
      qualifiedCount,
      customerCount,
      inactiveCount,
      commercialCount,
      residentialCount,
      hoaCount,
      municipalCount,
      industrialCount,
      overdueFollowUps,
      upcomingFollowUps,
    };
  }

  async getOverdueFollowUps(companyId: string, limit: number = 10): Promise<Contact[]> {
    return await this.prisma.contact.findMany({
      where: {
        companyId,
        deletedAt: null,
        isActive: true,
        nextFollowUpDate: {
          lt: new Date(),
          not: null,
        },
      },
      orderBy: {
        nextFollowUpDate: 'asc',
      },
      take: limit,
    });
  }

  async getTodayFollowUps(companyId: string, assignedUserId?: string): Promise<Contact[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await this.prisma.contact.findMany({
      where: {
        companyId,
        deletedAt: null,
        isActive: true,
        ...(assignedUserId && { assignedUserId }),
        nextFollowUpDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: {
        nextFollowUpDate: 'asc',
      },
    });
  }
}