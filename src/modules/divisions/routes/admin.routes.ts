import { Router } from 'express';
import { DivisionController } from '../divisions.controller';
import {
  createDivisionValidator,
  updateDivisionValidator,
  divisionIdValidator,
  entityReassignmentValidator,
  bulkReassignmentValidator
} from '../divisions.validator';

export function createAdminDivisionRoutes(controller: DivisionController): Router {
  const router = Router();

  // Admin Division Routes (Cross-tenant operations)

  // GET /admin/divisions/:companyId - Get all divisions for specific company
  router.get('/:companyId', controller.getDivisions);

  // GET /admin/divisions/:companyId/hierarchy - Get division hierarchy for specific company
  router.get('/:companyId/hierarchy', controller.getDivisionHierarchy);

  // GET /admin/divisions/division/:id - Get specific division by ID
  router.get('/division/:id', divisionIdValidator, controller.getDivisionById);

  // GET /admin/divisions/division/:id/stats - Get division statistics
  router.get('/division/:id/stats', divisionIdValidator, controller.getDivisionStats);

  // POST /admin/divisions/:companyId - Create new division for specific company
  router.post('/:companyId', createDivisionValidator, controller.createDivision);

  // PUT /admin/divisions/division/:id - Update division
  router.put('/division/:id', updateDivisionValidator, controller.updateDivision);

  // DELETE /admin/divisions/division/:id - Soft delete division
  router.delete('/division/:id', divisionIdValidator, controller.deleteDivision);

  // POST /admin/divisions/reassign-entity - Admin reassign entity to division
  router.post('/reassign-entity', entityReassignmentValidator, controller.reassignEntity);

  // POST /admin/divisions/bulk-reassign - Admin bulk reassign entities
  router.post('/bulk-reassign', bulkReassignmentValidator, controller.bulkReassignEntities);

  return router;
}