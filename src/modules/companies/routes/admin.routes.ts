/**
 * routes/admin.routes.ts
 *
 * Defines the Express routes for the admin-facing company flow.
 * These routes are for cross-tenant operations and are protected by admin-level authorization.
 */

import { Router } from 'express';
import { CompanyAdminController } from '../admin/companies.admin.controller';
import { validate } from '@/shared/middleware/validate';
import {
  createCompanySchema,
  updateCompanySchema,
  listCompaniesQuerySchema,
  companyIdParamsSchema,
} from '../companies.schema';
import { isAuthenticated, isAdmin } from '@/shared/middleware/auth'; // Assuming auth middleware exists

export default (controller: CompanyAdminController): Router => {
  const router = Router();

  // All admin routes require an authenticated admin user.
  router.use(isAuthenticated, isAdmin);

  router
    .route('/')
    .post(validate(createCompanySchema), controller.create)
    .get(validate(listCompaniesQuerySchema), controller.getAll);

  router
    .route('/:id')
    .get(validate(companyIdParamsSchema), controller.getById)
    .put(validate(companyIdParamsSchema.merge(updateCompanySchema)), controller.update)
    .delete(validate(companyIdParamsSchema), controller.delete);

  return router;
};