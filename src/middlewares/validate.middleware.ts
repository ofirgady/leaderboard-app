import { body, param, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Middleware to handle validation errors
const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation Error', details: errors.array() });
  }
  next();
};

// Validation rules for adding a new user
export const validateAddUser = [
  body('username').isString().notEmpty().isLength({ max: 50 }).withMessage('Invalid username'), // Username must be a non-empty string with a max length of 50
  body('score').isInt({ min: 0 }).withMessage('Score must be a positive integer'), 
  body('img_url').optional().isURL().withMessage('Invalid image URL'), // Image URL is optional but must be a valid URL if provided
  handleValidationErrors,
];

// Validation rules for updating a user's score
export const validateUpdateScore = [
  param('id').isInt({ gt: 0 }).withMessage('User ID must be a positive integer'), 
  body('score').isInt({ min: 0 }).withMessage('Score must be a positive integer'), 
  handleValidationErrors,
];

// Validation rules for getting top users with a limit
export const validateGetTopUsers = [
  param('limit').isInt({ gt: 0 }).withMessage('Limit must be a positive integer'), 
  handleValidationErrors,
];

// Validation rules for getting a user with neighbors
export const validateGetUserWithNeighbors = [
  param('id').isInt({ gt: 0 }).withMessage('User ID must be a positive integer'), 
  handleValidationErrors,
];