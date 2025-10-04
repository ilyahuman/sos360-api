/**
 * companies.repository.ts
 *
 * This file implements the data access layer for the Companies module.
 * It is a "dumb" repository that only executes Prisma queries. It receives a Prisma
 * client instance and has no knowledge of business logic or tenancy rules beyond
 * what is explicitly passed into its methods.
 */

import { Prisma, PrismaClient } from '@prisma/client';
import { CreateCompanyInput, UpdateCompanyInput } from './companies.schema';
import { NotFoundError } from '@/api/types';

export class CompanyRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Finds a single company by its ID. Does not enforce tenancy.
   * Used by the admin flow.
   */
  async findById(id: string) {
    return this.prisma.company.findUnique({ where: { id } });
  }

  /**
   * Finds a single company by its ID, strictly scoped to a tenant.
   * Used by the customer flow to ensure they can only access their own company.
   */
  async findByIdAndTenant(id: string, companyId: string) {
    return this.prisma.company.findFirst({
      where: { id, AND: { id: companyId } },
    });
  }

  /**
   * Retrieves a paginated list of all companies. Does not enforce tenancy.
   * Used by the admin flow.
   */
  async findAll(params: {
    skip: number;
    take: number;
    orderBy: Prisma.CompanyOrderByWithRelationInput;
    where?: Prisma.CompanyWhereInput | undefined;
  }) {
    const { skip, take, orderBy, where } = params;
    return this.prisma.company.findMany({
      skip,
      take,
      orderBy,
      ...(where && { where }),
    });
  }

  /**
   * Counts the total number of companies matching a query.
   * Used for pagination metadata in the admin flow.
   */
  async countAll(where?: Prisma.CompanyWhereInput | undefined) {
    return this.prisma.company.count(where ? { where } : undefined);
  }

  /**
   * Creates a new company.
   */
  async create(data: CreateCompanyInput) {
    return this.prisma.company.create({ data });
  }

  /**
   * Updates a company's data, strictly scoped to a tenant.
   * This method is safe for both customer and admin flows if companyId is provided.
   */
  async update(id: string, data: UpdateCompanyInput, companyId?: string) {
    const company = await this.prisma.company.findFirst({
      where: { id, ...(companyId && { id: companyId }) },
    });

    if (!company) {
      throw new NotFoundError('Company', id);
    }

    return this.prisma.company.update({
      where: { id },
      data,
    });
  }

  /**
   * Deletes a company by its ID. Does not enforce tenancy.
   * Used by the admin flow.
   */
  async delete(id: string) {
    // Ensure the company exists before attempting to delete
    const company = await this.findById(id);
    if (!company) {
      throw new NotFoundError('Company', id);
    }
    await this.prisma.company.delete({ where: { id } });
  }
}
