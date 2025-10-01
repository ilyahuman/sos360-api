import { Router } from 'express';
import { DivisionController } from '../divisions.controller';
import {
  createDivisionValidator,
  updateDivisionValidator,
  divisionIdValidator,
  entityReassignmentValidator,
  bulkReassignmentValidator
} from '../divisions.validator';

export function createCustomerDivisionRoutes(controller: DivisionController): Router {
  const router = Router();

  // Customer Division Routes (Company-scoped operations)

  // GET /divisions - Get all divisions for current company
  router.get('/', controller.getDivisions);

  // GET /divisions/hierarchy - Get division hierarchy for current company
  router.get('/hierarchy', controller.getDivisionHierarchy);

  // GET /divisions/:id - Get specific division by ID
  router.get('/:id', divisionIdValidator, controller.getDivisionById);

  // GET /divisions/:id/stats - Get division statistics
  router.get('/:id/stats', divisionIdValidator, controller.getDivisionStats);

  // POST /divisions - Create new division
  router.post('/', createDivisionValidator, controller.createDivision);

  // PUT /divisions/:id - Update division
  router.put('/:id', updateDivisionValidator, controller.updateDivision);

  // DELETE /divisions/:id - Soft delete division
  router.delete('/:id', divisionIdValidator, controller.deleteDivision);

  // POST /divisions/reassign-entity - Reassign single entity to division
  router.post('/reassign-entity', entityReassignmentValidator, controller.reassignEntity);

  // POST /divisions/bulk-reassign - Bulk reassign entities to divisions
  router.post('/bulk-reassign', bulkReassignmentValidator, controller.bulkReassignEntities);

  return router;
}