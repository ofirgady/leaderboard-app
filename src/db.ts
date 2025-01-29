import { Pool } from 'pg';
import dotenv from 'dotenv';
import { loggerService } from './services/logger.service';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

const initializeDatabase = async () => {
  try {
    await pool.query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS leaderboard_ranking AS 
      SELECT id, username, score, img_url, 
             RANK() OVER (ORDER BY score DESC) AS rank
      FROM users WHERE score > 0 WITH DATA;
    `);

    await pool.query('REFRESH MATERIALIZED VIEW leaderboard_ranking;');
    loggerService.info('Materialized view ensured and refreshed.');

    // Set up event listener for refreshing the view
    const client = await pool.connect();
    await client.query('LISTEN refresh_leaderboard');

    client.on('notification', async () => {
      loggerService.info('Refreshing leaderboard materialized view...');
      await pool.query('REFRESH MATERIALIZED VIEW leaderboard_ranking');
      loggerService.info('Leaderboard materialized view refreshed.');
    });

    loggerService.info('Listening for leaderboard updates...');
  } catch (error: any) {
    loggerService.error('Error initializing database', { error: error.message });
  }
};

// Close DB connections
const closeDatabaseConnections = async () => {
  loggerService.info('Closing database connections...');
  await pool.end();
};

initializeDatabase();

export { pool, closeDatabaseConnections };