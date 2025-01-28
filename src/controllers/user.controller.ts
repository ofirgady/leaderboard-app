import { Request, Response } from 'express';
import pool from '../db';
import { loggerService } from '../services/logger.service';

// Add a new user
export const addUser = async (req: Request, res: Response) => {
  const { username, score, img_url } = req.body;

  try {
    loggerService.info('Adding a new user', { username, score });
    const result = img_url
      ? await pool.query(
          `INSERT INTO users (username, score, img_url) VALUES ($1, $2, $3) RETURNING *`,
          [username, score, img_url]
        )
      : await pool.query(
          `INSERT INTO users (username, score) VALUES ($1, $2) RETURNING *`,
          [username, score]
        );

    loggerService.debug('User added successfully', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    loggerService.error('Error adding user', error);
    res.status(500).send('Error adding user');
  }
};

// Update a user's score
export const updateScore = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { score } = req.body;

  try {
    loggerService.info('Updating user score', { id, score });
    const result = await pool.query('UPDATE users SET score = $1 WHERE id = $2 RETURNING *', [
      score,
      id,
    ]);

    if (result.rows.length === 0) {
      loggerService.warn('User not found for update', { id });
      return res.status(404).send('User not found');
    }

    loggerService.debug('User score updated successfully', result.rows[0]);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    loggerService.error('Error updating user score', error);
    res.status(500).send('Error updating user score');
  }
};

// Get top N users
export const getTopUsers = async (req: Request, res: Response) => {
  const { limit } = req.params;

  try {
    loggerService.info('Fetching top users', { limit });
    const result = await pool.query('SELECT * FROM users ORDER BY score DESC LIMIT $1', [
      parseInt(limit, 10),
    ]);

    loggerService.debug('Top users fetched successfully', result.rows);
    res.status(200).json(result.rows);
  } catch (error) {
    loggerService.error('Error fetching top users', error);
    res.status(500).send('Error fetching top users');
  }
};

// Get a user and 5 neighbors
export const getUserWithNeighbors = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
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

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      loggerService.warn('User not found for neighbors', { id });
      return res.status(404).send('User not found');
    }

    loggerService.debug('User and neighbors fetched successfully', result.rows);
    res.status(200).json(result.rows);
  } catch (error) {
    loggerService.error('Error fetching user and neighbors', error);
    res.status(500).send('Error fetching user and neighbors');
  }
};