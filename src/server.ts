import express from 'express';
import pool from './db'; // Import PostgreSQL connection

const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies

// Root route to check if the server is running
app.get('/', async (req, res) => {
	res.send('Leaderboard API is running!');
});

// POST /addUser - Adds a new user to the database
app.post('/addUser', async (req, res) => {
	const { username, score, img_url } = req.body;

	try {
		const result = img_url
			? await pool.query(
					`INSERT INTO users (username, score, img_url)
           VALUES ($1, $2, $3) RETURNING *`,
					[username, score, img_url]
			  )
			: await pool.query(
					`INSERT INTO users (username, score)
           VALUES ($1, $2) RETURNING *`,
					[username, score]
			  );

		res.status(201).json(result.rows[0]);
	} catch (error) {
		console.error('Error adding user:', error);
		res.status(500).send('Error adding user');
	}
});

// PUT /updateScore/:id - Updates the score of a specific user
app.put('/updateScore/:id', async (req, res) => {
	const { id } = req.params;
	const { score } = req.body;

	try {
		const result = await pool.query('UPDATE users SET score = $1 WHERE id = $2 RETURNING *', [
			score,
			id,
		]);

		if (result.rows.length === 0) {
			return res.status(404).send('User not found');
		}

		res.status(200).json(result.rows[0]);
	} catch (error) {
		console.error('Error updating score:', error);
		res.status(500).send('Error updating score');
	}
});

// GET /getTopUsers/:limit - Retrieves the top N users sorted by score
app.get('/getTopUsers/:limit', async (req, res) => {
	const { limit } = req.params;

	try {
		const result = await pool.query('SELECT * FROM users ORDER BY score DESC LIMIT $1', [
			parseInt(limit, 10),
		]);

		res.status(200).json(result.rows);
	} catch (error) {
		console.error('Error fetching top users:', error);
		res.status(500).send('Error fetching top users');
	}
});

// GET /getUserWithNeighbors/:id - Retrieves a user and 2 neighbors
app.get('/getUserWithNeighbors/:id', async (req, res) => {
	const { id } = req.params;

	try {
		// Use a CTE to calculate ranks for all users
		const query = `
      WITH ranked_users AS (
        SELECT id, username, score, RANK() OVER (ORDER BY score DESC) AS rank
        FROM users
      )
      SELECT * FROM ranked_users
      WHERE rank BETWEEN (
        SELECT rank - 2 FROM ranked_users WHERE id = $1
      ) AND (
        SELECT rank + 3 FROM ranked_users WHERE id = $1
      )
      ORDER BY rank;
    `;

		const result = await pool.query(query, [id]);

		if (result.rows.length === 0) {
			return res.status(404).send('User not found');
		}

		res.status(200).json(result.rows);
	} catch (error) {
		console.error('Error fetching user and neighbors:', error);
		res.status(500).send('Error fetching user and neighbors');
	}
});

// Start the server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});

export { app, server };
