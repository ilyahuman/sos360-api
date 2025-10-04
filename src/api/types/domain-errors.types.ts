/**
 * Domain Error Type Definitions (Final)
 * Custom error classes for domain-specific error handling.
 */

// Base Domain Error
export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends DomainError {
  constructor(
    message: string,
    public readonly field: string,
    details?: Record<string, unknown>
  ) {
    super(message, 'VALIDATION_ERROR', details);
  }
}

export class NotFoundError extends DomainError {
  constructor(entity: string, identifier?: string) {
    const msg = identifier
      ? `${entity} with identifier '${identifier}' not found`
      : `${entity} not found`;
    super(msg, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = 'Authentication is required to access this resource.') {
    super(message, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends DomainError {
  constructor(message = 'You do not have permission to perform this action.') {
    super(message, 'FORBIDDEN');
  }
}

export class ConflictError extends DomainError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'CONFLICT', details);
  }
}
