import express from 'express';
import userRoutes from './routes/user.routes';
import { errorHandler } from './middlewares/error.middleware';
import { requestLogger } from './middlewares/logger.middleware';
import { loggerService } from './services/logger.service';
import { checkServerStatus } from './controllers/user.controller';
import { userRepository } from './repositories/user.repository';

const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Middleware for logging incoming requests
app.use(requestLogger);

// Root route to check server status
app.get('/', checkServerStatus);

// Register user-related routes
app.use('/api/user', userRoutes);

// Middleware for handling errors globally
app.use(errorHandler);

// Define the port from environment variables or use default
const PORT = process.env.PORT || 3000;

// Function to start the server
const startServer = async () => {
  try {
    // Ensure indexes are created before starting the server
    await userRepository.ensureIndexes();
    loggerService.info('Indexes ensured successfully.');

    // Start the server
    const server = app.listen(PORT, () => {
      loggerService.info(`Server running on http://localhost:${PORT}`);
    });

    return server;
  } catch (error) {
    const errorMessage = (error as Error).message;
    loggerService.error('Error during server startup', { error: errorMessage });
    process.exit(1); // Exit the process if there's an error
  }
};

// Start the server
const server = startServer();

export { app, server };