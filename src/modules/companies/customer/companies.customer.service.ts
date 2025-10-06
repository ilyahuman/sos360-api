/**
 * companies.customer.service.ts
 *
 * Implements the business logic for the customer-facing company flow.
 * All operations are strictly scoped to the tenant ID provided, ensuring
 * a customer can only interact with their own company's data.
 */

import { Prisma } from '@prisma/client';
import { CompanyRepository } from '../companies.repository';
import { updateCompanyDTO } from '../companies.schema';
import { NotFoundError } from '@/api/types';

export class CompanyCustomerService {
  constructor(private readonly companyRepository: CompanyRepository) {}

  /**
   * Retrieves the profile for the currently authenticated user's company.
   * @param companyId - The ID of the company from the user's request context.
   */
  async getCompanyProfile(companyId: string) {
    const company = await this.companyRepository.findByIdScoped(companyId);

    if (!company) {
      // This case should be rare if the JWT is valid, but it's a critical security check.
      throw new NotFoundError('Company', companyId);
    }

    return company;
  }

  /**
   * Updates the profile for the currently authenticated user's company.
   * @param companyId - The ID of the company from the user's request context.
   * @param data - The company data to update.
   */
  async updateCompanyProfile(companyId: string, data: updateCompanyDTO) {
    // The repository's update method handles the tenant check.
    // We explicitly remove admin-only fields from the input.
    const { isActive, ...rest } = data;

    const updateData: Prisma.CompanyUpdateInput = {};
    if (rest.businessName !== undefined) updateData.businessName = rest.businessName;
    if (rest.address !== undefined) updateData.address = rest.address as Prisma.InputJsonValue;
    if (rest.phone !== undefined) updateData.phone = rest.phone;
    if (rest.email !== undefined) updateData.email = rest.email;

    return this.companyRepository.updateScoped(companyId, updateData);
  }
}
