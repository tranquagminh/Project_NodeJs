import { Request, Response, NextFunction } from 'express';
import { AppError, BusinessRuleError } from '../utils/errors';
import { env } from '../config/env';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof BusinessRuleError) {
    return res.status(422).json({
      success: false,
      error: {
        code: err.ruleCode,
        message: err.message,
        details: err.details,
      },
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  console.error('Unhandled error:', err);

  return res.status(500).json({
    success: false,
    message: env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
  });
}
