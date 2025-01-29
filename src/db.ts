import { Pool } from 'pg';
import dotenv from 'dotenv';
import { loggerService } from './services/logger.service'; 

dotenv.config();

// Create a new PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

// Log successful connection
pool.on('connect', () => {
  loggerService.info(`Connected to database: ${process.env.DB_NAME}`);
});

// Log disconnection or errors
pool.on('remove', () => {
  loggerService.info('Client removed from the pool');
});

// Handle unexpected errors
pool.on('error', (err) => {
  loggerService.error('Unexpected error on idle client', { error: err.message, stack: err.stack });
});

export default pool;