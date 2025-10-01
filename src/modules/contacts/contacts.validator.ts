import { body, ValidationChain } from 'express-validator';
import {
  ContactTypeEnum,
  LeadSourceEnum,
  LeadStatusEnum,
  ContactMethodEnum,
  LeadTypeClassificationEnum,
  LeadNoteStyleEnum,
} from '@prisma/client';

export const createContactValidationRules = (): ValidationChain[] => {
  return [
    // Required fields
    body('firstName')
      .trim()
      .notEmpty()
      .withMessage('First name is required')
      .isLength({ min: 1, max: 100 })
      .withMessage('First name must be between 1 and 100 characters'),

    body('lastName')
      .trim()
      .notEmpty()
      .withMessage('Last name is required')
      .isLength({ min: 1, max: 100 })
      .withMessage('Last name must be between 1 and 100 characters'),

    // Optional personal information
    body('email')
      .optional({ nullable: true })
      .trim()
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail()
      .isLength({ max: 255 })
      .withMessage('Email must not exceed 255 characters'),

    body('phone')
      .optional({ nullable: true })
      .trim()
      .matches(/^\+?[\d\s\-\(\)\.]+$/)
      .withMessage('Invalid phone number format')
      .isLength({ max: 20 })
      .withMessage('Phone number must not exceed 20 characters'),

    body('jobTitle')
      .optional({ nullable: true })
      .trim()
      .isLength({ max: 150 })
      .withMessage('Job title must not exceed 150 characters'),

    body('companyName')
      .optional({ nullable: true })
      .trim()
      .isLength({ max: 255 })
      .withMessage('Company name must not exceed 255 characters'),

    // Classification
    body('contactType')
      .optional()
      .isIn(Object.values(ContactTypeEnum))
      .withMessage('Invalid contact type'),

    body('leadSource')
      .optional()
      .isIn(Object.values(LeadSourceEnum))
      .withMessage('Invalid lead source'),

    body('leadStatus')
      .optional()
      .isIn(Object.values(LeadStatusEnum))
      .withMessage('Invalid lead status'),

    // Lead Type Classification
    body('leadTypeClassification')
      .optional({ nullable: true })
      .isIn(Object.values(LeadTypeClassificationEnum))
      .withMessage('Invalid lead type classification'),

    body('leadColorCode')
      .optional({ nullable: true })
      .matches(/^#[0-9A-Fa-f]{6}$/)
      .withMessage('Lead color code must be a valid hex color'),

    body('leadNoteStyle')
      .optional({ nullable: true })
      .isIn(Object.values(LeadNoteStyleEnum))
      .withMessage('Invalid lead note style'),

    body('qualificationRequired')
      .optional()
      .isBoolean()
      .withMessage('Qualification required must be a boolean'),

    // Communication preferences
    body('preferredContactMethod')
      .optional()
      .isIn(Object.values(ContactMethodEnum))
      .withMessage('Invalid contact method'),

    // Additional fields
    body('notes')
      .optional({ nullable: true })
      .isString()
      .withMessage('Notes must be a string'),

    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),

    body('servicePreferences')
      .optional()
      .isArray()
      .withMessage('Service preferences must be an array'),

    body('address')
      .optional({ nullable: true })
      .isObject()
      .withMessage('Address must be an object'),

    body('customFields')
      .optional()
      .isObject()
      .withMessage('Custom fields must be an object'),

    body('communicationPreferences')
      .optional()
      .isObject()
      .withMessage('Communication preferences must be an object'),

    // Division assignment
    body('divisionId')
      .optional({ nullable: true })
      .isUUID()
      .withMessage('Invalid division ID'),

    // Assignment
    body('assignedUserId')
      .optional({ nullable: true })
      .isUUID()
      .withMessage('Invalid user ID'),
  ];
};

