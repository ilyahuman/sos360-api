/**
 * Property Validation Rules
 * Input validation using express-validator
 */

import { body, param, query, ValidationChain } from 'express-validator';
import { PropertyTypeEnum } from '@prisma/client';

/**
 * Validation rules for creating a property
 */
export function createPropertyValidationRules(): ValidationChain[] {
  return [
    body('name')
      .optional({ nullable: true })
      .isString()
      .withMessage('Name must be a string')
      .isLength({ max: 255 })
      .withMessage('Name cannot exceed 255 characters'),

    body('propertyType')
      .notEmpty()
      .withMessage('Property type is required')
      .isIn(Object.values(PropertyTypeEnum))
      .withMessage('Invalid property type'),

    body('address')
      .notEmpty()
      .withMessage('Address is required')
      .isObject()
      .withMessage('Address must be a valid object'),

    body('address.street')
      .notEmpty()
      .withMessage('Street address is required'),

    body('address.city')
      .notEmpty()
      .withMessage('City is required'),

    body('address.state')
      .notEmpty()
      .withMessage('State is required'),

    body('address.zip')
      .notEmpty()
      .withMessage('Zip code is required'),

    body('coordinates')
      .optional({ nullable: true })
      .isString()
      .withMessage('Coordinates must be a string'),

    body('primaryContactId')
      .notEmpty()
      .withMessage('Primary contact is required')
      .isUUID()
      .withMessage('Primary contact ID must be a valid UUID'),

    body('divisionId')
      .optional({ nullable: true })
      .isUUID()
      .withMessage('Division ID must be a valid UUID'),

    body('totalArea')
      .optional({ nullable: true })
      .isFloat({ min: 0 })
      .withMessage('Total area must be a positive number'),

    body('surfaceTypes')
      .optional()
      .isArray()
      .withMessage('Surface types must be an array'),

    body('parkingSpacesCount')
      .optional({ nullable: true })
      .isInt({ min: 0 })
      .withMessage('Parking spaces count must be a non-negative integer'),

    body('accessRestrictions')
      .optional({ nullable: true })
      .isString()
      .withMessage('Access restrictions must be a string'),

    body('specialRequirements')
      .optional({ nullable: true })
      .isString()
      .withMessage('Special requirements must be a string'),

    body('photos')
      .optional()
      .isArray()
      .withMessage('Photos must be an array'),

    body('sitePlans')
      .optional()
      .isArray()
      .withMessage('Site plans must be an array'),

    body('spotonSiteProjectId')
      .optional({ nullable: true })
      .isString()
      .isLength({ max: 100 })
      .withMessage('SpotOnSite project ID cannot exceed 100 characters'),

    body('autoSpotonSiteCreation')
      .optional()
      .isBoolean()
      .withMessage('Auto SpotOnSite creation must be a boolean'),

    body('mappingMethodPreference')
      .optional({ nullable: true })
      .isString()
      .isLength({ max: 50 })
      .withMessage('Mapping method preference cannot exceed 50 characters'),

    body('takeoffProgramPreference')
      .optional({ nullable: true })
      .isString()
      .isLength({ max: 50 })
      .withMessage('Takeoff program preference cannot exceed 50 characters'),

    body('notes')
      .optional({ nullable: true })
      .isString()
      .withMessage('Notes must be a string'),

    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),

    body('customFields')
      .optional()
      .isObject()
      .withMessage('Custom fields must be an object'),
  ];
}

/**
 * Validation rules for updating a property
 */
