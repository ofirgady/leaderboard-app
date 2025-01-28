import { Request, Response } from 'express';
import pool from '../db';
import { loggerService } from '../services/logger.service';

const handleQuery = async (res: Response, query: string, params: any[], successMessage: string) => {
	try {
		const result = await pool.query(query, params);
		if (result.rows.length === 0) {
			loggerService.warn(`${successMessage} failed - No rows found`, { params });
			return res.status(404).json({ error: 'Resource not found' });
		}
		loggerService.debug(`${successMessage} successful`, result.rows);
		res.status(200).json(result.rows);
	} catch (error: any) {
		loggerService.error(`${successMessage} failed`, { error: error.message });
		res.status(500).json({ error: 'Internal server error' });
	}
};

// Add a new user
export const addUser = async (req: Request, res: Response) => {
	const { username, score, img_url } = req.body;
	const query = img_url
		? `INSERT INTO users (username, score, img_url) VALUES ($1, $2, $3) RETURNING *`
		: `INSERT INTO users (username, score) VALUES ($1, $2) RETURNING *`;
	const params = img_url ? [username, score, img_url] : [username, score];

	loggerService.info('Adding a new user', { username, score });
	await handleQuery(res, query, params, 'Add user');
};

// Update a user's score
export const updateScore = async (req: Request, res: Response) => {
	const { id } = req.params;
	const { score } = req.body;

	loggerService.info('Updating user score', { id, score });
	const query = `UPDATE users SET score = $1 WHERE id = $2 RETURNING *`;
	const params = [score, id];
	await handleQuery(res, query, params, 'Update score');
};

// Get top N users
export const getTopUsers = async (req: Request, res: Response) => {
	const { limit } = req.params;

	loggerService.info('Fetching top users', { limit });
	const query = `SELECT * FROM users ORDER BY score DESC LIMIT $1`;
	const params = [parseInt(limit, 10)];
	await handleQuery(res, query, params, 'Fetch top users');
};

// Get a user and 5 neighbors
export const getUserWithNeighbors = async (req: Request, res: Response) => {
	const { id } = req.params;

	loggerService.info('Fetching user with neighbors', { id });
	const query = `
    WITH ranked_users AS (
      SELECT id, username, score, ROW_NUMBER() OVER (ORDER BY score DESC) AS rank_row
      FROM users
    )
    SELECT * FROM ranked_users
    WHERE rank_row BETWEEN (
      SELECT rank_row - 5 FROM ranked_users WHERE id = $1
    ) AND (
      SELECT rank_row + 5 FROM ranked_users WHERE id = $1
    )
    ORDER BY rank_row;
  `;
	const params = [id];
	await handleQuery(res, query, params, 'Fetch user with neighbors');
};
