import pool from '../db';

export const userRepository = {
	// Add a new user to the database
	addUser: async (username: string, score: number, img_url?: string) => {
		const query = img_url
			? `INSERT INTO users (username, score, img_url) VALUES ($1, $2, $3) RETURNING *`
			: `INSERT INTO users (username, score) VALUES ($1, $2) RETURNING *`;
		const params = img_url ? [username, score, img_url] : [username, score];
		const result = await pool.query(query, params);
		return result.rows[0];
	},

	// Update a user's score
	updateScore: async (id: number, score: number) => {
		const query = `UPDATE users SET score = $1 WHERE id = $2 RETURNING *`;
		const params = [score, id];
		const result = await pool.query(query, params);
		return result.rows[0];
	},

	// Get the top N users by score
	getTopUsers: async (limit: number) => {
		const query = `SELECT * FROM users ORDER BY score DESC LIMIT $1`;
		const result = await pool.query(query, [limit]);
		return result.rows;
	},

	// Get a user and 5 neighbors by rank
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
		const result = await pool.query(query, [id]);
		return result.rows;
	},
};
