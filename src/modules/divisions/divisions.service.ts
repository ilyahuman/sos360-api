import { DivisionRepository } from './divisions.repository';
import {
  CreateDivisionRequest,
  UpdateDivisionRequest,
  DivisionResponse,
  CreateDivisionData,
  UpdateDivisionData,
  DivisionStats,
  DivisionHierarchy,
  EntityReassignmentRequest,
  EntityReassignmentResponse,
  BulkReassignmentRequest,
  BulkReassignmentResponse,
  DivisionForResponse
} from './divisions.types';
import { logger } from '@/shared/utils/logger';

export class DivisionService {
  constructor(private divisionRepository: DivisionRepository) {}

  async createDivision(
    companyId: string,
    data: CreateDivisionRequest,
    userId: string
  ): Promise<DivisionResponse> {
    try {
      // Validate business rules
      await this.validateCreateDivision(companyId, data);

      const createData: CreateDivisionData = {
        ...data,
        companyId,
        createdBy: userId,
        updatedBy: userId
      };

      const division = await this.divisionRepository.create(createData);

      logger.info('Division created successfully', {
        divisionId: division.id,
        companyId,
        divisionName: division.name,
        createdBy: userId
      });

      return this.mapToResponse(division);
    } catch (error) {
      logger.error('Failed to create division', {
        companyId,
        divisionName: data.name,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async getDivisionById(id: string): Promise<DivisionResponse | null> {
    try {
      const division = await this.divisionRepository.findById(id);
      return division ? this.mapToResponse(division) : null;
    } catch (error) {
      logger.error('Failed to get division by ID', { divisionId: id, error });
      throw error;
    }
  }

  async getDivisionsByCompany(companyId: string): Promise<DivisionResponse[]> {
    try {
      const divisions = await this.divisionRepository.findByCompanyId(companyId);
      return divisions.map(division => this.mapToResponse(division));
    } catch (error) {
      logger.error('Failed to get divisions by company', { companyId, error });
      throw error;
    }
  }

  async getDivisionHierarchy(companyId: string): Promise<DivisionHierarchy[]> {
    try {
      const divisions = await this.divisionRepository.findHierarchy(companyId);
      return this.buildHierarchy(divisions);
    } catch (error) {
      logger.error('Failed to get division hierarchy', { companyId, error });
      throw error;
    }
  }

  async updateDivision(
    id: string,
    data: UpdateDivisionRequest,
    userId: string
  ): Promise<DivisionResponse | null> {
    try {
      // Validate business rules
      await this.validateUpdateDivision(id, data);

      const updateData: UpdateDivisionData = {
        ...data,
        updatedBy: userId
      };

      const division = await this.divisionRepository.update(id, updateData);

      if (division) {
        logger.info('Division updated successfully', {
          divisionId: id,
          updatedBy: userId
        });
        return this.mapToResponse(division);
      }

      return null;
    } catch (error) {
      logger.error('Failed to update division', { divisionId: id, error });
      throw error;
    }
  }

  async deleteDivision(id: string, userId: string): Promise<boolean> {
    try {
      // Check if division has any assigned entities
      const hasAssignedEntities = await this.checkAssignedEntities(id);
      if (hasAssignedEntities) {
        throw new Error('Cannot delete division with assigned entities. Please reassign entities first.');
      }

      const success = await this.divisionRepository.delete(id, userId);

      if (success) {
        logger.info('Division deleted successfully', {
          divisionId: id,
          deletedBy: userId
        });
      }

      return success;
    } catch (error) {
      logger.error('Failed to delete division', { divisionId: id, error });
      throw error;
    }
  }

  async getDivisionStats(divisionId: string): Promise<DivisionStats | null> {
    try {
      return await this.divisionRepository.getStats(divisionId);
    } catch (error) {
      logger.error('Failed to get division stats', { divisionId, error });
      throw error;
    }
  }

  async reassignEntity(
    request: EntityReassignmentRequest,
    userId: string
  ): Promise<EntityReassignmentResponse> {
    try {
      let success = false;
      let previousDivisionId: string | undefined;

      // Get current division assignment
      previousDivisionId = await this.getCurrentDivisionAssignment(request.entityType, request.entityId);

      // Get the entity to find its companyId
      const entity = await this.getEntityForReassignment(request.entityType, request.entityId);
      if (!entity) {
        throw new Error(`${request.entityType} not found`);
      }

      // Validate and get divisionId (fallback to "General" if not provided)
      const newDivisionId = await this.getValidDivisionId(request.newDivisionId, entity.companyId);

      switch (request.entityType) {
        case 'user':
          success = await this.divisionRepository.reassignUser(request.entityId, newDivisionId, userId);
          break;
        case 'contact':
          success = await this.divisionRepository.reassignContact(request.entityId, newDivisionId, userId);
          break;
        case 'property':
          success = await this.divisionRepository.reassignProperty(request.entityId, newDivisionId, userId);
          break;
        case 'opportunity':
          success = await this.divisionRepository.reassignOpportunity(request.entityId, newDivisionId, userId);
          break;
        case 'project':
          success = await this.divisionRepository.reassignProject(request.entityId, newDivisionId, userId);
          break;
        default:
          throw new Error(`Unsupported entity type: ${request.entityType}`);
      }

      const message = success
        ? `${request.entityType} reassigned successfully`
        : `Failed to reassign ${request.entityType}`;

      if (success) {
        logger.info('Entity reassigned to division', {
          entityType: request.entityType,
          entityId: request.entityId,
          previousDivisionId,
          newDivisionId: request.newDivisionId,
          reassignedBy: userId
        });
      }

      return {
        success,
        entityType: request.entityType,
        entityId: request.entityId,
        previousDivisionId: previousDivisionId ?? null,
        newDivisionId: newDivisionId,
        message
      };
    } catch (error) {
      logger.error('Failed to reassign entity', { request, error });
      return {
        success: false,
        entityType: request.entityType,
        entityId: request.entityId,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async bulkReassignEntities(
    bulkRequest: BulkReassignmentRequest,
    userId: string
  ): Promise<BulkReassignmentResponse> {
    const results: EntityReassignmentResponse[] = [];
    let successCount = 0;
    let failureCount = 0;

    for (const assignment of bulkRequest.assignments) {
      const result = await this.reassignEntity(assignment, userId);
      results.push(result);

      if (result.success) {
        successCount++;
      } else {
        failureCount++;
      }
    }

    logger.info('Bulk entity reassignment completed', {
      totalRequests: bulkRequest.assignments.length,
      successCount,
      failureCount,
      reassignedBy: userId
    });

    return {
      successCount,
      failureCount,
      results
    };
  }

  // Private helper methods
  private async validateCreateDivision(companyId: string, data: CreateDivisionRequest): Promise<void> {
    // Check for duplicate name within company
    const existingDivision = await this.divisionRepository.findByName(companyId, data.name);
    if (existingDivision) {
      throw new Error(`Division with name "${data.name}" already exists`);
    }

    // Validate parent division exists and belongs to same company
    if (data.parentDivisionId) {
      const parentDivision = await this.divisionRepository.findById(data.parentDivisionId);
      if (!parentDivision || parentDivision.companyId !== companyId) {
        throw new Error('Invalid parent division');
      }
    }

    // Validate division manager belongs to same company (if provided)
    if (data.divisionManagerId) {
      const manager = await this.prisma.user.findFirst({
        where: {
          id: data.divisionManagerId,
          companyId,
          isActive: true
        }
      });
      if (!manager) {
        throw new Error('Division manager must be an active user in the same company');
      }
    }
  }

  private async validateUpdateDivision(id: string, data: UpdateDivisionRequest): Promise<void> {
    const division = await this.divisionRepository.findById(id);
    if (!division) {
      throw new Error('Division not found');
    }

    // Validate parent division (prevent circular reference)
    if (data.parentDivisionId) {
      if (data.parentDivisionId === id) {
        throw new Error('Division cannot be its own parent');
      }

      const parentDivision = await this.divisionRepository.findById(data.parentDivisionId);
      if (!parentDivision || parentDivision.companyId !== division.companyId) {
        throw new Error('Invalid parent division');
      }
    }
  }

  private async checkAssignedEntities(divisionId: string): Promise<boolean> {
    const counts = await Promise.all([
      this.prisma.user.count({ where: { divisionId, isActive: true } }),
      this.prisma.contact.count({ where: { divisionId, isActive: true } }),
      this.prisma.property.count({ where: { divisionId, isActive: true } }),
      this.prisma.opportunity.count({ where: { divisionId, isActive: true } }),
      this.prisma.project.count({ where: { divisionId, isActive: true } })
    ]);

    return counts.some(count => count > 0);
  }

  private async getCurrentDivisionAssignment(entityType: string, entityId: string): Promise<string | undefined> {
    let entity: any;

    switch (entityType) {
      case 'user':
        entity = await this.prisma.user.findUnique({ where: { id: entityId }, select: { divisionId: true } });
        break;
      case 'contact':
        entity = await this.prisma.contact.findUnique({ where: { id: entityId }, select: { divisionId: true } });
        break;
      case 'property':
        entity = await this.prisma.property.findUnique({ where: { id: entityId }, select: { divisionId: true } });
        break;
      case 'opportunity':
        entity = await this.prisma.opportunity.findUnique({ where: { id: entityId }, select: { divisionId: true } });
        break;
      case 'project':
        entity = await this.prisma.project.findUnique({ where: { id: entityId }, select: { divisionId: true } });
        break;
    }

    return entity?.divisionId || undefined;
  }

  private buildHierarchy(divisions: any[]): DivisionHierarchy[] {
    const divisionMap = new Map(divisions.map(d => [d.id, d]));
    const rootDivisions: DivisionHierarchy[] = [];

    for (const division of divisions) {
      if (!division.parentDivisionId) {
        rootDivisions.push(this.buildHierarchyNode(division, divisionMap, 0, [division.name]));
      }
    }

    return rootDivisions;
  }

  private buildHierarchyNode(
    division: any,
    divisionMap: Map<string, any>,
    level: number,
    path: string[]
  ): DivisionHierarchy {
    const children: DivisionHierarchy[] = [];

    for (const child of division.childDivisions || []) {
      children.push(this.buildHierarchyNode(
        child,
        divisionMap,
        level + 1,
        [...path, child.name]
      ));
    }

    return {
      division: this.mapToResponse(division),
      children,
      level,
      path
    };
  }

  private mapToResponse(division: any): DivisionResponse {
    return {
      id: division.id,
      companyId: division.companyId,
      name: division.name,
      description: division.description,
      divisionType: division.divisionType,
      phone: division.phone,
      email: division.email,
      address: division.address,
      divisionManagerId: division.divisionManagerId,
      parentDivisionId: division.parentDivisionId,
      targetRevenue: division.targetRevenue ? Number(division.targetRevenue) : null,
      targetMarginPercentage: division.targetMarginPercentage ? Number(division.targetMarginPercentage) : null,
      employeeCount: division.employeeCount,
      activeProjectsCount: division.activeProjectsCount,
      colorCode: division.colorCode,
      icon: division.icon,
      sortOrder: division.sortOrder,
      settings: division.settings,
      isActive: division.isActive,
      createdAt: division.createdAt,
      updatedAt: division.updatedAt,
      createdBy: division.createdBy,
      updatedBy: division.updatedBy
    };
  }

  /**
   * Get entity with companyId for reassignment validation
   */
  private async getEntityForReassignment(
    entityType: string,
    entityId: string
  ): Promise<{ companyId: string } | null> {
    let entity: any;

    switch (entityType) {
      case 'user':
        entity = await this.prisma.user.findUnique({ where: { id: entityId }, select: { companyId: true } });
        break;
      case 'contact':
        entity = await this.prisma.contact.findUnique({ where: { id: entityId }, select: { companyId: true } });
        break;
      case 'property':
        entity = await this.prisma.property.findUnique({ where: { id: entityId }, select: { companyId: true } });
        break;
      case 'opportunity':
        entity = await this.prisma.opportunity.findUnique({ where: { id: entityId }, select: { companyId: true } });
        break;
      case 'project':
        entity = await this.prisma.project.findUnique({ where: { id: entityId }, select: { companyId: true } });
        break;
    }

    return entity;
  }

  /**
   * Validates divisionId and returns a valid division ID.
   * If no divisionId is provided, returns the default "General" division.
   * If divisionId is provided, validates it belongs to the company.
   */
  private async getValidDivisionId(
    divisionId: string | undefined,
    companyId: string
  ): Promise<string> {
    // If divisionId is provided, validate it
    if (divisionId) {
      const division = await this.prisma.division.findUnique({
        where: { id: divisionId },
      });

      if (!division) {
        throw new Error('Division not found');
      }

      if (division.companyId !== companyId) {
        throw new Error('Division does not belong to this company');
      }

      if (!division.isActive || division.deletedAt) {
        throw new Error('Division is not active');
      }

      return divisionId;
    }

    // No divisionId provided - get default "General" division
    const generalDivision = await this.prisma.division.findFirst({
      where: {
        companyId,
        name: 'General',
        isActive: true,
        deletedAt: null,
      },
    });

    if (!generalDivision) {
      throw new Error(
        'Default "General" division not found for company. Please ensure the company has a default division.'
      );
    }

    return generalDivision.id;
  }

  // Access to prisma for internal operations
  private get prisma() {
    return this.divisionRepository['prisma'];
  }
}