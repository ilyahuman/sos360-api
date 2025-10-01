/**
 * Contact Service
 * Business logic layer using DTOs
 */

import { ContactRepository } from './contacts.repository';
import {
  CreateContactDTO,
  UpdateContactDTO,
  ContactResponseDTO,
  ContactListResponseDTO,
  ContactFiltersDTO,
  PaginationDTO,
  ContactDTOMapper,
  ContactStatsDTO,
} from './contacts.dto';
import { LeadStatusEnum } from '@prisma/client';
import { logger } from '@/shared/utils/logger';

export class ContactService {
  constructor(private readonly contactRepository: ContactRepository) {}

  async createContact(
    data: CreateContactDTO,
    companyId: string,
    userId: string | null
  ): Promise<ContactResponseDTO> {
    // TODO(!!!): Add auth check when User/Auth module is implemented
    // This should verify that the user belongs to the company and has permission to create contacts
    // Example: const user = await authService.validateUserCompany(userId, companyId);

    // Check for duplicate email if provided
    if (data.email) {
      const existingContact = await this.contactRepository.findByEmail(data.email, companyId);
      if (existingContact) {
        throw new Error('A contact with this email already exists in your company');
      }
    }

    // Check for duplicate phone if provided
    if (data.phone) {
      const existingContact = await this.contactRepository.findByPhone(data.phone, companyId);
      if (existingContact) {
        logger.warn('Creating contact with duplicate phone number', {
          phone: data.phone,
          companyId,
        });
      }
    }

    const contact = await this.contactRepository.create(data, companyId, userId);
    logger.info('Contact created', {
      contactId: contact.id,
      companyId,
      leadStatus: contact.leadStatus,
    });

    return ContactDTOMapper.toResponse(contact);
  }

  async getContactById(id: string, companyId?: string): Promise<ContactResponseDTO | null> {
    const contact = await this.contactRepository.findById(id);

    if (!contact) {
      return null;
    }

    // Check company ownership if companyId is provided
    if (companyId && contact.companyId !== companyId) {
      logger.warn('Attempted to access contact from different company', {
        contactId: id,
        requestCompanyId: companyId,
        actualCompanyId: contact.companyId
      });
      return null; // Return null as if not found to avoid exposing that the contact exists
    }

    return ContactDTOMapper.toResponse(contact);
  }

  async updateContact(
    id: string,
    data: UpdateContactDTO,
    companyId: string,
    userId: string
  ): Promise<ContactResponseDTO | null> {
    // TODO: Add auth check
    // const user = await authService.validateUserCompany(userId, companyId);

    // Verify contact exists and belongs to company
    const existingContact = await this.contactRepository.findById(id);
    if (!existingContact) {
      return null;
    }

    // Check company ownership
    if (existingContact.companyId !== companyId) {
      logger.warn('Attempted to update contact from different company', {
        contactId: id,
        requestCompanyId: companyId,
        actualCompanyId: existingContact.companyId
      });
      return null; // Return null as if not found to avoid exposing that the contact exists
    }

    // Check for duplicate email if changing
    if (data.email && data.email !== existingContact.email) {
      const emailExists = await this.contactRepository.emailExists(data.email, companyId, id);
      if (emailExists) {
        throw new Error('A contact with this email already exists');
      }
    }

    const contact = await this.contactRepository.update(id, data, userId);
    if (!contact) {
      return null;
    }

    logger.info('Contact updated', {
      contactId: id,
      changes: Object.keys(data),
    });

    return ContactDTOMapper.toResponse(contact);
  }

