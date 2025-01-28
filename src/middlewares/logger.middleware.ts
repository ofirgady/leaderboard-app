import { Request, Response, NextFunction } from 'express';
import { loggerService } from '../services/logger.service';

// This middleware will record and log each incoming request to the server.

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  loggerService.info('Incoming request', {
    method: req.method,
    url: req.url,
    body: req.body,
    query: req.query,
  });
  next();
};