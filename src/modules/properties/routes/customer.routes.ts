/**
 * Customer Properties Routes
 * Company-scoped property management operations
 */

import { Router } from 'express';
import { prisma } from '@/infrastructure/database/prisma.client';
import { PropertyRepository } from '../properties.repository';
import { PropertyService } from '../properties.service';
import { PropertyController } from '../properties.controller';
import {
  createPropertyValidationRules,
  updatePropertyValidationRules,
  assignDivisionValidationRules,
  listPropertiesValidationRules,
  searchByLocationValidationRules,
  getPropertyValidationRules,
  getPropertiesByContactValidationRules,
  getPropertiesByDivisionValidationRules,
} from '../properties.validator';

const router: Router = Router();

// Initialize dependencies with dependency injection
const propertyRepository = new PropertyRepository(prisma);
const propertyService = new PropertyService(propertyRepository);
const propertyController = new PropertyController(propertyService);

// TODO: Add authentication middleware when auth module is implemented
// router.use(authMiddleware);

// TODO: Add tenant isolation middleware when implemented
// router.use(tenantIsolation);

/**
 * GET /properties
 * Get all properties for the company with filters and pagination
 */
router.get('/', listPropertiesValidationRules(), propertyController.list);

/**
 * GET /properties/stats
 * Get property statistics for the company
 */
router.get('/stats', propertyController.getStats);

/**
 * GET /properties/search/location
 * Search properties by geographic coordinates and radius
 */
router.get('/search/location', searchByLocationValidationRules(), propertyController.searchByLocation);

/**
 * GET /properties/contact/:contactId
 * Get all properties for a specific contact
 */
router.get('/contact/:contactId', getPropertiesByContactValidationRules(), propertyController.getByContact);

/**
 * GET /properties/division/:divisionId
 * Get all properties in a specific division
 */
router.get('/division/:divisionId', getPropertiesByDivisionValidationRules(), propertyController.getByDivision);

/**
 * GET /properties/:id
 * Get a specific property by ID
 */
router.get('/:id', getPropertyValidationRules(), propertyController.get);

/**
 * POST /properties
 * Create a new property
 */
router.post('/', createPropertyValidationRules(), propertyController.create);

/**
 * PUT /properties/:id
 * Update property information
 */
router.put('/:id', updatePropertyValidationRules(), propertyController.update);

/**
 * PATCH /properties/:id/division
 * Assign property to a division
 */
router.patch('/:id/division', assignDivisionValidationRules(), propertyController.assignDivision);

/**
 * DELETE /properties/:id
 * Soft delete a property
 */
router.delete('/:id', propertyController.delete);

export default router;