  async getAllContacts(
    companyId: string,
    filters: ContactFiltersDTO = {},
    pagination: PaginationDTO = {}
  ): Promise<ContactListResponseDTO> {
    // TODO(!!!): Add auth check when User/Auth module is implemented
    // Example: await authService.validateUserCompany(userId, companyId);

    const { contacts, total } = await this.contactRepository.findAll(
      companyId,
      filters,
      pagination
    );
    const { page = 1, limit = 10 } = pagination;

    return {
      contacts: ContactDTOMapper.toResponseList(contacts),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateLeadStatus(
    id: string,
    leadStatus: LeadStatusEnum,
    companyId: string,
    userId: string
  ): Promise<ContactResponseDTO | null> {
    // TODO(!!!): Add auth check when User/Auth module is implemented
    // Example: await authService.validateUserCompany(userId, companyId);

    const existingContact = await this.contactRepository.findById(id);
    if (!existingContact) {
      return null;
    }

    // Check company ownership
    if (existingContact.companyId !== companyId) {
      logger.warn('Attempted to update lead status from different company', {
        contactId: id,
        requestCompanyId: companyId,
        actualCompanyId: existingContact.companyId
      });
      return null;
    }

    const contact = await this.contactRepository.updateLeadStatus(id, leadStatus, userId);
    if (!contact) {
      return null;
    }

    logger.info('Contact lead status updated', {
      contactId: id,
      oldStatus: existingContact.leadStatus,
      newStatus: leadStatus,
    });

    return ContactDTOMapper.toResponse(contact);
  }

  async assignContact(
    id: string,
    assignedUserId: string | null,
    companyId: string,
    userId: string
  ): Promise<ContactResponseDTO | null> {
    // TODO(!!!): Add auth check when User/Auth module is implemented
    // Example: await authService.validateUserCompany(userId, companyId);

    const existingContact = await this.contactRepository.findById(id);
    if (!existingContact) {
      return null;
    }

    // Check company ownership
    if (existingContact.companyId !== companyId) {
      logger.warn('Attempted to assign contact from different company', {
        contactId: id,
        requestCompanyId: companyId,
        actualCompanyId: existingContact.companyId
      });
      return null;
    }
    // TODO(!!!): Validate assigned user when User/Auth module is implemented
    // This should verify the assigned user exists and belongs to the same company
    // Example:
    // if (assignedUserId) {
    //   await authService.validateUserCompany(assignedUserId, companyId);
    // }

    const contact = await this.contactRepository.assignToUser(id, assignedUserId, userId);
    if (!contact) {
      return null;
    }

    logger.info('Contact assignment updated', {
      contactId: id,
      assignedTo: assignedUserId,
      assignedBy: userId,
    });

    return ContactDTOMapper.toResponse(contact);
  }

  async updateFollowUp(
    id: string,
    nextFollowUpDate: Date | null,
    companyId: string,
    userId: string
  ): Promise<ContactResponseDTO | null> {
    // TODO(!!!): Add auth check when User/Auth module is implemented
    // Example: await authService.validateUserCompany(userId, companyId);

    const existingContact = await this.contactRepository.findById(id);
    if (!existingContact) {
      return null;
    }

    // Check company ownership
    if (existingContact.companyId !== companyId) {
      logger.warn('Attempted to update follow-up from different company', {
        contactId: id,
        requestCompanyId: companyId,
        actualCompanyId: existingContact.companyId
      });
      return null;
    }

    const contact = await this.contactRepository.updateFollowUp(id, nextFollowUpDate, userId);
    if (!contact) {
      return null;
    }

    logger.info('Contact follow-up updated', {
      contactId: id,
      nextFollowUp: nextFollowUpDate,
    });

    return ContactDTOMapper.toResponse(contact);
  }

  async softDeleteContact(id: string, companyId: string, userId: string): Promise<boolean> {
    // TODO(!!!): Add auth check when User/Auth module is implemented
    // Example: await authService.validateUserCompany(userId, companyId);

    const existingContact = await this.contactRepository.findById(id);
    if (!existingContact) {
      return false;
    }

    // Check company ownership
    if (existingContact.companyId !== companyId) {
      logger.warn('Attempted to delete contact from different company', {
        contactId: id,
        requestCompanyId: companyId,
        actualCompanyId: existingContact.companyId
      });
      return false;
    }

    const contact = await this.contactRepository.softDelete(id, userId);

    if (contact) {
      logger.info('Contact soft deleted', {
        contactId: id,
        deletedBy: userId,
      });
    }

    return contact !== null;
  }

  async restoreContact(
    id: string,
    companyId: string,
    userId: string
  ): Promise<ContactResponseDTO | null> {
    // TODO(!!!): Add auth check when User/Auth module is implemented - admin only
    // This should verify the user has admin permissions
    // Example: await authService.validateAdminUser(userId, companyId);

    const existingContact = await this.contactRepository.findById(id);
    if (!existingContact) {
      return null;
    }

    // Check company ownership
    if (existingContact.companyId !== companyId) {
      logger.warn('Attempted to restore contact from different company', {
        contactId: id,
        requestCompanyId: companyId,
        actualCompanyId: existingContact.companyId
      });
      return null;
    }

    const contact = await this.contactRepository.restore(id, userId);
    if (!contact) {
      return null;
    }

    logger.info('Contact restored', {
      contactId: id,
      restoredBy: userId,
    });

    return ContactDTOMapper.toResponse(contact);
  }

  async contactExists(id: string): Promise<boolean> {
    return await this.contactRepository.exists(id);
  }

  async getContactStats(companyId: string, divisionId?: string): Promise<ContactStatsDTO> {
    // TODO(!!!): Add auth check when User/Auth module is implemented
    // Example: await authService.validateUserCompany(userId, companyId);

    const stats = await this.contactRepository.getStats(companyId, divisionId);

    return {
      totalContacts: stats.totalContacts,
      leadCount: stats.leadCount,
      prospectCount: stats.prospectCount,
      qualifiedCount: stats.qualifiedCount,
      customerCount: stats.customerCount,
      inactiveCount: stats.inactiveCount,
      commercialCount: stats.commercialCount,
      residentialCount: stats.residentialCount,
      hoaCount: stats.hoaCount,
      municipalCount: stats.municipalCount,
      industrialCount: stats.industrialCount,
      overdueFollowUps: stats.overdueFollowUps,
      upcomingFollowUps: stats.upcomingFollowUps,
    };
  }

  async getOverdueFollowUps(
    companyId: string,
    limit: number = 10
  ): Promise<ContactResponseDTO[]> {
    // TODO(!!!): Add auth check when User/Auth module is implemented
    // Example: await authService.validateUserCompany(userId, companyId);

    const contacts = await this.contactRepository.getOverdueFollowUps(companyId, limit);
    return ContactDTOMapper.toResponseList(contacts);
  }

  async getTodayFollowUps(
    companyId: string,
    assignedUserId?: string
  ): Promise<ContactResponseDTO[]> {
    // TODO(!!!): Add auth check when User/Auth module is implemented
    // Example: await authService.validateUserCompany(userId, companyId);

    const contacts = await this.contactRepository.getTodayFollowUps(companyId, assignedUserId);
    return ContactDTOMapper.toResponseList(contacts);
  }
}