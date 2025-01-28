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

// Log successful connection
pool.on('connect', () => {
  loggerService.info('Connected to PostgreSQL database');
});

// Log errors
pool.on('error', (err) => {
  loggerService.error('Unexpected error on idle client', err);
});

export default pool; // Export the database connection pool