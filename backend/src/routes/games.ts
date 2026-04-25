import { Router, Request, Response } from 'express';
import { dataStore } from '../services/dataStore';
import { HttpError } from '../types/errors';

const router = Router();

// GET /api/games - returns full list of games
router.get('/', (_req: Request, res: Response) => {
  res.status(200).json(dataStore.games);
});

// GET /api/games/:id - returns a game by ID or 404
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const game = dataStore.games.find((g) => g.id === id);
  if (!game) {
    throw new HttpError(404, `Game not found: ${id}`);
  }
  res.status(200).json(game);
});

export default router;
