import { Router } from 'express';
import {
	addUser,
	updateScore,
	getTopUsers,
	getUserWithNeighbors,
} from '../controllers/user.controller';
import {
	validateAddUser,
	validateUpdateScore,
	validateGetTopUsers,
	validateGetUserWithNeighbors,
} from '../middlewares/validate.middleware';

const router = Router();

/**
 * Route to add a new user.
 * Validation middleware ensures input data is valid before proceeding.
 */
router.post('/addUser', validateAddUser, addUser);

/**
 * Route to update a user's score by ID.
 * Validation middleware ensures the ID and score are valid.
 */
router.put('/updateScore/:id', validateUpdateScore, updateScore);

/**
 * Route to fetch the top N users by score.
 * Validation middleware ensures the limit parameter is valid.
 */
router.get('/getTopUsers/:limit', validateGetTopUsers, getTopUsers);

/**
 * Route to fetch a user and their 5 neighbors by ID.
 * Validation middleware ensures the ID parameter is valid.
 */
router.get('/getUserWithNeighbors/:id', validateGetUserWithNeighbors, getUserWithNeighbors);

export default router;
