/**
 * routes/admin.routes.ts
 *
 * Defines the Express routes for the admin-facing company flow.
 * These routes are for cross-tenant operations and are protected by admin-level authorization.
 */

import { Router } from 'express';
import { CompanyAdminController } from '../admin/companies.admin.controller';
import { validate } from '@/api/middleware/validate';
// import { isAuthenticated, isAdmin } from '@/shared/middleware/authentication'; // Not implemented yet
import {
  createCompanyDTO,
  updateCompanyDTO,
  listCompaniesQueryDTO,
  companyIdParamsSchema,
} from '../companies.schema';

export default (controller: CompanyAdminController): Router => {
  const router = Router();

  // All admin routes require an authenticated admin user.
  // router.use(isAuthenticated, isAdmin);

  router
    .route('/')
    .post(validate(createCompanyDTO), controller.create)
    .get(validate(listCompaniesQueryDTO), controller.getAll);

  router
    .route('/:id')
    .get(validate(companyIdParamsSchema), controller.getById)
    .put(validate(companyIdParamsSchema.merge(updateCompanyDTO)), controller.update)
    .delete(validate(companyIdParamsSchema), controller.delete);

  return router;
};
