import { Request, Response } from 'express';
import { userRepository } from '../repositories/user.repository';
import { loggerService } from '../services/logger.service';

/**
 * Checks if the server is running.
 * @param req - Express request object.
 * @param res - Express response object.
 */
export const checkServerStatus = async (req: Request, res: Response): Promise<void> => {
	try {
		loggerService.info('Checking server status');
		res.status(200).send('Leaderboard API is running!');
		loggerService.info('Server status checked successfully');
	} catch (error: any) {
		loggerService.error('Error checking server status', { error: error.message });
		res.status(500).json({ error: 'Error checking server status' });
	}
};

/**
 * Adds a new user to the database.
 * @param req - Express request object, containing username, score, and optional img_url in the body.
 * @param res - Express response object.
 */
export const addUser = async (req: Request, res: Response): Promise<void> => {
	const { username, score, img_url } = req.body;
	try {
		loggerService.info('Adding a new user', { username, score });
		const user = await userRepository.addUser(username, score, img_url);
		res.status(201).json(user);
		loggerService.info(`User ${username} was added successfully with ID: ${user.id}`);
	} catch (error: any) {
		loggerService.error('Error adding user', { error: error.message });
		res.status(500).json({ error: 'Error adding user' });
	}
};

/**
 * Updates a user's score.
 * @param req - Express request object, containing user ID in params and score in the body.
 * @param res - Express response object.
 */
export const updateScore = async (req: Request, res: Response): Promise<void> => {
	const { id } = req.params;
	const { score } = req.body;

	try {
		loggerService.info('Updating user score', { id, score });
		const user = await userRepository.updateScore(Number(id), score);
		if (!user) {
			loggerService.warn('User not found for update', { id });
			res.status(404).json({ error: 'User not found' });
			return;
		}
		res.status(200).json(user);
		loggerService.info(`User ${user.username} (ID: ${id}) score updated to ${score}`);
	} catch (error: any) {
		loggerService.error('Error updating user score', { error: error.message });
		res.status(500).json({ error: 'Error updating user score' });
	}
};

/**
 * Retrieves the top N users sorted by score.
 * @param req - Express request object, containing limit in params.
 * @param res - Express response object.
 */
export const getTopUsers = async (req: Request, res: Response): Promise<void> => {
	const { limit } = req.params;

	try {
		loggerService.info('Fetching top users', { limit });
		const users = await userRepository.getTopUsers(Number(limit));
		res.status(200).json(users);
		loggerService.info(`Successfully fetched top ${limit} users`);
	} catch (error: any) {
		loggerService.error('Error fetching top users', { error: error.message });
		res.status(500).json({ error: 'Error fetching top users' });
	}
};

/**
 * Retrieves a user and their 5 neighbors based on score.
 * @param req - Express request object, containing user ID in params.
 * @param res - Express response object.
 */
export const getUserWithNeighbors = async (req: Request, res: Response): Promise<void> => {
	const { id } = req.params;

	try {
		loggerService.info('Fetching user with neighbors', { id });
		const neighbors = await userRepository.getUserWithNeighbors(Number(id));
		if (!neighbors || neighbors.length === 0) {
			loggerService.warn('User not found for neighbors', { id });
			res.status(404).json({ error: 'User not found' });
			return;
		}
		res.status(200).json(neighbors);
		loggerService.info(`Successfully fetched user (ID: ${id}) and neighbors`);
	} catch (error: any) {
		loggerService.error('Error fetching user and neighbors', { error: error.message });
		res.status(500).json({ error: 'Error fetching user and neighbors' });
	}
};