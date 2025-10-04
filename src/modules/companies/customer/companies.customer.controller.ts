/**
 * companies.customer.controller.ts
 *
 * Handles HTTP requests for the customer-facing company flow.
 * It extracts user and tenant information from the type-safe `req.context`
 * and passes it to the service layer.
 */

import { Request, Response } from 'express';
import { CompanyCustomerService } from './companies.customer.service';

export class CompanyCustomerController {
  constructor(private readonly companyService: CompanyCustomerService) {}

  getProfile = async (req: Request, res: Response) => {
    const { companyId } = req.context.user!;
    const company = await this.companyService.getCompanyProfile(companyId);
    res.status(200).json({ success: true, message: 'Company profile retrieved successfully', data: company });
  };

  updateProfile = async (req: Request, res: Response) => {
    const { companyId } = req.context.user!;
    const updatedCompany = await this.companyService.updateCompanyProfile(companyId, req.body);
    res.status(200).json({ success: true, message: 'Company profile updated successfully', data: updatedCompany });
  };
}