export function updatePropertyValidationRules(): ValidationChain[] {
  return [
    param('id')
      .isUUID()
      .withMessage('Property ID must be a valid UUID'),

    body('name')
      .optional({ nullable: true })
      .isString()
      .withMessage('Name must be a string')
      .isLength({ max: 255 })
      .withMessage('Name cannot exceed 255 characters'),

    body('propertyType')
      .optional()
      .isIn(Object.values(PropertyTypeEnum))
      .withMessage('Invalid property type'),

    body('address')
      .optional()
      .isObject()
      .withMessage('Address must be a valid object'),

    body('coordinates')
      .optional({ nullable: true })
      .isString()
      .withMessage('Coordinates must be a string'),

    body('primaryContactId')
      .optional()
      .isUUID()
      .withMessage('Primary contact ID must be a valid UUID'),

    body('divisionId')
      .optional({ nullable: true })
      .isUUID()
      .withMessage('Division ID must be a valid UUID'),

    body('totalArea')
      .optional({ nullable: true })
      .isFloat({ min: 0 })
      .withMessage('Total area must be a positive number'),

    body('surfaceTypes')
      .optional()
      .isArray()
      .withMessage('Surface types must be an array'),

    body('parkingSpacesCount')
      .optional({ nullable: true })
      .isInt({ min: 0 })
      .withMessage('Parking spaces count must be a non-negative integer'),

    body('accessRestrictions')
      .optional({ nullable: true })
      .isString()
      .withMessage('Access restrictions must be a string'),

    body('specialRequirements')
      .optional({ nullable: true })
      .isString()
      .withMessage('Special requirements must be a string'),

    body('photos')
      .optional()
      .isArray()
      .withMessage('Photos must be an array'),

    body('sitePlans')
      .optional()
      .isArray()
      .withMessage('Site plans must be an array'),

    body('spotonSiteProjectId')
      .optional({ nullable: true })
      .isString()
      .isLength({ max: 100 })
      .withMessage('SpotOnSite project ID cannot exceed 100 characters'),

    body('autoSpotonSiteCreation')
      .optional()
      .isBoolean()
      .withMessage('Auto SpotOnSite creation must be a boolean'),

    body('mappingMethodPreference')
      .optional({ nullable: true })
      .isString()
      .isLength({ max: 50 })
      .withMessage('Mapping method preference cannot exceed 50 characters'),

    body('takeoffProgramPreference')
      .optional({ nullable: true })
      .isString()
      .isLength({ max: 50 })
      .withMessage('Takeoff program preference cannot exceed 50 characters'),

    body('notes')
      .optional({ nullable: true })
      .isString()
      .withMessage('Notes must be a string'),

    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),

    body('customFields')
      .optional()
      .isObject()
      .withMessage('Custom fields must be an object'),
  ];
}

/**
 * Validation rules for assigning property to division
 */
export function assignDivisionValidationRules(): ValidationChain[] {
  return [
    param('id')
      .isUUID()
      .withMessage('Property ID must be a valid UUID'),

    body('divisionId')
      .notEmpty()
      .withMessage('Division ID is required')
      .isUUID()
      .withMessage('Division ID must be a valid UUID'),
  ];
}

/**
 * Validation rules for property list filters
 */
export function listPropertiesValidationRules(): ValidationChain[] {
  return [
    query('propertyType')
      .optional()
      .isIn(Object.values(PropertyTypeEnum))
      .withMessage('Invalid property type'),

    query('divisionId')
      .optional()
      .isUUID()
      .withMessage('Division ID must be a valid UUID'),

    query('primaryContactId')
      .optional()
      .isUUID()
      .withMessage('Primary contact ID must be a valid UUID'),

    query('search')
      .optional()
      .isString()
      .withMessage('Search must be a string')
      .isLength({ min: 2 })
      .withMessage('Search must be at least 2 characters'),

    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),

    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),

    query('sortBy')
      .optional()
      .isString()
      .withMessage('Sort by must be a string'),

    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be asc or desc'),
  ];
}

/**
 * Validation rules for location search
 */
export function searchByLocationValidationRules(): ValidationChain[] {
  return [
    query('lat')
      .notEmpty()
      .withMessage('Latitude is required')
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitude must be between -90 and 90'),

    query('lng')
      .notEmpty()
      .withMessage('Longitude is required')
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitude must be between -180 and 180'),

    query('radius')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Radius must be a positive number'),
  ];
}

/**
 * Validation rules for getting a single property
 */
export function getPropertyValidationRules(): ValidationChain[] {
  return [
    param('id')
      .isUUID()
      .withMessage('Property ID must be a valid UUID'),
  ];
}

/**
 * Validation rules for getting properties by contact
 */
export function getPropertiesByContactValidationRules(): ValidationChain[] {
  return [
    param('contactId')
      .isUUID()
      .withMessage('Contact ID must be a valid UUID'),
  ];
}

/**
 * Validation rules for getting properties by division
 */
export function getPropertiesByDivisionValidationRules(): ValidationChain[] {
  return [
    param('divisionId')
      .isUUID()
      .withMessage('Division ID must be a valid UUID'),
  ];
}