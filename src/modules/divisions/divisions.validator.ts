import { body, param } from 'express-validator';

export const createDivisionValidator = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 150 })
    .withMessage('Division name must be between 1 and 150 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),

  body('divisionType')
    .optional()
    .isIn(['GEOGRAPHIC', 'SERVICE_LINE', 'MARKET_SEGMENT', 'BUSINESS_UNIT', 'OPERATIONAL'])
    .withMessage('Invalid division type'),

  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email format'),

  body('phone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Invalid phone number format'),

  body('divisionManagerId')
    .optional()
    .isUUID()
    .withMessage('Division manager ID must be a valid UUID'),

  body('parentDivisionId')
    .optional()
    .isUUID()
    .withMessage('Parent division ID must be a valid UUID'),

  body('targetRevenue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Target revenue must be a positive number'),

  body('targetMarginPercentage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Target margin percentage must be between 0 and 100'),

  body('colorCode')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Color code must be a valid hex color (e.g., #007bff)'),

  body('address.street')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Street address must be between 1 and 255 characters'),

  body('address.city')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('City must be between 1 and 100 characters'),

  body('address.state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),

  body('address.zip')
    .optional()
    .trim()
    .matches(/^\d{5}(-\d{4})?$/)
    .withMessage('ZIP code must be in format 12345 or 12345-6789'),

  body('address.country')
    .optional()
    .trim()
    .isLength({ min: 2, max: 2 })
    .withMessage('Country must be a 2-character country code'),
];

export const updateDivisionValidator = [
  param('id')
    .isUUID()
    .withMessage('Division ID must be a valid UUID'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 150 })
    .withMessage('Division name must be between 1 and 150 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),

  body('divisionType')
    .optional()
    .isIn(['GEOGRAPHIC', 'SERVICE_LINE', 'MARKET_SEGMENT', 'BUSINESS_UNIT', 'OPERATIONAL'])
    .withMessage('Invalid division type'),

  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email format'),

  body('phone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Invalid phone number format'),

  body('divisionManagerId')
    .optional()
    .isUUID()
    .withMessage('Division manager ID must be a valid UUID'),

  body('parentDivisionId')
    .optional()
    .isUUID()
    .withMessage('Parent division ID must be a valid UUID'),

  body('targetRevenue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Target revenue must be a positive number'),

  body('targetMarginPercentage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Target margin percentage must be between 0 and 100'),

  body('colorCode')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Color code must be a valid hex color (e.g., #007bff)'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
];

export const divisionIdValidator = [
  param('id')
    .isUUID()
    .withMessage('Division ID must be a valid UUID'),
];

export const entityReassignmentValidator = [
  body('entityType')
    .isIn(['user', 'contact', 'property', 'opportunity', 'project'])
    .withMessage('Entity type must be one of: user, contact, property, opportunity, project'),

  body('entityId')
    .isUUID()
    .withMessage('Entity ID must be a valid UUID'),

  body('newDivisionId')
    .optional()
    .isUUID()
    .withMessage('New division ID must be a valid UUID'),
];

export const bulkReassignmentValidator = [
  body('assignments')
    .isArray({ min: 1, max: 100 })
    .withMessage('Assignments must be an array with 1-100 items'),

  body('assignments.*.entityType')
    .isIn(['user', 'contact', 'property', 'opportunity', 'project'])
    .withMessage('Each entity type must be one of: user, contact, property, opportunity, project'),

  body('assignments.*.entityId')
    .isUUID()
    .withMessage('Each entity ID must be a valid UUID'),

  body('assignments.*.newDivisionId')
    .optional()
    .isUUID()
    .withMessage('Each new division ID must be a valid UUID'),
];