export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request') {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not Found') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

/**
 * Thrown when a domain/business rule is violated.
 * Carries a machine-readable `ruleCode` used by the client to render
 * a localised message (e.g. MAX_TENSION_EXCEEDED).
 */
export class BusinessRuleError extends AppError {
  public ruleCode: string;
  public details: Record<string, unknown>;

  constructor(message: string, ruleCode: string, details: Record<string, unknown> = {}) {
    super(message, 422);
    this.ruleCode = ruleCode;
    this.details = details;
  }
}
