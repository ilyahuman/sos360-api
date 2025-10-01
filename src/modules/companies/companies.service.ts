/**
 * Company Service
 * Business logic layer using DTOs
 */

import { CompanyRepository } from './companies.repository';
import {
  CreateCompanyDTO,
  UpdateCompanyDTO,
  UpdateSubscriptionDTO,
  CompanyResponseDTO,
  CompanyListResponseDTO,
  CompanyFiltersDTO,
  PaginationDTO,
  CompanyDTOMapper,
  CompanyStatsDTO
} from './companies.dto';
import { logger } from '@/shared/utils/logger';

export class CompanyService {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async createCompany(data: CreateCompanyDTO, userId: string): Promise<CompanyResponseDTO> {
    // Validate business rules
    if (await this.companyRepository.businessNameExists(data.businessName)) {
      throw new Error('Company with this business name already exists');
    }

    if (data.email && await this.companyRepository.findByEmail(data.email)) {
      throw new Error('Company with this email already exists');
    }

    const company = await this.companyRepository.create(data, userId);
    return CompanyDTOMapper.toResponse(company);
  }

  async getCompanyById(id: string): Promise<CompanyResponseDTO | null> {
    const company = await this.companyRepository.findById(id);
    return company ? CompanyDTOMapper.toResponse(company) : null;
  }

  async updateCompany(
    id: string,
    data: UpdateCompanyDTO,
    userId: string
  ): Promise<CompanyResponseDTO | null> {
    // Validate business rules
    if (data.businessName) {
      const exists = await this.companyRepository.businessNameExists(data.businessName, id);
      if (exists) {
        throw new Error('Company with this business name already exists');
      }
    }

    if (data.email) {
      const existing = await this.companyRepository.findByEmail(data.email);
      if (existing && existing.id !== id) {
        throw new Error('Company with this email already exists');
      }
    }

    const company = await this.companyRepository.update(id, data, userId);
    return company ? CompanyDTOMapper.toResponse(company) : null;
  }

  async getAllCompanies(
    filters: CompanyFiltersDTO = {},
    pagination: PaginationDTO = {}
  ): Promise<CompanyListResponseDTO> {
    const { companies, total } = await this.companyRepository.findAll(filters, pagination);
    const { page = 1, limit = 10 } = pagination;

    return {
      companies: CompanyDTOMapper.toResponseList(companies),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async softDeleteCompany(id: string, userId: string): Promise<boolean> {
    const company = await this.companyRepository.softDelete(id, userId);
    return company !== null;
  }

  async restoreCompany(id: string, userId: string): Promise<CompanyResponseDTO | null> {
    const company = await this.companyRepository.restore(id, userId);
    return company ? CompanyDTOMapper.toResponse(company) : null;
  }

  async companyExists(id: string): Promise<boolean> {
    return await this.companyRepository.exists(id);
  }

  async getCompanyStats(companyId: string): Promise<CompanyStatsDTO> {
    const company = await this.companyRepository.findById(companyId);
    if (!company) {
      throw new Error('Company not found');
    }

    const stats = await this.companyRepository.getStats(companyId);

    return {
      userCount: stats.userCount,
      contactCount: stats.contactCount,
      propertyCount: stats.propertyCount,
      opportunityCount: stats.opportunityCount,
      projectCount: stats.projectCount,
      divisionCount: stats.divisionCount,
    };
  }

  async updateCompanySettings(
    id: string,
    settings: Record<string, any>,
    userId: string
  ): Promise<CompanyResponseDTO | null> {
    const company = await this.companyRepository.updateSettings(id, settings, userId);
    return company ? CompanyDTOMapper.toResponse(company) : null;
  }

  async updateCompanySubscription(
    id: string,
    data: UpdateSubscriptionDTO,
    userId: string
  ): Promise<CompanyResponseDTO | null> {
    const company = await this.companyRepository.updateSubscription(id, data, userId);
    return company ? CompanyDTOMapper.toResponse(company) : null;
  }
}