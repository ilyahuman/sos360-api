/**
 * companies.routes.ts
 *
 * This is the main entry point for all routes in the Companies module.
 * It sets up dependency injection and combines the customer and admin routers
 * onto their respective base paths.
 */

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

// Import all components of the module
import { CompanyRepository } from './companies.repository';
import { CompanyCustomerService } from './customer/companies.customer.service';
import { CompanyAdminService } from './admin/companies.admin.service';
import { CompanyCustomerController } from './customer/companies.customer.controller';
import { CompanyAdminController } from './admin/companies.admin.controller';
import customerRoutes from './routes/customer.routes';
import adminRoutes from './routes/admin.routes';

const router = Router();
const prisma = new PrismaClient();

// --- Dependency Injection Container ---
// This setup ensures that each layer receives its dependencies, promoting loose coupling.
const companyRepository = new CompanyRepository(prisma);

// Customer Flow Dependencies
const companyCustomerService = new CompanyCustomerService(companyRepository);
const companyCustomerController = new CompanyCustomerController(companyCustomerService);

// Admin Flow Dependencies
const companyAdminService = new CompanyAdminService(companyRepository);
const companyAdminController = new CompanyAdminController(companyAdminService);
// --- End of DI Container ---

// --- Route Mounting ---
// The admin routes are mounted under the '/admin' namespace.
router.use('/admin/companies', adminRoutes(companyAdminController));

// The customer routes are mounted at the root of the module's path.
router.use('/companies', customerRoutes(companyCustomerController));

export default router;
