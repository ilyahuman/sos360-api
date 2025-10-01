/**
 * Domain Error Type Definitions
 * Custom error classes for domain-specific error handling
 */

// Base Domain Error
export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

// Validation Errors
export class ValidationError extends DomainError {
  constructor(
    message: string,
    public readonly field: string,
    details?: Record<string, unknown>
  ) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

// Resource Errors
export class NotFoundError extends DomainError {
  constructor(entity: string, identifier: string) {
    super(`${entity} with identifier '${identifier}' not found`, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

// Authorization Errors
export class UnauthorizedError extends DomainError {
  constructor(message = 'Unauthorized access') {
    super(message, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends DomainError {
  constructor(message = 'Access forbidden') {
    super(message, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

// Business Logic Errors
export class BusinessRuleViolationError extends DomainError {
  constructor(message: string, rule: string, details?: Record<string, unknown>) {
    super(message, 'BUSINESS_RULE_VIOLATION', { rule, ...details });
    this.name = 'BusinessRuleViolationError';
  }
}

export class ConflictError extends DomainError {
  constructor(message: string, conflictType: string, details?: Record<string, unknown>) {
    super(message, 'CONFLICT', { conflictType, ...details });
    this.name = 'ConflictError';
  }
}

// Infrastructure Errors
export class ExternalServiceError extends DomainError {
  constructor(service: string, message: string, details?: Record<string, unknown>) {
    super(`External service '${service}' error: ${message}`, 'EXTERNAL_SERVICE_ERROR', {
      service,
      ...details,
    });
    this.name = 'ExternalServiceError';
  }
}
