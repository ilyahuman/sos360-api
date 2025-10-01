import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { logger } from '@/shared/utils/logger';
import { AuthenticatedRequest } from '@/api/types/requests.types';
import { CompanyService } from './companies.service';
import { CreateCompanyRequest, UpdateCompanyRequest } from './companies.types';

export class CompanyController {
  constructor(private companyService: CompanyService) {}

  createCompany = async (req: Request, res: Response): Promise<void> => {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
      return;
    }

    const createData: CreateCompanyRequest = req.body;

    logger.info('Creating new company', {
      businessName: createData.businessName,
      businessType: createData.businessType,
    });

    try {
      const company = await this.companyService.createCompany(
        createData,
        'system' // For now, using system as creator since this is public endpoint
      );

      logger.info('Company created successfully', {
        companyId: company.id,
        businessName: company.businessName,
      });

      res.status(201).json({
        success: true,
        message: 'Company created successfully',
        data: company,
      });
    } catch (error) {
      logger.error('Error creating company', error);

      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
        });
      }
    }
  };

  getCompanyById = async (req: Request, res: Response): Promise<void> => {
    const companyId = req.params.id;

    if (!companyId) {
      res.status(400).json({
        success: false,
        message: 'Company ID is required',
      });
      return;
    }

    logger.info('Getting company by ID', {
      companyId: companyId,
    });

    try {
      const company = await this.companyService.getCompanyById(companyId);

      if (!company) {
        res.status(404).json({
          success: false,
          message: 'Company not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Company retrieved successfully',
        data: company,
      });
    } catch (error) {
      logger.error('Error getting company by ID', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  updateCompanyById = async (req: Request, res: Response): Promise<void> => {
    const companyId = req.params.id;
    const userId = 'system'; // No auth system yet

    if (!companyId) {
      res.status(400).json({
        success: false,
        message: 'Company ID is required',
      });
      return;
    }

    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
      return;
    }

    const updateData: UpdateCompanyRequest = req.body;

    logger.info('Updating company by ID', {
      companyId: companyId,
      updates: Object.keys(req.body),
    });

    try {
      const company = await this.companyService.updateCompany(
        companyId,
        updateData,
        userId
      );

      if (!company) {
        res.status(404).json({
          success: false,
          message: 'Company not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Company updated successfully',
        data: company,
      });
    } catch (error) {
      logger.error('Error updating company', error);

      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
        });
      }
    }
  };

  getCompanyProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const companyId = req.companyId!;

    logger.info('Getting company profile', {
      userId: req.userId,
      companyId: companyId,
    });

    try {
      const company = await this.companyService.getCompanyById(companyId);

      if (!company) {
        res.status(404).json({
          success: false,
          message: 'Company not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Company profile retrieved successfully',
        data: company,
      });
    } catch (error) {
      logger.error('Error getting company profile', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  updateCompanyProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const companyId = req.companyId!;
    const userId = req.userId!;

    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
      return;
    }

    const updateData: UpdateCompanyRequest = req.body;

    logger.info('Updating company profile', {
      userId: userId,
      companyId: companyId,
      updates: Object.keys(req.body),
    });

    try {
      const company = await this.companyService.updateCompany(
        companyId,
        updateData,
        userId
      );

      if (!company) {
        res.status(404).json({
          success: false,
          message: 'Company not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Company profile updated successfully',
        data: company,
      });
    } catch (error) {
      logger.error('Error updating company profile', error);

      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
        });
      }
    }
  };

  getCompanySettings = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Company ID is required',
        });
        return;
      }

      const company = await this.companyService.getCompanyById(id);

      if (!company) {
        res.status(404).json({
          success: false,
          message: 'Company not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Company settings retrieved successfully',
        data: {
          settings: company.settings,
          timezone: company.timezone,
          currency: company.currency,
        },
      });
    } catch (error) {
      logger.error('Error getting company settings', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  updateCompanySettings = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = 'system'; // TODO: Get from auth middleware

    logger.info('Updating company settings', {
      userId: userId,
      companyId: id,
      settings: Object.keys(req.body),
    });

    try {
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Company ID is required',
        });
        return;
      }

      const company = await this.companyService.updateCompanySettings(
        id,
        req.body.settings || req.body,
        userId
      );

      if (!company) {
        res.status(404).json({
          success: false,
          message: 'Company not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Company settings updated successfully',
        data: {
          settings: company.settings,
          timezone: company.timezone,
          currency: company.currency,
        },
      });
    } catch (error) {
      logger.error('Error updating company settings', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  getCompanyUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    res.json({
      success: true,
      message: 'Company users endpoint - implementation pending',
      data: {
        companyId: req.companyId,
        note: 'This endpoint will return list of company users',
      },
    });
  };

  getCompanyStats = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Company ID is required',
        });
        return;
      }

      const stats = await this.companyService.getCompanyStats(id);

      res.json({
        success: true,
        message: 'Company statistics retrieved successfully',
        data: stats,
      });
    } catch (error) {
      logger.error('Error getting company statistics', error);

      if (error instanceof Error) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
        });
      }
    }
  };

  // Admin endpoint to list all companies
  getAllCompanies = async (req: Request, res: Response): Promise<void> => {
    logger.info('Admin: Getting all companies');

    try {
      const companies = await this.companyService.getAllCompanies();

      res.json({
        success: true,
        message: 'Companies retrieved successfully',
        data: companies,
      });
    } catch (error) {
      logger.error('Error getting all companies', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  /**
   * Soft delete a company
   * DELETE /companies/:id
   */
  softDeleteCompany = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = 'system'; // TODO: Get from auth middleware

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Company ID is required',
        });
        return;
      }

      const deleted = await this.companyService.softDeleteCompany(id, userId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Company not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Company soft deleted successfully',
      });
    } catch (error) {
      logger.error('Error soft deleting company', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  /**
   * Restore a soft-deleted company (Admin only)
   * POST /admin/companies/:id/restore
   */
  restoreCompany = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = 'system'; // TODO: Get from auth middleware

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Company ID is required',
        });
        return;
      }

      const company = await this.companyService.restoreCompany(id, userId);

      if (!company) {
        res.status(404).json({
          success: false,
          message: 'Company not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Company restored successfully',
        data: company,
      });
    } catch (error) {
      logger.error('Error restoring company', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  /**
   * Update company subscription (Admin only)
   * PATCH /admin/companies/:id/subscription
   */
  updateCompanySubscription = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
        return;
      }

      const { id } = req.params;
      const userId = 'system'; // TODO: Get from auth middleware

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Company ID is required',
        });
        return;
      }

      const company = await this.companyService.updateCompanySubscription(id, req.body, userId);

      if (!company) {
        res.status(404).json({
          success: false,
          message: 'Company not found',
        });
        return;
      }

      logger.info(`Subscription updated for company: ${id}`);

      res.status(200).json({
        success: true,
        message: 'Company subscription updated successfully',
        data: company,
      });
    } catch (error) {
      logger.error('Error updating company subscription', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };
}