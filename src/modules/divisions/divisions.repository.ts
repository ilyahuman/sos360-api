import { PrismaClient, Division, Prisma } from '@prisma/client';
import { CreateDivisionData, UpdateDivisionData, DivisionStats } from './divisions.types';

export class DivisionRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateDivisionData): Promise<Division> {
    const defaultSettings = {
      operatingRegion: [],
      specializations: [],
      budgetLimits: {},
      customFields: {},
      automationRules: {}
    };

    // Get the next sort order for this company
    const maxSortOrder = await this.prisma.division.aggregate({
      where: {
        companyId: data.companyId,
        isActive: true,
        deletedAt: null,
      },
      _max: { sortOrder: true }
    });

    const createInput: Prisma.DivisionCreateInput = {
      company: {
        connect: { id: data.companyId }
      },
      name: data.name,
      description: data.description || null,
      divisionType: data.divisionType || 'GEOGRAPHIC',
      phone: data.phone || null,
      email: data.email || null,
      address: data.address ? data.address : Prisma.JsonNull,
      targetRevenue: data.targetRevenue || null,
      targetMarginPercentage: data.targetMarginPercentage || null,
      colorCode: data.colorCode || '#007bff',
      icon: data.icon || null,
      sortOrder: (maxSortOrder._max.sortOrder || 0) + 1,
      settings: data.settings || defaultSettings,
      createdBy: data.createdBy || null,
      updatedBy: data.updatedBy || null,
      ...(data.divisionManagerId && {
        divisionManager: { connect: { id: data.divisionManagerId } }
      }),
      ...(data.parentDivisionId && {
        parentDivision: { connect: { id: data.parentDivisionId } }
      })
    };

