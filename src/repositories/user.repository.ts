import pool from '../db';

export const userRepository = {
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
		const query = `UPDATE users SET score = $1 WHERE id = $2 RETURNING *`;
		const params = [score, id];

		try {
			const result = await pool.query(query, params);
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
	getTopUsers: async (limit: number) => {
		const query = `SELECT * FROM users ORDER BY score DESC LIMIT $1`;

		try {
			const result = await pool.query(query, [limit]);
			return result.rows;
		} catch (error: any) {
			throw new Error(`Error fetching top users: ${error.message}`);
		}
	},

	/**
	 * Retrieves a user and their 5 neighbors by rank.
	 * @param id - The ID of the user.
	 * @returns An array of the user and their neighbors.
	 */
	getUserWithNeighbors: async (id: number) => {
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

		try {
			const result = await pool.query(query, [id]);
			return result.rows;
		} catch (error: any) {
			throw new Error(`Error fetching user with neighbors for ID ${id}: ${error.message}`);
		}
	},
};
