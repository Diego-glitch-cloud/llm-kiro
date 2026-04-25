import { CreateOrderRequest } from '../types/index';
import { HttpError } from '../types/errors';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateOrderRequest(body: unknown): CreateOrderRequest {
  if (typeof body !== 'object' || body === null) {
    throw new HttpError(400, 'Missing required field: buyer', 'buyer');
  }

  const req = body as Record<string, unknown>;

  // Validate buyer object
  if (typeof req.buyer !== 'object' || req.buyer === null) {
    throw new HttpError(400, 'Missing required field: buyer', 'buyer');
  }

  const buyer = req.buyer as Record<string, unknown>;

  if (typeof buyer.name !== 'string' || buyer.name.trim() === '') {
    throw new HttpError(400, 'Missing required field: buyer.name', 'buyer.name');
  }

  if (typeof buyer.email !== 'string' || buyer.email.trim() === '') {
    throw new HttpError(400, 'Missing required field: buyer.email', 'buyer.email');
  }

  if (!EMAIL_REGEX.test(buyer.email)) {
    throw new HttpError(400, `Invalid email format: ${buyer.email}`, 'buyer.email');
  }

  if (typeof buyer.address !== 'string' || buyer.address.trim() === '') {
    throw new HttpError(400, 'Missing required field: buyer.address', 'buyer.address');
  }

  // Validate items
  if (!Array.isArray(req.items) || req.items.length === 0) {
    throw new HttpError(400, 'Order must contain at least one item', 'items');
  }

  return {
    buyer: {
      name: buyer.name.trim(),
      email: buyer.email.trim(),
      address: buyer.address.trim(),
    },
    items: req.items as CreateOrderRequest['items'],
  };
}
