import express from 'express';
import userRoutes from './routes/user.routes';
import { errorHandler } from './middlewares/error.middleware';
import { requestLogger } from './middlewares/logger.middleware';

const app = express();
app.use(express.json());

// Middleware for logging requests
app.use(requestLogger);

// Register routes
app.use('/api/users', userRoutes);

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export { app, server };