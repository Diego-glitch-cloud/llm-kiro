import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../types/errors';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.setHeader('Content-Type', 'application/json');

  if (err instanceof HttpError) {
    const body: { error: string; field?: string } = { error: err.message };
    if (err.field !== undefined) {
      body.field = err.field;
    }
    res.status(err.status).json(body);
    return;
  }

  res.status(500).json({ error: 'Internal server error' });
}
