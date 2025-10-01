/**
 * Admin Contacts Routes
 * Cross-tenant contact management operations
 */

import { Router } from 'express';
import { prisma } from '@/infrastructure/database/prisma.client';
import { ContactRepository } from '../contacts.repository';
import { ContactService } from '../contacts.service';
import { ContactController } from '../contacts.controller';
import {
  createContactValidationRules,
  updateContactValidationRules,
  updateLeadStatusValidationRules,
  assignContactValidationRules,
  updateFollowUpValidationRules,
} from '../contacts.validator';

const router: Router = Router();

// Initialize dependencies with dependency injection
const contactRepository = new ContactRepository(prisma);
const contactService = new ContactService(contactRepository);
const contactController = new ContactController(contactService);

// TODO: Add admin authentication middleware when auth module is implemented
// router.use(adminAuthMiddleware);

// TODO: Add admin role check middleware when RBAC is implemented
// router.use(requireRole(['SUPER_ADMIN', 'EXECUTIVE']));

/**
 * GET /admin/contacts
 * Get all contacts across all companies (with filters)
 */
router.get('/', contactController.getAllContacts);

/**
 * GET /admin/contacts/stats
 * Get contact statistics across all companies
 */
router.get('/stats', contactController.getContactStats);

/**
 * GET /admin/contacts/:id
 * Get any contact by ID (cross-tenant)
 */
router.get('/:id', contactController.getContactById);

/**
 * POST /admin/contacts
 * Create a new contact for any company
 */
router.post('/', createContactValidationRules(), contactController.createContact);

/**
 * PUT /admin/contacts/:id
 * Update any contact (cross-tenant)
 */
router.put('/:id', updateContactValidationRules(), contactController.updateContactById);

/**
 * PATCH /admin/contacts/:id/status
 * Update lead status for any contact
 */
router.patch('/:id/status', updateLeadStatusValidationRules(), contactController.updateLeadStatus);

/**
 * PATCH /admin/contacts/:id/assign
 * Assign any contact to a user
 */
router.patch('/:id/assign', assignContactValidationRules(), contactController.assignContact);

/**
 * PATCH /admin/contacts/:id/follow-up
 * Update follow-up date for any contact
 */
router.patch('/:id/follow-up', updateFollowUpValidationRules(), contactController.updateFollowUp);

/**
 * POST /admin/contacts/:id/restore
 * Restore a soft-deleted contact (admin only)
 */
router.post('/:id/restore', contactController.restoreContact);

/**
 * DELETE /admin/contacts/:id
 * Soft delete any contact (cross-tenant)
 */
router.delete('/:id', contactController.softDeleteContact);

export default router;
