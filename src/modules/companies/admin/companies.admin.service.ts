/**
 * companies.admin.service.ts
 *
 * Implements the business logic for the admin-facing company flow.
 * This service performs cross-tenant operations, such as listing all companies,
 * creating new ones, and managing any company by its ID.
 */

import { Prisma } from '@prisma/client';
import { CompanyRepository } from '../companies.repository';
import { createCompanyDTO, listCompaniesQueryDTO, updateCompanyDTO } from '../companies.schema';
import { NotFoundError } from '@/api/types';
import { PaginatedCompaniesResponse } from '../companies.types';

export class CompanyAdminService {
  constructor(private readonly companyRepository: CompanyRepository) {}

  /**
   * Creates a new company.
   * @param data - The data for the new company.
   */
  async createCompany(data: createCompanyDTO) {
    const createData: Prisma.CompanyCreateInput = {
      businessName: data.businessName,
    };

    if (data.address !== undefined && data.address !== null) {
      createData.address = data.address as Prisma.InputJsonValue;
    }
    if (data.phone !== undefined && data.phone !== null) {
      createData.phone = data.phone;
    }

    return this.companyRepository.create(createData);
  }

  /**
   * Retrieves a paginated list of all companies.
   * @param query - Query parameters for pagination, sorting, and searching.
   */
  async getAllCompanies(query: listCompaniesQueryDTO): Promise<PaginatedCompaniesResponse> {
    const { page, limit, sortBy, sortOrder, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CompanyWhereInput = search
      ? {
          OR: [
            { businessName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [companies, total] = await Promise.all([
      this.companyRepository.findAll({
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        where,
      }),
      this.companyRepository.countAll(where),
    ]);

    return {
      data: companies,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Retrieves a single company by its ID, without tenant restrictions.
   * @param id - The UUID of the company to retrieve.
   */
  async getCompanyById(id: string) {
    const company = await this.companyRepository.findById(id);
    if (!company) {
      throw new NotFoundError('Company', id);
    }
    return company;
  }

  /**
   * Updates a company by its ID, without tenant restrictions.
   * @param id - The UUID of the company to update.
   * @param data - The company data to update.
   */
  async updateCompany(id: string, data: updateCompanyDTO) {
    // The repository's update method will throw if the company doesn't exist.
    const updateData: Prisma.CompanyUpdateInput = {
      ...(data.businessName !== undefined && { businessName: data.businessName }),
      ...(data.address !== undefined && { address: data.address as Prisma.InputJsonValue }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    };

    return this.companyRepository.update(id, updateData);
  }

  /**
   * Deletes a company by its ID.
   * @param id - The UUID of the company to delete.
   */
  async deleteCompany(id: string): Promise<void> {
    await this.companyRepository.delete(id);
  }
}
