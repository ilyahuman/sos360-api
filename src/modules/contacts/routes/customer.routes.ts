/**
 * Customer Contacts Routes
 * Company-scoped contact/lead management operations
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
const contactService = new ContactService(contactRepository, prisma);
const contactController = new ContactController(contactService);

// TODO: Add authentication middleware when auth module is implemented
// router.use(authMiddleware);

// TODO: Add tenant isolation middleware when implemented
// router.use(tenantIsolation);

/**
 * GET /contacts
 * Get all contacts for the company with filters and pagination
 */
router.get('/', contactController.getAllContacts);

/**
 * GET /contacts/stats
 * Get contact statistics for the company
 */
router.get('/stats', contactController.getContactStats);

/**
 * GET /contacts/follow-ups/overdue
 * Get contacts with overdue follow-ups
 */
router.get('/follow-ups/overdue', contactController.getOverdueFollowUps);

/**
 * GET /contacts/follow-ups/today
 * Get today's follow-ups
 */
router.get('/follow-ups/today', contactController.getTodayFollowUps);

/**
 * GET /contacts/:id
 * Get a specific contact by ID
 */
router.get('/:id', contactController.getContactById);

/**
 * POST /contacts
 * Create a new contact/lead
 */
router.post('/', createContactValidationRules(), contactController.createContact);

/**
 * PUT /contacts/:id
 * Update contact information
 */
router.put('/:id', updateContactValidationRules(), contactController.updateContactById);

/**
 * PATCH /contacts/:id/status
 * Update contact lead status (Lead → Prospect → Qualified → Customer)
 */
router.patch('/:id/status', updateLeadStatusValidationRules(), contactController.updateLeadStatus);

/**
 * PATCH /contacts/:id/assign
 * Assign contact to a user
 */
router.patch('/:id/assign', assignContactValidationRules(), contactController.assignContact);

/**
 * PATCH /contacts/:id/follow-up
 * Update contact follow-up date
 */
router.patch('/:id/follow-up', updateFollowUpValidationRules(), contactController.updateFollowUp);

/**
 * DELETE /contacts/:id
 * Soft delete a contact
 */
router.delete('/:id', contactController.softDeleteContact);

export default router;
