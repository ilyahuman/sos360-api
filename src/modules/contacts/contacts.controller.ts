/**
 * Contact Controller
 * Handles HTTP requests and responses for contacts/leads
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { ContactService } from './contacts.service';
import { logger } from '@/shared/utils/logger';
import { LeadStatusEnum } from '@prisma/client';
import { ContactFiltersDTO } from './contacts.dto';

export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  /**
   * Create new contact/lead
   * POST /contacts
   */
  createContact = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
        return;
      }

      // TODO(!!!): Replace with real auth implementation when User/Auth module is ready
      // This is a temporary placeholder - should be replaced with:
      // const { userId, companyId } = req.user; // from auth middleware
      const companyId =
        (req.headers['x-company-id'] as string) || '61aebdca-4e43-475e-97f7-38567973efad';
      const userId = null; // Will be replaced with authenticated user ID when auth module is ready

      const contact = await this.contactService.createContact(req.body, companyId, userId);

      logger.info('Contact created successfully', {
        contactId: contact.id,
        companyId,
      });

      res.status(201).json({
        success: true,
        message: 'Contact created successfully',
        data: contact,
      });
    } catch (error) {
      logger.error('Error creating contact', error);

      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          res.status(409).json({
            success: false,
            message: error.message,
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  /**
   * Get contact by ID
   * GET /contacts/:id
   */
  getContactById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Contact ID is required',
        });
        return;
      }

      // TODO(!!!): Get companyId from auth to verify ownership when User/Auth module is ready
      const companyId =
        (req.headers['x-company-id'] as string) || '61aebdca-4e43-475e-97f7-38567973efad';

      const contact = await this.contactService.getContactById(id, companyId);

      if (!contact) {
        res.status(404).json({
          success: false,
          message: 'Contact not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Contact retrieved successfully',
        data: contact,
      });
    } catch (error) {
      logger.error('Error getting contact', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  /**
   * Update contact by ID
   * PUT /contacts/:id
   */
  updateContactById = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
        return;
      }

      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Contact ID is required',
        });
        return;
      }

      // TODO(!!!): Get companyId and userId from auth when User/Auth module is ready
      const companyId =
        (req.headers['x-company-id'] as string) || '61aebdca-4e43-475e-97f7-38567973efad';
      const userId = '025c88e6-7a0a-4aac-91a2-6ee03c2abbae'; // System placeholder user

      logger.info('Update contact request', {
        contactId: id,
        companyId,
        headerCompanyId: req.headers['x-company-id'],
        userId,
      });

      const contact = await this.contactService.updateContact(id, req.body, companyId, userId);

      if (!contact) {
        res.status(404).json({
          success: false,
          message: 'Contact not found',
        });
        return;
      }

      logger.info('Contact updated successfully', {
        contactId: id,
        updates: Object.keys(req.body),
      });

      res.json({
        success: true,
        message: 'Contact updated successfully',
        data: contact,
      });
    } catch (error) {
      logger.error('Error updating contact', error);

      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  /**
   * Get all contacts with filters
   * GET /contacts
   */
  getAllContacts = async (req: Request, res: Response): Promise<void> => {
    try {
      // TODO(!!!): Get companyId from auth when User/Auth module is ready
      const companyId =
        (req.headers['x-company-id'] as string) || '61aebdca-4e43-475e-97f7-38567973efad';

      // Parse filters from query params
      const filters: ContactFiltersDTO = {
        search: req.query.search as string,
        contactType: req.query.contactType as any,
        leadStatus: req.query.leadStatus as any,
        leadSource: req.query.leadSource as any,
        divisionId: req.query.divisionId as string,
        assignedUserId: req.query.assignedUserId as string,
      };

      // Handle optional filters
      if (req.query.isActive === 'true') {
        filters.isActive = true;
      } else if (req.query.isActive === 'false') {
        filters.isActive = false;
      }

      if (req.query.qualificationRequired === 'true') {
        filters.qualificationRequired = true;
      }

      // Parse pagination
      const pagination = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sortBy: (req.query.sortBy as string) || 'createdAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
      };

      const result = await this.contactService.getAllContacts(companyId, filters, pagination);

      res.json({
        success: true,
        message: 'Contacts retrieved successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Error getting contacts', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  /**
   * Update contact lead status
   * PATCH /contacts/:id/status
   */
  updateLeadStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { leadStatus } = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Contact ID is required',
        });
        return;
      }

      if (!leadStatus || !Object.values(LeadStatusEnum).includes(leadStatus)) {
        res.status(400).json({
          success: false,
          message: 'Valid lead status is required',
        });
        return;
      }

      // TODO(!!!): Get companyId and userId from auth when User/Auth module is ready
      const companyId =
        (req.headers['x-company-id'] as string) || '61aebdca-4e43-475e-97f7-38567973efad';
      const userId = '025c88e6-7a0a-4aac-91a2-6ee03c2abbae'; // System placeholder user

      const contact = await this.contactService.updateLeadStatus(id, leadStatus, companyId, userId);

      if (!contact) {
        res.status(404).json({
          success: false,
          message: 'Contact not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Lead status updated successfully',
        data: contact,
      });
    } catch (error) {
      logger.error('Error updating lead status', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  /**
   * Assign contact to user
   * PATCH /contacts/:id/assign
   */
  assignContact = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { assignedUserId } = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Contact ID is required',
        });
        return;
      }

      // TODO(!!!): Get companyId and userId from auth when User/Auth module is ready
      const companyId =
        (req.headers['x-company-id'] as string) || '61aebdca-4e43-475e-97f7-38567973efad';
      const userId = '025c88e6-7a0a-4aac-91a2-6ee03c2abbae'; // System placeholder user

      const contact = await this.contactService.assignContact(
        id,
        assignedUserId,
        companyId,
        userId
      );

      if (!contact) {
        res.status(404).json({
          success: false,
          message: 'Contact not found',
        });
        return;
      }

      res.json({
        success: true,
        message: assignedUserId
          ? 'Contact assigned successfully'
          : 'Contact unassigned successfully',
        data: contact,
      });
    } catch (error) {
      logger.error('Error assigning contact', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  /**
   * Update contact follow-up date
   * PATCH /contacts/:id/follow-up
   */
  updateFollowUp = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { nextFollowUpDate } = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Contact ID is required',
        });
        return;
      }

      // TODO(!!!): Get companyId and userId from auth when User/Auth module is ready
      const companyId =
        (req.headers['x-company-id'] as string) || '61aebdca-4e43-475e-97f7-38567973efad';
      const userId = '025c88e6-7a0a-4aac-91a2-6ee03c2abbae'; // System placeholder user

      const followUpDate = nextFollowUpDate ? new Date(nextFollowUpDate) : null;

      const contact = await this.contactService.updateFollowUp(id, followUpDate, companyId, userId);

      if (!contact) {
        res.status(404).json({
          success: false,
          message: 'Contact not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Follow-up date updated successfully',
        data: contact,
      });
    } catch (error) {
      logger.error('Error updating follow-up', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  /**
   * Soft delete contact
   * DELETE /contacts/:id
   */
  softDeleteContact = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Contact ID is required',
        });
        return;
      }

      // TODO(!!!): Get companyId and userId from auth when User/Auth module is ready
      const companyId =
        (req.headers['x-company-id'] as string) || '61aebdca-4e43-475e-97f7-38567973efad';
      const userId = '025c88e6-7a0a-4aac-91a2-6ee03c2abbae'; // System placeholder user

      const deleted = await this.contactService.softDeleteContact(id, companyId, userId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Contact not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Contact deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting contact', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  /**
   * Restore soft-deleted contact (Admin only)
   * POST /admin/contacts/:id/restore
   */
  restoreContact = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Contact ID is required',
        });
        return;
      }

      // TODO(!!!): Get companyId and userId from auth, verify admin role when User/Auth module is ready
      const companyId =
        (req.headers['x-company-id'] as string) || '61aebdca-4e43-475e-97f7-38567973efad';
      const userId = '025c88e6-7a0a-4aac-91a2-6ee03c2abbae'; // System placeholder user

      const contact = await this.contactService.restoreContact(id, companyId, userId);

      if (!contact) {
        res.status(404).json({
          success: false,
          message: 'Contact not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Contact restored successfully',
        data: contact,
      });
    } catch (error) {
      logger.error('Error restoring contact', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  /**
   * Get contact statistics
   * GET /contacts/stats
   */
  getContactStats = async (req: Request, res: Response): Promise<void> => {
    try {
      // TODO(!!!): Get companyId from auth when User/Auth module is ready
      const companyId =
        (req.headers['x-company-id'] as string) || '61aebdca-4e43-475e-97f7-38567973efad';
      const divisionId = req.query.divisionId as string;

      const stats = await this.contactService.getContactStats(companyId, divisionId);

      res.json({
        success: true,
        message: 'Contact statistics retrieved successfully',
        data: stats,
      });
    } catch (error) {
      logger.error('Error getting contact stats', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  /**
   * Get overdue follow-ups
   * GET /contacts/follow-ups/overdue
   */
  getOverdueFollowUps = async (req: Request, res: Response): Promise<void> => {
    try {
      // TODO(!!!): Get companyId from auth when User/Auth module is ready
      const companyId =
        (req.headers['x-company-id'] as string) || '61aebdca-4e43-475e-97f7-38567973efad';
      const limit = parseInt(req.query.limit as string) || 10;

      const contacts = await this.contactService.getOverdueFollowUps(companyId, limit);

      res.json({
        success: true,
        message: 'Overdue follow-ups retrieved successfully',
        data: contacts,
      });
    } catch (error) {
      logger.error('Error getting overdue follow-ups', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  /**
   * Get today's follow-ups
   * GET /contacts/follow-ups/today
   */
  getTodayFollowUps = async (req: Request, res: Response): Promise<void> => {
    try {
      // TODO(!!!): Get companyId from auth when User/Auth module is ready
      const companyId =
        (req.headers['x-company-id'] as string) || '61aebdca-4e43-475e-97f7-38567973efad';
      const assignedUserId = req.query.assignedUserId as string;

      const contacts = await this.contactService.getTodayFollowUps(companyId, assignedUserId);

      res.json({
        success: true,
        message: "Today's follow-ups retrieved successfully",
        data: contacts,
      });
    } catch (error) {
      logger.error("Error getting today's follow-ups", error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };
}
