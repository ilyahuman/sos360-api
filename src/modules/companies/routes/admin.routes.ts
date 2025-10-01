import { Router } from 'express';
import { prisma } from '@/infrastructure/database/prisma.client';
import { CompanyRepository } from '../companies.repository';
import { CompanyService } from '../companies.service';
import { CompanyController } from '../companies.controller';
import { updateCompanyValidationRules, updateSubscriptionValidationRules } from '../companies.validator';

const router: Router = Router();

// --- Dependency Injection Setup ---
const companyRepository = new CompanyRepository(prisma);
const companyService = new CompanyService(companyRepository);
const companyController = new CompanyController(companyService);

// --- Admin Routes (No Authentication Required for now) ---

/**
 * Get all companies (admin view - cross-tenant)
 * GET /api/v1/admin/companies
 */
router.get('/', companyController.getAllCompanies);

/**
 * Get company by ID (admin view - cross-tenant)
 * GET /api/v1/admin/companies/:id
 */
router.get('/:id', companyController.getCompanyById);

/**
 * Update company by ID (admin action - cross-tenant)
 * PUT /api/v1/admin/companies/:id
 */
router.put('/:id', updateCompanyValidationRules(), companyController.updateCompanyById);

/**
 * Restore soft-deleted company (admin only)
 * POST /api/v1/admin/companies/:id/restore
 */
router.post('/:id/restore', companyController.restoreCompany);

/**
 * Update company subscription (admin only)
 * PATCH /api/v1/admin/companies/:id/subscription
 */
router.patch('/:id/subscription', updateSubscriptionValidationRules(), companyController.updateCompanySubscription);

/**
 * Soft delete company (admin action)
 * DELETE /api/v1/admin/companies/:id
 */
router.delete('/:id', companyController.softDeleteCompany);

export default router;