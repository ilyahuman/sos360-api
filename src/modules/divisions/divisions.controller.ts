import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { logger } from '@/shared/utils/logger';
import { AuthenticatedRequest } from '@/api/types/requests.types';
import { DivisionService } from './divisions.service';
import {
  CreateDivisionRequest,
  UpdateDivisionRequest,
  EntityReassignmentRequest,
  BulkReassignmentRequest,
} from './divisions.types';

export class DivisionController {
  constructor(private divisionService: DivisionService) {}
  /*
   * I think I need some kina 'AuthenticatedRequest' for many modules controllers that require to be authenticated in CRM.
   * Maybe I can use it in all controllers that require to be authenticated in CRM.
   * Also maybe I need some 'AuthenticatedResponse', what do you think?
   * */
  createDivision = async (req: Request, res: Response): Promise<void> => {
    if (!this.handleValidationErrors(req, res)) return;

    const createData: CreateDivisionRequest = req.body;
    const { companyId, id: userId } = req.user!;

    logger.info('Creating new division', {
      companyId,
      divisionName: createData.name,
      divisionType: createData.divisionType,
      createdBy: userId,
    });

    try {
      const division = await this.divisionService.createDivision(companyId, createData, userId);
      this.sendSuccessResponse(res, 'Division created successfully', division, 201);
    } catch (error) {
      logger.error('Error creating division', error);
      this.sendErrorResponse(res, error, 'Failed to create division');
    }
  };

  private handleValidationErrors(req: AuthenticatedRequest, res: Response): boolean {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
      return false;
    }
    return true;
  }

  private sendSuccessResponse(
    res: Response,
    message: string,
    data: any,
    statusCode: number = 200
  ): void {
    res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  private sendErrorResponse(
    res: Response,
    error: unknown,
    defaultMessage: string,
    statusCode: number = 500
  ): void {
    res.status(statusCode).json({
      success: false,
      message: error instanceof Error ? error.message : defaultMessage,
    });
  }

  getDivisions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { companyId } = req.user!;

    try {
      const divisions = await this.divisionService.getDivisionsByCompany(companyId);

      res.status(200).json({
        success: true,
        message: 'Divisions retrieved successfully',
        data: divisions,
      });
    } catch (error) {
      logger.error('Error getting divisions', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve divisions',
      });
    }
  };

  getDivisionById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Division ID is required',
      });
      return;
    }

    try {
      const division = await this.divisionService.getDivisionById(id);

      if (!division) {
        res.status(404).json({
          success: false,
          message: 'Division not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Division retrieved successfully',
        data: division,
      });
    } catch (error) {
      logger.error('Error getting division by ID', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve division',
      });
    }
  };

  getDivisionHierarchy = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { companyId } = req.user!;

    try {
      const hierarchy = await this.divisionService.getDivisionHierarchy(companyId);

      res.status(200).json({
        success: true,
        message: 'Division hierarchy retrieved successfully',
        data: hierarchy,
      });
    } catch (error) {
      logger.error('Error getting division hierarchy', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve division hierarchy',
      });
    }
  };

  updateDivision = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
    const updateData: UpdateDivisionRequest = req.body;
    const { id: userId } = req.user!;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Division ID is required',
      });
      return;
    }

    try {
      const division = await this.divisionService.updateDivision(id, updateData, userId);

      if (!division) {
        res.status(404).json({
          success: false,
          message: 'Division not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Division updated successfully',
        data: division,
      });
    } catch (error) {
      logger.error('Error updating division', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update division',
      });
    }
  };

  deleteDivision = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { id: userId } = req.user!;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Division ID is required',
      });
      return;
    }

    try {
      const success = await this.divisionService.deleteDivision(id, userId);

      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Division not found or could not be deleted',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Division deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting division', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete division',
      });
    }
  };

  getDivisionStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Division ID is required',
      });
      return;
    }

    try {
      const stats = await this.divisionService.getDivisionStats(id);

      if (!stats) {
        res.status(404).json({
          success: false,
          message: 'Division not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Division statistics retrieved successfully',
        data: stats,
      });
    } catch (error) {
      logger.error('Error getting division stats', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve division statistics',
      });
    }
  };

  reassignEntity = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
      return;
    }

    const request: EntityReassignmentRequest = req.body;
    const { id: userId } = req.user!;

    try {
      const result = await this.divisionService.reassignEntity(request, userId);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: result.message,
          data: result,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      logger.error('Error reassigning entity', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reassign entity',
      });
    }
  };

  bulkReassignEntities = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
      return;
    }

    const bulkRequest: BulkReassignmentRequest = req.body;
    const { id: userId } = req.user!;

    try {
      const result = await this.divisionService.bulkReassignEntities(bulkRequest, userId);

      res.status(200).json({
        success: true,
        message: `Bulk reassignment completed. ${result.successCount} successful, ${result.failureCount} failed.`,
        data: result,
      });
    } catch (error) {
      logger.error('Error in bulk reassignment', error);
      res.status(500).json({
        success: false,
        message: 'Failed to perform bulk reassignment',
      });
    }
  };
}