export const updateContactValidationRules = (): ValidationChain[] => {
  return [
    // Personal information (all optional for updates)
    body('firstName')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('First name cannot be empty')
      .isLength({ min: 1, max: 100 })
      .withMessage('First name must be between 1 and 100 characters'),

    body('lastName')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Last name cannot be empty')
      .isLength({ min: 1, max: 100 })
      .withMessage('Last name must be between 1 and 100 characters'),

    body('email')
      .optional({ nullable: true })
      .trim()
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail()
      .isLength({ max: 255 })
      .withMessage('Email must not exceed 255 characters'),

    body('phone')
      .optional({ nullable: true })
      .trim()
      .matches(/^\+?[\d\s\-\(\)\.]+$/)
      .withMessage('Invalid phone number format')
      .isLength({ max: 20 })
      .withMessage('Phone number must not exceed 20 characters'),

    body('jobTitle')
      .optional({ nullable: true })
      .trim()
      .isLength({ max: 150 })
      .withMessage('Job title must not exceed 150 characters'),

    body('companyName')
      .optional({ nullable: true })
      .trim()
      .isLength({ max: 255 })
      .withMessage('Company name must not exceed 255 characters'),

    // Classification
    body('contactType')
      .optional()
      .isIn(Object.values(ContactTypeEnum))
      .withMessage('Invalid contact type'),

    body('leadSource')
      .optional()
      .isIn(Object.values(LeadSourceEnum))
      .withMessage('Invalid lead source'),

    body('leadStatus')
      .optional()
      .isIn(Object.values(LeadStatusEnum))
      .withMessage('Invalid lead status'),

    // Lead Type Classification
    body('leadTypeClassification')
      .optional({ nullable: true })
      .isIn(Object.values(LeadTypeClassificationEnum))
      .withMessage('Invalid lead type classification'),

    body('leadColorCode')
      .optional({ nullable: true })
      .matches(/^#[0-9A-Fa-f]{6}$/)
      .withMessage('Lead color code must be a valid hex color'),

    body('leadNoteStyle')
      .optional({ nullable: true })
      .isIn(Object.values(LeadNoteStyleEnum))
      .withMessage('Invalid lead note style'),

    body('qualificationRequired')
      .optional()
      .isBoolean()
      .withMessage('Qualification required must be a boolean'),

    // Communication preferences
    body('preferredContactMethod')
      .optional()
      .isIn(Object.values(ContactMethodEnum))
      .withMessage('Invalid contact method'),

    // Communication tracking
    body('lastContactDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid date format'),

    body('nextFollowUpDate')
      .optional({ nullable: true })
      .isISO8601()
      .withMessage('Invalid date format'),

    body('followUpCount')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Follow-up count must be a non-negative integer'),

    // Additional fields
    body('notes')
      .optional({ nullable: true })
      .isString()
      .withMessage('Notes must be a string'),

    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),

    body('servicePreferences')
      .optional()
      .isArray()
      .withMessage('Service preferences must be an array'),

    body('address')
      .optional({ nullable: true })
      .isObject()
      .withMessage('Address must be an object'),

    body('customFields')
      .optional()
      .isObject()
      .withMessage('Custom fields must be an object'),

    body('communicationPreferences')
      .optional()
      .isObject()
      .withMessage('Communication preferences must be an object'),

    // Division assignment
    body('divisionId')
      .optional({ nullable: true })
      .isUUID()
      .withMessage('Invalid division ID'),

    // Assignment
    body('assignedUserId')
      .optional({ nullable: true })
      .isUUID()
      .withMessage('Invalid user ID'),

    // Relationship stage
    body('relationshipStage')
      .optional({ nullable: true })
      .isString()
      .isLength({ max: 100 })
      .withMessage('Relationship stage must not exceed 100 characters'),
  ];
};

export const updateLeadStatusValidationRules = (): ValidationChain[] => {
  return [
    body('leadStatus')
      .notEmpty()
      .withMessage('Lead status is required')
      .isIn(Object.values(LeadStatusEnum))
      .withMessage('Invalid lead status'),
  ];
};

export const assignContactValidationRules = (): ValidationChain[] => {
  return [
    body('assignedUserId')
      .optional({ nullable: true })
      .isUUID()
      .withMessage('Invalid user ID'),
  ];
};

export const updateFollowUpValidationRules = (): ValidationChain[] => {
  return [
    body('nextFollowUpDate')
      .optional({ nullable: true })
      .isISO8601()
      .withMessage('Invalid date format'),
  ];
};