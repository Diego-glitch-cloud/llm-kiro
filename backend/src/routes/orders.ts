import { Router, Request, Response, NextFunction } from 'express';
import { dataStore } from '../services/dataStore';
import { HttpError } from '../types/errors';
import { validateOrderRequest } from '../validators/orderValidator';
import { createOrder } from '../services/orderService';

const router = Router();

// POST /api/orders
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedRequest = validateOrderRequest(req.body);
    const order = createOrder(validatedRequest, dataStore);
    res.status(201).json({
      orderId: order.id,
      total: order.total,
      createdAt: order.createdAt,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:id
router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const order = dataStore.orders.find((o) => o.id === id);
    if (!order) {
      throw new HttpError(404, `Order not found: ${id}`);
    }
    res.status(200).json(order);
  } catch (err) {
    next(err);
  }
});

export default router;
