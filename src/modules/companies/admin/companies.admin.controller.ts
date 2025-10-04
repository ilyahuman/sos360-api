/**
 * companies.admin.controller.ts
 *
 * Handles HTTP requests for the admin-facing company flow.
 * It orchestrates fetching validated data from the request and passing it
 * to the admin service for cross-tenant operations.
 */

import { Request, Response } from 'express';
import { CompanyAdminService } from './companies.admin.service';
import { ListCompaniesQuery } from '../companies.schema';

export class CompanyAdminController {
  constructor(private readonly companyService: CompanyAdminService) {}

  create = async (req: Request, res: Response) => {
    const newCompany = await this.companyService.createCompany(req.body);
    res.status(201).json({ success: true, message: 'Company created successfully', data: newCompany });
  };

  getAll = async (req: Request, res: Response) => {
    const result = await this.companyService.getAllCompanies(req.query as unknown as ListCompaniesQuery);
    res.status(200).json({ success: true, message: 'Companies retrieved successfully', ...result });
  };

  getById = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Company ID is required' });
    }
    const company = await this.companyService.getCompanyById(id);
    res.status(200).json({ success: true, message: 'Company retrieved successfully', data: company });
  };

  update = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Company ID is required' });
    }
    const updatedCompany = await this.companyService.updateCompany(id, req.body);
    res.status(200).json({ success: true, message: 'Company updated successfully', data: updatedCompany });
  };

  delete = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Company ID is required' });
    }
    await this.companyService.deleteCompany(id);
    res.status(204).send();
  };
}
