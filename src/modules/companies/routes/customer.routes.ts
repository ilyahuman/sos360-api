/**
 * routes/customer.routes.ts
 *
 * Defines the Express routes for the customer-facing company flow.
 * These routes are tenant-scoped and rely on the authenticated user's context.
 */

import { Router } from 'express';
import { CompanyCustomerController } from '../customer/companies.customer.controller';
import { validate } from '@/shared/middleware/validate';
import { updateCompanySchema } from '../companies.schema';
import { isAuthenticated } from '@/shared/middleware/auth'; // Assuming auth middleware exists

export default (controller: CompanyCustomerController): Router => {
  const router = Router();

  // All customer routes require authentication.
  router.use(isAuthenticated);

  router.get('/profile', controller.getProfile);
  router.put('/profile', validate(updateCompanySchema), controller.updateProfile);

  return router;
};