    // Use transaction to create division and maintain closure table
    return await this.prisma.$transaction(async (tx) => {
      // Create the division
      const division = await tx.division.create({
        data: createInput,
      });

      // Maintain closure table
      await this.maintainClosureTableOnCreate(tx, division.id, data.parentDivisionId);

      return division;
    });
  }

  async findById(id: string): Promise<Division | null> {
    return await this.prisma.division.findUnique({
      where: {
        id,
        isActive: true,
        deletedAt: null,
      },
    });
  }

  async findByCompanyId(companyId: string): Promise<Division[]> {
    return await this.prisma.division.findMany({
      where: {
        companyId,
        isActive: true,
        deletedAt: null,
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findByName(companyId: string, name: string): Promise<Division | null> {
    return await this.prisma.division.findFirst({
      where: {
        companyId,
        name: {
          equals: name,
          mode: 'insensitive'
        },
        isActive: true,
        deletedAt: null,
      },
    });
  }

  async findHierarchy(companyId: string): Promise<Division[]> {
    return await this.prisma.division.findMany({
      where: {
        companyId,
        isActive: true,
        deletedAt: null,
      },
      include: {
        childDivisions: {
          where: { isActive: true, deletedAt: null },
          orderBy: { sortOrder: 'asc' }
        },
        divisionManager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async update(id: string, data: UpdateDivisionData): Promise<Division | null> {
    try {
      const updateInput: Prisma.DivisionUpdateInput = {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.divisionType && { divisionType: data.divisionType }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.address !== undefined && { address: data.address ? data.address : Prisma.JsonNull }),
        ...(data.targetRevenue !== undefined && { targetRevenue: data.targetRevenue }),
        ...(data.targetMarginPercentage !== undefined && { targetMarginPercentage: data.targetMarginPercentage }),
        ...(data.colorCode && { colorCode: data.colorCode }),
        ...(data.icon !== undefined && { icon: data.icon }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        updatedBy: data.updatedBy,
        updatedAt: new Date(),
        ...(data.divisionManagerId !== undefined && {
          divisionManager: data.divisionManagerId
            ? { connect: { id: data.divisionManagerId } }
            : { disconnect: true }
        }),
        ...(data.parentDivisionId !== undefined && {
          parentDivision: data.parentDivisionId
            ? { connect: { id: data.parentDivisionId } }
            : { disconnect: true }
        })
      };

      // Check if parentDivisionId is being updated
      const parentDivisionChanged = data.parentDivisionId !== undefined;

      if (parentDivisionChanged) {
        // Use transaction to update division and maintain closure table
        return await this.prisma.$transaction(async (tx) => {
          // Get current division to check old parent
          const currentDivision = await tx.division.findUnique({ where: { id } });
          if (!currentDivision) return null;

          // Update the division
          const division = await tx.division.update({
            where: { id },
            data: updateInput,
          });

          // If parent changed, rebuild closure table paths
          if (currentDivision.parentDivisionId !== data.parentDivisionId) {
            await this.maintainClosureTableOnUpdate(tx, id, currentDivision.parentDivisionId, data.parentDivisionId);
          }

          return division;
        });
      } else {
        // No parent change, simple update
        return await this.prisma.division.update({
          where: { id },
          data: updateInput,
        });
      }
    } catch (error) {
      return null;
    }
  }

  async delete(id: string, deletedBy: string): Promise<boolean> {
    try {
      await this.prisma.division.update({
        where: { id },
        data: {
          isActive: false,
          deletedAt: new Date(),
          updatedBy: deletedBy,
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.division.count({
      where: {
        id,
        isActive: true,
        deletedAt: null,
      },
    });
    return count > 0;
  }

  async getStats(divisionId: string): Promise<DivisionStats | null> {
    const division = await this.prisma.division.findUnique({
      where: { id: divisionId },
      include: {
        opportunities: {
          where: { isActive: true }
        },
        projects: {
          where: { isActive: true }
        }
      }
    });

    if (!division) return null;

    const totalRevenue = division.projects
      .filter(p => p.projectStatus === 'COMPLETED')
      .reduce((sum, p) => sum + Number(p.contractValue), 0);

    const completedProjects = division.projects.filter(p => p.projectStatus === 'COMPLETED').length;
    const totalProjects = division.projects.length;
    const completionRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;

    const avgProjectValue = totalProjects > 0 ? totalRevenue / totalProjects : 0;

    let performanceStatus: 'above_target' | 'on_target' | 'below_target' | 'no_target' = 'no_target';
    if (division.targetRevenue) {
      const targetAchievement = totalRevenue / Number(division.targetRevenue);
      if (targetAchievement >= 1.1) performanceStatus = 'above_target';
      else if (targetAchievement >= 0.9) performanceStatus = 'on_target';
      else performanceStatus = 'below_target';
    }

    return {
      id: division.id,
      name: division.name,
      divisionType: division.divisionType,
      employeeCount: division.employeeCount,
      activeProjectsCount: division.activeProjectsCount,
      totalRevenue,
      totalOpportunities: division.opportunities.length,
      avgProjectValue,
      completionRate,
      targetRevenue: division.targetRevenue ? Number(division.targetRevenue) : null,
      targetMarginPercentage: division.targetMarginPercentage ? Number(division.targetMarginPercentage) : null,
      performanceStatus
    };
  }

  // Entity reassignment methods
  async reassignUser(userId: string, newDivisionId: string, updatedBy: string): Promise<boolean> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          divisionId: newDivisionId,
          updatedBy,
          updatedAt: new Date()
        }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async reassignContact(contactId: string, newDivisionId: string, updatedBy: string): Promise<boolean> {
    try {
      await this.prisma.contact.update({
        where: { id: contactId },
        data: {
          divisionId: newDivisionId,
          updatedBy,
          updatedAt: new Date()
        }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async reassignProperty(propertyId: string, newDivisionId: string, updatedBy: string): Promise<boolean> {
    try {
      await this.prisma.property.update({
        where: { id: propertyId },
        data: {
          divisionId: newDivisionId,
          updatedBy,
          updatedAt: new Date()
        }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async reassignOpportunity(opportunityId: string, newDivisionId: string, updatedBy: string): Promise<boolean> {
    try {
      await this.prisma.opportunity.update({
        where: { id: opportunityId },
        data: {
          divisionId: newDivisionId,
          updatedBy,
          updatedAt: new Date()
        }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async reassignProject(projectId: string, newDivisionId: string, updatedBy: string): Promise<boolean> {
    try {
      await this.prisma.project.update({
        where: { id: projectId },
        data: {
          divisionId: newDivisionId,
          updatedBy,
          updatedAt: new Date()
        }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Private: Closure Table Maintenance Methods
   */

  /**
   * Maintain closure table when creating a new division
   */
  private async maintainClosureTableOnCreate(
    tx: any,
    divisionId: string,
    parentDivisionId: string | undefined
  ): Promise<void> {
    // 1. Create self-referencing entry (depth = 0)
    await tx.divisionClosure.create({
      data: {
        ancestorId: divisionId,
        descendantId: divisionId,
        depth: 0,
      },
    });

    // 2. If there's a parent, copy all ancestor paths and add new paths
    if (parentDivisionId) {
      // Get all ancestors of the parent (including parent itself)
      const parentPaths = await tx.divisionClosure.findMany({
        where: {
          descendantId: parentDivisionId,
        },
      });

      // Create new closure entries for all ancestor relationships
      for (const path of parentPaths) {
        await tx.divisionClosure.create({
          data: {
            ancestorId: path.ancestorId,
            descendantId: divisionId,
            depth: path.depth + 1,
          },
        });
      }
    }
  }

  /**
   * Maintain closure table when updating division parent
   */
  private async maintainClosureTableOnUpdate(
    tx: any,
    divisionId: string,
    oldParentId: string | null | undefined,
    newParentId: string | null | undefined
  ): Promise<void> {
    // Get all descendants of this division (including itself)
    const descendants = await tx.divisionClosure.findMany({
      where: {
        ancestorId: divisionId,
      },
    });

    const descendantIds = descendants.map((d: any) => d.descendantId);

    // Remove all old ancestor paths for this division and its descendants
    // (except self-referencing paths with depth=0)
    await tx.divisionClosure.deleteMany({
      where: {
        descendantId: { in: descendantIds },
        depth: { gt: 0 },
        ancestorId: { not: { in: descendantIds } },
      },
    });

    // If new parent exists, rebuild paths
    if (newParentId) {
      // Get all ancestors of new parent (including parent itself)
      const newParentPaths = await tx.divisionClosure.findMany({
        where: {
          descendantId: newParentId,
        },
      });

      // For each descendant, create paths to all new ancestors
      for (const descendant of descendants) {
        for (const ancestorPath of newParentPaths) {
          await tx.divisionClosure.create({
            data: {
              ancestorId: ancestorPath.ancestorId,
              descendantId: descendant.descendantId,
              depth: ancestorPath.depth + 1 + descendant.depth,
            },
          });
        }
      }
    }
  }
}