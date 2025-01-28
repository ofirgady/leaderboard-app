import { Request, Response, NextFunction } from 'express';
import { loggerService } from '../services/logger.service';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.status || 500;
  const message = err.message || 'Internal server error';

  if (statusCode >= 500) {
    loggerService.error('Server Error', { status: statusCode, message });
  } else {
    loggerService.warn('Client Error', { status: statusCode, message });
  }

  res.status(statusCode).json({
    error: {
      status: statusCode,
      message,
      details: err.details || null,
    },
  });
};