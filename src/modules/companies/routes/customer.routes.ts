import { Router } from 'express';
import { prisma } from '@/infrastructure/database/prisma.client';
import { CompanyRepository } from '../companies.repository';
import { CompanyService } from '../companies.service';
import { CompanyController } from '../companies.controller';
import {
  createCompanyValidationRules,
  updateCompanyValidationRules,
  updateSettingsValidationRules
} from '../companies.validator';

const router: Router = Router();

// --- Dependency Injection Setup ---
const companyRepository = new CompanyRepository(prisma);
const companyService = new CompanyService(companyRepository);
const companyController = new CompanyController(companyService);

// --- Customer Routes (No Authentication Required for now) ---

/**
 * Create new company
 * POST /api/v1/companies
 */
router.post('/', createCompanyValidationRules(), companyController.createCompany);

/**
 * Get company by ID
 * GET /api/v1/companies/:id
 */
router.get('/:id', companyController.getCompanyById);

/**
 * Update company by ID
 * PUT /api/v1/companies/:id
 */
router.put('/:id', updateCompanyValidationRules(), companyController.updateCompanyById);

/**
 * Soft delete company
 * DELETE /api/v1/companies/:id
 */
router.delete('/:id', companyController.softDeleteCompany);

/**
 * Get company statistics
 * GET /api/v1/companies/:id/stats
 */
router.get('/:id/stats', companyController.getCompanyStats);

/**
 * Get company settings
 * GET /api/v1/companies/:id/settings
 */
router.get('/:id/settings', companyController.getCompanySettings);

/**
 * Update company settings
 * PUT /api/v1/companies/:id/settings
 */
router.put('/:id/settings', updateSettingsValidationRules(), companyController.updateCompanySettings);

export default router;