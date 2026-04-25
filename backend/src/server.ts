import express from 'express';
import { corsMiddleware } from './middleware/cors';
import { errorHandler } from './middleware/errorHandler';
import gamesRouter from './routes/games';
import ordersRouter from './routes/orders';
import { loadDataStore } from './services/dataStore';

const app = express();

// Middleware
app.use(corsMiddleware);
app.use(express.json());

// Routes
app.use('/api/games', gamesRouter);
app.use('/api/orders', ordersRouter);

// Error handler must be last
app.use(errorHandler);

export { app };

if (require.main === module) {
  loadDataStore();
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
