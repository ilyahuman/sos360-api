/**
 * companies.admin.service.ts
 *
 * Implements the business logic for the admin-facing company flow.
 * This service performs cross-tenant operations, such as listing all companies,
 * creating new ones, and managing any company by its ID.
 */

import { Prisma } from '@prisma/client';
import { CompanyRepository } from '../companies.repository';
import { CreateCompanyInput, ListCompaniesQuery, UpdateCompanyInput } from '../companies.schema';
import { NotFoundError } from '@/api/types';
import { PaginatedCompaniesResponse } from '../companies.types';

export class CompanyAdminService {
  constructor(private readonly companyRepository: CompanyRepository) {}

  /**
   * Creates a new company.
   * @param data - The data for the new company.
   */
  async createCompany(data: CreateCompanyInput) {
    return this.companyRepository.create(data);
  }

  /**
   * Retrieves a paginated list of all companies.
   * @param query - Query parameters for pagination, sorting, and searching.
   */
  async getAllCompanies(query: ListCompaniesQuery): Promise<PaginatedCompaniesResponse> {
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
  async updateCompany(id: string, data: UpdateCompanyInput) {
    // The repository's update method will throw if the company doesn't exist.
    return this.companyRepository.update(id, data);
  }

  /**
   * Deletes a company by its ID.
   * @param id - The UUID of the company to delete.
   */
  async deleteCompany(id: string): Promise<void> {
    await this.companyRepository.delete(id);
  }
}
