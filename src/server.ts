import express from 'express';
import pool from './db'; // Import PostgreSQL connection
import { loggerService } from './services/logger.service'; 

const app = express();
app.use(express.json()); 

// Root route to check if the server is running
app.get('/', async (req, res) => {
  loggerService.info('Root route accessed');
  res.send('Leaderboard API is running!');
});

// POST /addUser - Adds a new user to the database
app.post('/addUser', async (req, res) => {
  const { username, score, img_url } = req.body;

  try {
    loggerService.info('Attempting to add a new user', { username, score, img_url });

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

    loggerService.debug('User added successfully', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    loggerService.error('Error adding user', error);
    res.status(500).send('Error adding user');
  }
});

// PUT /updateScore/:id - Updates the score of a specific user
app.put('/updateScore/:id', async (req, res) => {
  const { id } = req.params;
  const { score } = req.body;

  try {
    loggerService.info('Attempting to update score', { id, score });

    const result = await pool.query('UPDATE users SET score = $1 WHERE id = $2 RETURNING *', [
      score,
      id,
    ]);

    if (result.rows.length === 0) {
      loggerService.warn('User not found for update', { id });
      return res.status(404).send('User not found');
    }

    loggerService.debug('Score updated successfully', result.rows[0]);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    loggerService.error('Error updating score', error);
    res.status(500).send('Error updating score');
  }
});

// GET /getTopUsers/:limit - Retrieves the top N users sorted by score
app.get('/getTopUsers/:limit', async (req, res) => {
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
});

// GET /getUserWithNeighbors/:id - Retrieves a user and 5 neighbors
app.get('/getUserWithNeighbors/:id', async (req, res) => {
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
});

// Start the server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  loggerService.info(`Server running on http://localhost:${PORT}`);
});

export { app, server };