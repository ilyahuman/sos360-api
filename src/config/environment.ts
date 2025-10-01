/**
 * Environment Configuration Manager
 * Centralizes all environment variable validation and configuration using Zod
 */

import dotenv from 'dotenv';
import { z } from 'zod';
import { logger } from '@/shared/utils/logger';

// Load environment-specific file based on NODE_ENV
const envFile =
  process.env.NODE_ENV === 'production'
    ? '.env.production.local'
    : process.env.NODE_ENV === 'staging'
      ? '.env.staging'
      : '.env';

dotenv.config({ path: envFile });

// Helper functions for Zod transformations
const stringToNumber = z.string().transform(val => {
  const parsed = parseInt(val, 10);
  if (isNaN(parsed)) {
    throw new Error(`Invalid number: ${val}`);
  }
  return parsed;
});

const stringToBoolean = z.string().transform(val => {
  const lower = val.toLowerCase();
  if (lower === 'true') return true;
  if (lower === 'false') return false;
  throw new Error(`Invalid boolean: ${val}`);
});

const stringToArray = z.string().transform(val => {
  return val
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
});

// Define environment schema with Zod
const environmentSchema = z
  .object({
    // Application
    NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
    PORT: z.union([z.number(), stringToNumber]).default(3000),
    API_VERSION: z.string().default('v1'),
    APP_NAME: z.string().default('SOS360-API'),

    // Database
    DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
    DATABASE_SCHEMA: z.string().default('public'),

    // Security & Authentication
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_EXPIRES_IN: z.string().default('7d'),
    JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
    BCRYPT_ROUNDS: z
      .union([z.number(), stringToNumber])
      .refine(val => val >= 10 && val <= 15, 'BCRYPT_ROUNDS must be between 10 and 15')
      .default(12),
    COOKIE_SECRET: z.string().min(32, 'COOKIE_SECRET must be at least 32 characters'),

    // Firebase (optional - for authentication)
    FIREBASE_PROJECT_ID: z.string().optional(),
    FIREBASE_PRIVATE_KEY_ID: z.string().optional(),
    FIREBASE_PRIVATE_KEY: z.string().optional(),
    FIREBASE_CLIENT_EMAIL: z
      .string()
      .email('FIREBASE_CLIENT_EMAIL must be a valid email')
      .or(z.literal(''))
      .optional(),
    FIREBASE_CLIENT_ID: z.string().optional(),
    FIREBASE_AUTH_URI: z
      .string()
      .url('FIREBASE_AUTH_URI must be a valid URL')
      .or(z.literal(''))
      .optional(),
    FIREBASE_TOKEN_URI: z
      .string()
      .url('FIREBASE_TOKEN_URI must be a valid URL')
      .or(z.literal(''))
      .optional(),
    FIREBASE_AUTH_PROVIDER_CERT_URL: z
      .string()
      .url('FIREBASE_AUTH_PROVIDER_CERT_URL must be a valid URL')
      .or(z.literal(''))
      .optional(),

    // Stripe (optional - for payments)
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    STRIPE_PUBLISHABLE_KEY: z.string().optional(),

    // Email (optional - for notifications)
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z
      .union([z.number(), stringToNumber])
      .refine(val => val >= 1 && val <= 65535, 'SMTP_PORT must be between 1 and 65535')
      .default(587),
    SMTP_SECURE: z.union([z.boolean(), stringToBoolean]).default(false),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    EMAIL_FROM: z.string().email('EMAIL_FROM must be a valid email').or(z.literal('')).optional(),

    // File Upload
    MAX_FILE_SIZE: z
      .union([z.number(), stringToNumber])
      .refine(val => val <= 100 * 1024 * 1024, 'MAX_FILE_SIZE should not exceed 100MB')
      .default(10485760), // 10MB
    UPLOAD_PATH: z.string().default('uploads'),
    ALLOWED_FILE_TYPES: z
      .union([z.array(z.string()), stringToArray])
      .default(['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx']),

    // External APIs (optional - for integrations)
    SPOTONSITE_API_KEY: z.string().optional(),
    SPOTONSITE_API_URL: z
      .string()
      .url('SPOTONSITE_API_URL must be a valid URL')
      .or(z.literal(''))
      .optional(),

    // Redis (optional - for caching)
    REDIS_URL: z.string().url('REDIS_URL must be a valid URL').or(z.literal('')).optional(),
    REDIS_PASSWORD: z.string().optional(),

    // Logging
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug', 'verbose']).default('info'),
    LOG_MAX_FILES: z.string().default('14d'),
    LOG_MAX_SIZE: z.string().default('20m'),

    // CORS
    CORS_ORIGIN: z.union([z.array(z.string()), stringToArray]).default(['http://localhost:3000']),
    CORS_METHODS: z
      .union([z.array(z.string()), stringToArray])
      .default(['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS']),
    CORS_CREDENTIALS: z.union([z.boolean(), stringToBoolean]).default(true),

    // Health Check
    HEALTH_CHECK_ENABLED: z.union([z.boolean(), stringToBoolean]).default(true),
    HEALTH_CHECK_PATH: z.string().default('/health'),

    // API Documentation
    SWAGGER_ENABLED: z.union([z.boolean(), stringToBoolean]).optional(),
    SWAGGER_PATH: z.string().default('/api-docs'),
  })
  .superRefine((data, ctx) => {
    // Custom validation: JWT secrets must be different
    if (data.JWT_SECRET === data.JWT_REFRESH_SECRET) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'JWT_SECRET and JWT_REFRESH_SECRET must be different',
        path: ['JWT_REFRESH_SECRET'],
      });
    }

    // Set SWAGGER_ENABLED default based on NODE_ENV if not provided
    if (data.SWAGGER_ENABLED === undefined) {
      data.SWAGGER_ENABLED = data.NODE_ENV !== 'production';
    }

    // Production-specific validations
    if (data.NODE_ENV === 'production') {
      const productionSecrets = [
        { key: 'JWT_SECRET', value: data.JWT_SECRET },
        { key: 'JWT_REFRESH_SECRET', value: data.JWT_REFRESH_SECRET },
        { key: 'COOKIE_SECRET', value: data.COOKIE_SECRET },
      ];

      for (const secret of productionSecrets) {
        if (secret.value.length < 64) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${secret.key} must be at least 64 characters in production`,
            path: [secret.key],
          });
        }
      }
    }
  });

export type EnvironmentConfig = z.infer<typeof environmentSchema>;

/**
 * Environment Configuration Validator
 * Uses Zod for robust environment variable validation
 */
class EnvironmentValidator {
  private config: EnvironmentConfig;

  constructor() {
    this.config = this.validateAndParse();
  }

  private validateAndParse(): EnvironmentConfig {
    try {
      // Parse and validate environment variables using Zod schema
      const parsed = environmentSchema.parse(process.env);

      // Additional warnings for development
      if (parsed.MAX_FILE_SIZE > 100 * 1024 * 1024) {
        logger.warn('MAX_FILE_SIZE is set very high (>100MB), consider reducing for security');
      }

      logger.info(`Environment validated successfully for ${parsed.NODE_ENV} mode`);

      return parsed;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.issues
          .map((err: z.ZodIssue) => {
            const path = err.path.join('.');
            return `${path}: ${err.message}`;
          })
          .join('\n');

        logger.error('Environment validation failed:', errorMessages);
        throw new Error(`Environment validation failed:\n${errorMessages}`);
      }

      logger.error('Unexpected error during environment validation:', error);
      throw error;
    }
  }

  public getConfig(): EnvironmentConfig {
    return this.config;
  }

  /**
   * Get a specific configuration value
   */
  public get<K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K] {
    return this.config[key];
  }

  /**
   * Check if running in development mode
   */
  public isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }

  /**
   * Check if running in production mode
   */
  public isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }

  /**
   * Check if running in staging mode
   */
  public isStaging(): boolean {
    return this.config.NODE_ENV === 'staging';
  }
}

// Create and export singleton instance
const environmentValidator = new EnvironmentValidator();
export const config = environmentValidator.getConfig();

// Export the validator instance for direct access to methods
export const env = environmentValidator;

// Export individual configurations for convenience
export const {
  NODE_ENV,
  PORT,
  API_VERSION,
  APP_NAME,
  DATABASE_URL,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  CORS_ORIGIN,
  LOG_LEVEL,
} = config;

// Runtime environment helpers
export const isDevelopment = environmentValidator.isDevelopment();
export const isProduction = environmentValidator.isProduction();
export const isStaging = environmentValidator.isStaging();

export default config;
