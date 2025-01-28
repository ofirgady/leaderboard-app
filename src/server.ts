import express from 'express';
import userRoutes from './routes/user.routes';
import { loggerService } from './services/logger.service';

const app = express();
app.use(express.json());

// Register routes
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  loggerService.info(`Server running on http://localhost:${PORT}`);
});

export { app, server };