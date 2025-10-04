/**
 * companies.customer.service.ts
 *
 * Implements the business logic for the customer-facing company flow.
 * All operations are strictly scoped to the tenant ID provided, ensuring
 * a customer can only interact with their own company's data.
 */

import { CompanyRepository } from '../companies.repository';
import { UpdateCompanyInput } from '../companies.schema';
import { NotFoundError } from '@/api/types';

export class CompanyCustomerService {
  constructor(private readonly companyRepository: CompanyRepository) {}

  /**
   * Retrieves the profile for the currently authenticated user's company.
   * @param companyId - The ID of the company from the user's request context.
   */
  async getCompanyProfile(companyId: string) {
    const company = await this.companyRepository.findByIdAndTenant(companyId, companyId);

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
  async updateCompanyProfile(companyId: string, data: UpdateCompanyInput) {
    // The repository's update method handles the tenant check.
    // We explicitly remove admin-only fields from the input.
    const { isActive, ...customerSafeData } = data;
    return this.companyRepository.update(companyId, customerSafeData, companyId);
  }
}
