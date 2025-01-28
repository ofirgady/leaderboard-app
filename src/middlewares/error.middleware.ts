import { Request, Response, NextFunction } from 'express';
import { loggerService } from '../services/logger.service';


export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
	// Default status code and message
	const statusCode = err.status || 500;
	const message = err.message || 'Internal server error';
	const details = err.details || null;

	// Log the error based on severity
	if (statusCode >= 500) {
		loggerService.error('Server Error', { status: statusCode, message, stack: err.stack });
	} else {
		loggerService.warn('Client Error', { status: statusCode, message });
	}

	// Send JSON error response
	res.status(statusCode).json({
		error: {
			status: statusCode,
			message,
			details,
			timestamp: new Date().toISOString(),
		},
	});
};