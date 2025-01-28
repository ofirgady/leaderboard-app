import { Request, Response, NextFunction } from 'express';
import { loggerService } from '../services/logger.service';

// This middleware will record and log each incoming request to the server.

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
	const { method, url, body, query } = req;

	// Log basic request details
	loggerService.info('Incoming request', {
		method,
		url,
		query,
		...(Object.keys(body).length > 0 && { body }), // Log body only if not empty
	});

	next();
};
