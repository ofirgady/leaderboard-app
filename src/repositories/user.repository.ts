import {pool} from '../db';

export const userRepository = {

	// Ensures necessary indexes are created in the database if they do not already exist.
	// Indexes help speed up queries, particularly when handling a large dataset (e.g., 10M+ users).
	ensureIndexes: async () => {

		const queries = [

			// Unique index on the 'id' column (serving as the primary key).
			// Ensures no duplicate user IDs and improves performance when searching by ID.
			`CREATE UNIQUE INDEX IF NOT EXISTS users_pkey ON users (id)`,

			// Index on the 'score' column in descending order (highest to lowest).
			// Optimizes queries that retrieve top users by score.
			`CREATE INDEX IF NOT EXISTS idx_score ON users (score DESC)`,

			// Partial index on 'score' where score is greater than 0.
			// This improves performance for queries that filter out users with zero or negative scores.
			`CREATE INDEX IF NOT EXISTS idx_score_positive ON users (score DESC) WHERE score > 0`,
		];

		try {
			for (const query of queries) {
			  await pool.query(query);
			}
			console.log('Indexes ensured.');
		  } catch (error: any) {
			throw new Error(`Error ensuring indexes: ${error.message}`);
		  }
		},
	  
		/**
		 * Adds a new user to the database.
		 * @param username - The username of the user.
		 * @param score - The score of the user.
		 * @param img_url - Optional image URL of the user.
		 * @returns The newly added user.
		 */
		addUser: async (username: string, score: number, img_url?: string) => {
		  const query = img_url
			? `INSERT INTO users (username, score, img_url) VALUES ($1, $2, $3) RETURNING *`
			: `INSERT INTO users (username, score) VALUES ($1, $2) RETURNING *`;
	  
		  const params = img_url ? [username, score, img_url] : [username, score];
	  
		  try {
			const result = await pool.query(query, params);
			await pool.query('NOTIFY refresh_leaderboard'); // Notify PostgreSQL to refresh leaderboard
			return result.rows[0];
		  } catch (error: any) {
			throw new Error(`Error adding user: ${error.message}`);
		  }
		},
	  
		/**
		 * Updates the score of a user by ID.
		 * @param id - The ID of the user.
		 * @param score - The new score to set.
		 * @returns The updated user.
		 */
		updateScore: async (id: number, score: number) => {
		  const query = `UPDATE users SET score = $1 WHERE id = $2 RETURNING id, username, score, img_url`;
	  
		  try {
			const result = await pool.query(query, [score, id]);
			await pool.query('NOTIFY refresh_leaderboard'); // Notify PostgreSQL to refresh leaderboard
			return result.rows[0];
		  } catch (error: any) {
			throw new Error(`Error updating score for user ID ${id}: ${error.message}`);
		  }
		},
	  
		/**
		 * Retrieves the top N users by score.
		 * @param limit - The number of users to retrieve.
		 * @returns An array of users.
		 */
		getTopUsers: async (limit: number, offset: number = 0) => {
			const query = `SELECT id, username, score, img_url, rank FROM leaderboard_ranking LIMIT $1 OFFSET $2`;
		
			try {
			  await pool.query('REFRESH MATERIALIZED VIEW leaderboard_ranking'); // Ensure fresh data
			  const result = await pool.query(query, [limit, offset]);
			  return result.rows;
			} catch (error: any) {
			  throw new Error(`Error fetching top users: ${error.message}`);
			}
		  },
		
		  getUserWithNeighbors: async (id: number) => {
			const query = `
			  WITH ranked_users AS (
				SELECT id, username, score, img_url, rank
				FROM leaderboard_ranking
			  )
			  SELECT * FROM ranked_users
			  WHERE rank BETWEEN (
				SELECT rank - 5 FROM ranked_users WHERE id = $1
			  ) AND (
				SELECT rank + 5 FROM ranked_users WHERE id = $1
			  )
			  ORDER BY rank;
			`;
		
			try {
			  await pool.query('REFRESH MATERIALIZED VIEW leaderboard_ranking'); // Ensure fresh data
			  const result = await pool.query(query, [id]);
			  return result.rows;
			} catch (error: any) {
			  throw new Error(`Error fetching user with neighbors for ID ${id}: ${error.message}`);
			}
		  },
		};