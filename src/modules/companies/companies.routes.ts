/**
 * companies.routes.ts (Refactored)
 *
 * This is the main entry point for all routes in the Companies module.
 * It now functions as a dependency injection (DI) factory. It accepts the global
 * Prisma client, constructs the entire dependency graph for the module, and
 * returns a configured router.
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

// The function now accepts dependencies, centralizing DI.
export default (prisma: PrismaClient): Router => {
  const router = Router();

  // --- Dependency Injection Container ---
  // The repository is created once with the shared, global Prisma client.
  const companyRepository = new CompanyRepository(prisma);

  // Customer Flow Dependencies
  const companyCustomerService = new CompanyCustomerService(companyRepository);
  const companyCustomerController = new CompanyCustomerController(companyCustomerService);

  // Admin Flow Dependencies
  const companyAdminService = new CompanyAdminService(companyRepository);
  const companyAdminController = new CompanyAdminController(companyAdminService);
  // --- End of DI Container ---

  // --- Route Mounting ---
  // The RouteConfigurator will mount this entire router at `/api/v1/companies`.
  // Therefore, we mount the sub-routes relative to that.
  router.use('/admin', adminRoutes(companyAdminController));
  router.use('/', customerRoutes(companyCustomerController)); // Customer routes are at the root.

  return router;
};
