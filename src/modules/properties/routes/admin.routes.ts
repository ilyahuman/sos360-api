/**
 * Admin Properties Routes
 * Cross-tenant property management operations
 */

import { Router } from 'express';
import { prisma } from '@/infrastructure/database/prisma.client';
import { PropertyRepository } from '../properties.repository';
import { PropertyService } from '../properties.service';
import { PropertyController } from '../properties.controller';
import {
  createPropertyValidationRules,
  updatePropertyValidationRules,
  listPropertiesValidationRules,
  getPropertyValidationRules,
} from '../properties.validator';

const router: Router = Router();

// Initialize dependencies with dependency injection
const propertyRepository = new PropertyRepository(prisma);
const propertyService = new PropertyService(propertyRepository);
const propertyController = new PropertyController(propertyService);

// TODO: Add authentication middleware when auth module is implemented
// router.use(authMiddleware);

// TODO: Add admin authorization middleware when implemented
// router.use(authorize(UserRoleType.SUPER_ADMIN));

/**
 * GET /admin/properties
 * Get all properties across all companies (cross-tenant)
 */
router.get('/', listPropertiesValidationRules(), propertyController.list);

/**
 * GET /admin/properties/stats
 * Get global property statistics across all companies
 */
router.get('/stats', propertyController.getStats);

/**
 * GET /admin/properties/:id
 * Get any property by ID (cross-tenant)
 */
router.get('/:id', getPropertyValidationRules(), propertyController.get);

/**
 * POST /admin/properties
 * Create a property in any company (cross-tenant)
 */
router.post('/', createPropertyValidationRules(), propertyController.create);

/**
 * PUT /admin/properties/:id
 * Update any property (cross-tenant)
 */
router.put('/:id', updatePropertyValidationRules(), propertyController.update);

/**
 * DELETE /admin/properties/:id
 * Delete any property (cross-tenant)
 */
router.delete('/:id', propertyController.delete);

/**
 * PATCH /admin/properties/:id/restore
 * Restore a deleted property (cross-tenant)
 */
router.patch('/:id/restore', propertyController.restore);

export default router;