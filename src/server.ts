import express from 'express';
import userRoutes from './routes/user.routes';
import { errorHandler } from './middlewares/error.middleware';
import { requestLogger } from './middlewares/logger.middleware';
import { loggerService } from './services/logger.service';

const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Middleware for logging incoming requests
app.use(requestLogger);

// Register user-related routes
app.use('/api/users', userRoutes);

// Middleware for handling errors globally
app.use(errorHandler);

// Define the port from environment variables or use default
const PORT = process.env.PORT || 3000;

// Start the server and log its status
const server = app.listen(PORT, () => {
  loggerService.info(`Server running on http://localhost:${PORT}`);
});

export { app, server };