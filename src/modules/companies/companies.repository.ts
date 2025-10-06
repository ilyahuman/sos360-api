/**
 * companies.repository.ts (Refactored)
 *
 * The data access layer is now more efficient and relies on Prisma's atomic
 * operations. Unnecessary `findFirst` calls before updates/deletes are removed.
 * The global error handler will catch Prisma's 'P2025' (Record Not Found) errors.
 */
import { Prisma, PrismaClient } from '@prisma/client';
import { NotFoundError } from '@/api/types';

export class CompanyRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Finds a single company by its ID. Does not enforce tenancy.
   * Used by the admin flow.
   */
  async findById(id: string) {
    return this.prisma.company.findUnique({ where: { id, deletedAt: null } });
  }

  /**
   * Finds a single company by its ID, strictly scoped to a tenantId (which is the same as the ID).
   * Used by the customer flow.
   */
  async findByIdScoped(companyId: string) {
    // Corrected logic: The company ID *is* the tenant ID in this context.
    return this.prisma.company.findUnique({
      where: { id: companyId, deletedAt: null },
    });
  }

  /**
   * Retrieves a paginated list of companies.
   */
  async findAll(params: {
    skip: number;
    take: number;
    orderBy: Prisma.CompanyOrderByWithRelationInput;
    where?: Prisma.CompanyWhereInput;
  }) {
    return this.prisma.company.findMany({ ...params, where: { ...params.where, deletedAt: null } });
  }

  /**
   * Counts the total number of companies matching a query.
   */
  async countAll(where?: Prisma.CompanyWhereInput) {
    return this.prisma.company.count({ where: { ...where, deletedAt: null } });
  }

  /**
   * Creates a new company within a transaction.
   * This now accepts a Prisma Transaction Client to ensure atomicity.
   */
  async create(data: Prisma.CompanyCreateInput, tx?: Prisma.TransactionClient) {
    const db = tx || this.prisma;
    return db.company.create({ data });
  }

  /**
   * Updates a company's data. Does not enforce tenancy.
   * Used by the admin flow.
   */
  async update(id: string, data: Prisma.CompanyUpdateInput) {
    // Simplified: Let Prisma handle the not-found case. It will throw an error
    // that our global error handler will catch and format as a 404.
    try {
      return await this.prisma.company.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundError('Company', id);
      }
      throw error;
    }
  }

  /**
   * Updates a company's data, strictly scoped to a tenant.
   * Used by the customer flow.
   */
  async updateScoped(companyId: string, data: Prisma.CompanyUpdateInput) {
    try {
      return await this.prisma.company.update({
        where: { id: companyId },
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundError('Company', companyId);
      }
      throw error;
    }
  }

  /**
   * Soft-deletes a company by its ID by setting the `deletedAt` field.
   * This is safer than hard deletion.
   */
  async delete(id: string): Promise<void> {
    try {
      await this.prisma.company.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundError('Company', id);
      }
      throw error;
    }
  }
}
