import { body, ValidationChain } from 'express-validator';
import { CompanyBusinessType, SubscriptionPlanType, SubscriptionStatusType, BillingCycleType } from '@prisma/client';

export const createCompanyValidationRules = (): ValidationChain[] => {
  return [
    body('businessName')
      .trim()
      .notEmpty()
      .withMessage('Business name is required')
      .isLength({ min: 2, max: 255 })
      .withMessage('Business name must be between 2 and 255 characters'),

    body('businessType')
      .optional()
      .isIn(Object.values(CompanyBusinessType))
      .withMessage('Invalid business type'),

    body('email')
      .optional()
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail()
      .isLength({ max: 255 })
      .withMessage('Email must not exceed 255 characters'),

    body('phone')
      .optional()
      .matches(/^\+?[\d\s\-\(\)]+$/)
      .withMessage('Invalid phone number format')
      .isLength({ max: 20 })
      .withMessage('Phone number must not exceed 20 characters'),

    body('website')
      .optional()
      .isURL({ require_protocol: false })
      .withMessage('Invalid website URL format')
      .isLength({ max: 255 })
      .withMessage('Website URL must not exceed 255 characters'),

    body('address')
      .optional()
      .isObject()
      .withMessage('Address must be an object'),

    body('address.street')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Street address is required when address is provided')
      .isLength({ max: 255 })
      .withMessage('Street address must not exceed 255 characters'),

    body('address.city')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('City is required when address is provided')
      .isLength({ max: 100 })
      .withMessage('City must not exceed 100 characters'),

    body('address.state')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('State is required when address is provided')
      .isLength({ min: 2, max: 50 })
      .withMessage('State must be between 2 and 50 characters'),

    body('address.zip')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('ZIP code is required when address is provided')
      .matches(/^[A-Za-z0-9\s\-]{3,12}$/)
      .withMessage('Invalid ZIP code format'),

    body('address.country')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Country is required when address is provided')
      .isLength({ min: 2, max: 2 })
      .withMessage('Country must be a 2-letter country code'),

    body('subscriptionPlan')
      .optional()
      .isIn(Object.values(SubscriptionPlanType))
      .withMessage('Invalid subscription plan'),

    body('billingCycle')
      .optional()
      .isIn(Object.values(BillingCycleType))
      .withMessage('Invalid billing cycle'),
  ];
};

export const updateCompanyValidationRules = (): ValidationChain[] => {
  return [
    body('businessName')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Business name cannot be empty')
      .isLength({ min: 2, max: 255 })
      .withMessage('Business name must be between 2 and 255 characters'),

    body('businessType')
      .optional()
      .isIn(Object.values(CompanyBusinessType))
      .withMessage('Invalid business type'),

    body('email')
      .optional()
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail()
      .isLength({ max: 255 })
      .withMessage('Email must not exceed 255 characters'),

    body('phone')
      .optional()
      .matches(/^\+?[\d\s\-\(\)]+$/)
      .withMessage('Invalid phone number format')
      .isLength({ max: 20 })
      .withMessage('Phone number must not exceed 20 characters'),

    body('website')
      .optional()
      .isURL({ require_protocol: false })
      .withMessage('Invalid website URL format')
      .isLength({ max: 255 })
      .withMessage('Website URL must not exceed 255 characters'),

    body('address')
      .optional()
      .isObject()
      .withMessage('Address must be an object'),

    body('address.street')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Street address cannot be empty')
      .isLength({ max: 255 })
      .withMessage('Street address must not exceed 255 characters'),

    body('address.city')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('City cannot be empty')
      .isLength({ max: 100 })
      .withMessage('City must not exceed 100 characters'),

    body('address.state')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('State cannot be empty')
      .isLength({ min: 2, max: 50 })
      .withMessage('State must be between 2 and 50 characters'),

    body('address.zip')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('ZIP code cannot be empty')
      .matches(/^[A-Za-z0-9\s\-]{3,12}$/)
      .withMessage('Invalid ZIP code format'),

    body('address.country')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Country cannot be empty')
      .isLength({ min: 2, max: 2 })
      .withMessage('Country must be a 2-letter country code'),

    body('settings')
      .optional()
      .isObject()
      .withMessage('Settings must be an object'),

    body('timezone')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Timezone cannot be empty')
      .isLength({ max: 50 })
      .withMessage('Timezone must not exceed 50 characters'),

    body('currency')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Currency cannot be empty')
      .isLength({ min: 3, max: 3 })
      .withMessage('Currency must be a 3-letter currency code'),
  ];
};

// Company size validation (matching frontend options)
export const validateCompanySize = (size: string): boolean => {
  const validSizes = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];
  return validSizes.includes(size);
};

export const updateSubscriptionValidationRules = (): ValidationChain[] => {
  return [
    body('subscriptionPlan')
      .optional()
      .isIn(Object.values(SubscriptionPlanType))
      .withMessage('Invalid subscription plan'),

    body('subscriptionStatus')
      .optional()
      .isIn(Object.values(SubscriptionStatusType))
      .withMessage('Invalid subscription status'),

    body('billingCycle')
      .optional()
      .isIn(Object.values(BillingCycleType))
      .withMessage('Invalid billing cycle'),

    body('mrr')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('MRR must be a positive number'),

    body('stripeCustomerId')
      .optional()
      .isString()
      .withMessage('Stripe customer ID must be a string')
      .isLength({ max: 255 })
      .withMessage('Stripe customer ID must not exceed 255 characters'),
  ];
};

export const updateSettingsValidationRules = (): ValidationChain[] => {
  return [
    body('settings')
      .notEmpty()
      .withMessage('Settings are required')
      .isObject()
      .withMessage('Settings must be an object'),
  ];
};
