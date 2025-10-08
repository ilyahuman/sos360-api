/**
 * Property Controller
 * HTTP request/response handlers
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { logger } from '@/shared/utils/logger';
import { PropertyService } from './properties.service';
import { CreatePropertyRequest, UpdatePropertyRequest } from './properties.types';

export class PropertyController {
  constructor(private propertyService: PropertyService) {}

  // TODO(!!!): Replace placeholder IDs with actual authenticated user/company when User/Auth module is implemented

  list = async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
      return;
    }

    // TODO(!!!): Get companyId from authenticated request when User/Auth module is implemented
    const companyId =
      (req.headers['x-company-id'] as string) || '61aebdca-4e43-475e-97f7-38567973efad';

    const filters = {
      propertyType: req.query.propertyType as any,
      divisionId: req.query.divisionId as string,
      primaryContactId: req.query.primaryContactId as string,
      search: req.query.search as string,
    };

    const pagination = {
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      sortBy: (req.query.sortBy as string) || 'createdAt',
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
    };

    try {
      const result = await this.propertyService.getAllProperties(companyId, filters, pagination);

      res.json({
        success: true,
        message: 'Properties retrieved successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Error listing properties', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  get = async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
      return;
    }

    const propertyId = req.params.id!;
    // TODO(!!!): Get companyId from authenticated request when User/Auth module is implemented
    const companyId =
      (req.headers['x-company-id'] as string) || '61aebdca-4e43-475e-97f7-38567973efad';

    try {
      const property = await this.propertyService.getPropertyById(propertyId, companyId);

      if (!property) {
        res.status(404).json({
          success: false,
          message: 'Property not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Property retrieved successfully',
        data: property,
      });
    } catch (error) {
      logger.error('Error getting property', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  getByContact = async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
      return;
    }

    const contactId = req.params.contactId!;
    // TODO(!!!): Get companyId from authenticated request when User/Auth module is implemented
    const companyId =
      (req.headers['x-company-id'] as string) || '61aebdca-4e43-475e-97f7-38567973efad';

    try {
      const properties = await this.propertyService.getPropertiesByContact(contactId, companyId);

      res.json({
        success: true,
        message: 'Properties retrieved successfully',
        data: properties,
      });
    } catch (error) {
      logger.error('Error getting properties by contact', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  getByDivision = async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
      return;
    }

    const divisionId = req.params.divisionId!;
    // TODO(!!!): Get companyId from authenticated request when User/Auth module is implemented
    const companyId =
      (req.headers['x-company-id'] as string) || '61aebdca-4e43-475e-97f7-38567973efad';

    try {
      const properties = await this.propertyService.getPropertiesByDivision(divisionId, companyId);

      res.json({
        success: true,
        message: 'Properties retrieved successfully',
        data: properties,
      });
    } catch (error) {
      logger.error('Error getting properties by division', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  searchByLocation = async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
      return;
    }

    const latitude = parseFloat(req.query.latitude as string);
    const longitude = parseFloat(req.query.longitude as string);
    const radius = req.query.radius ? parseFloat(req.query.radius as string) : 10;
    // TODO(!!!): Get companyId from authenticated request when User/Auth module is implemented
    const companyId =
      (req.headers['x-company-id'] as string) || '61aebdca-4e43-475e-97f7-38567973efad';

    try {
      const properties = await this.propertyService.searchPropertiesByLocation(
        latitude,
        longitude,
        radius,
        companyId
      );

      res.json({
        success: true,
        message: 'Properties retrieved successfully',
        data: properties,
      });
    } catch (error) {
      logger.error('Error searching properties by location', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
      return;
    }

    const createData: CreatePropertyRequest = req.body;
    // TODO(!!!): Get userId and companyId from authenticated request when User/Auth module is implemented
    const userId = '025c88e6-7a0a-4aac-91a2-6ee03c2abbae'; // System placeholder user
    const companyId =
      (req.headers['x-company-id'] as string) || '61aebdca-4e43-475e-97f7-38567973efad';

    logger.info('Creating new property', {
      companyId,
      propertyType: createData.propertyType,
    });

    try {
      const property = await this.propertyService.createProperty(createData, userId, companyId);

      logger.info('Property created successfully', {
        propertyId: property.id,
        companyId,
      });

      res.status(201).json({
        success: true,
        message: 'Property created successfully',
        data: property,
      });
    } catch (error) {
      logger.error('Error creating property', error);

      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
        });
      }
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
      return;
    }

    const propertyId = req.params.id!;
    const updateData: UpdatePropertyRequest = req.body;
    // TODO(!!!): Get userId and companyId from authenticated request when User/Auth module is implemented
    const userId = '025c88e6-7a0a-4aac-91a2-6ee03c2abbae'; // System placeholder user
    const companyId =
      (req.headers['x-company-id'] as string) || '61aebdca-4e43-475e-97f7-38567973efad';

    logger.info('Updating property', {
      propertyId,
      companyId,
      updates: Object.keys(req.body),
    });

    try {
      const property = await this.propertyService.updateProperty(
        propertyId,
        updateData,
        userId,
        companyId
      );

      if (!property) {
        res.status(404).json({
          success: false,
          message: 'Property not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Property updated successfully',
        data: property,
      });
    } catch (error) {
      logger.error('Error updating property', error);

      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
        });
      }
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    const propertyId = req.params.id!;
    // TODO: Get userId and companyId from authenticated request
    const userId = (req.headers['x-user-id'] as string) || 'system';
    const companyId = (req.headers['x-company-id'] as string) || 'test-company-id';

    logger.info('Deleting property', {
      propertyId,
      companyId,
    });

    try {
      const success = await this.propertyService.deleteProperty(propertyId, userId, companyId);

      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Property not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Property deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting property', error);

      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
        });
      }
    }
  };

  restore = async (req: Request, res: Response): Promise<void> => {
    const propertyId = req.params.id!;
    // TODO(!!!): Get companyId from authenticated request when User/Auth module is implemented
    const companyId =
      (req.headers['x-company-id'] as string) || '61aebdca-4e43-475e-97f7-38567973efad';

    logger.info('Restoring property', {
      propertyId,
      companyId,
    });

    try {
      const property = await this.propertyService.restoreProperty(propertyId, companyId);

      if (!property) {
        res.status(404).json({
          success: false,
          message: 'Property not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Property restored successfully',
        data: property,
      });
    } catch (error) {
      logger.error('Error restoring property', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  getStats = async (req: Request, res: Response): Promise<void> => {
    // TODO(!!!): Get companyId from authenticated request when User/Auth module is implemented
    const companyId =
      (req.headers['x-company-id'] as string) || '61aebdca-4e43-475e-97f7-38567973efad';
    const divisionId = req.query.divisionId as string | undefined;

    try {
      const stats = await this.propertyService.getPropertyStats(companyId, divisionId);

      res.json({
        success: true,
        message: 'Property statistics retrieved successfully',
        data: stats,
      });
    } catch (error) {
      logger.error('Error getting property stats', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  assignDivision = async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
      return;
    }

    const propertyId = req.params.id!;
    const { divisionId } = req.body;
    // TODO: Get userId and companyId from authenticated request
    const userId = (req.headers['x-user-id'] as string) || 'system';
    const companyId = (req.headers['x-company-id'] as string) || 'test-company-id';

    logger.info('Assigning property to division', {
      propertyId,
      divisionId,
      companyId,
    });

    try {
      const property = await this.propertyService.assignPropertyToDivision(
        propertyId,
        divisionId,
        userId,
        companyId
      );

      if (!property) {
        res.status(404).json({
          success: false,
          message: 'Property not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Property assigned to division successfully',
        data: property,
      });
    } catch (error) {
      logger.error('Error assigning property to division', error);

      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
        });
      }
    }
  };
}
