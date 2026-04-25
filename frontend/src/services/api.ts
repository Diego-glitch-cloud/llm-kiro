import type { Game, Order, CreateOrderRequest, OrderResponse } from '../types';

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3001/api';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly field?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `HTTP error ${response.status}`;
    let field: string | undefined;
    try {
      const body = await response.json() as { error?: string; field?: string };
      if (body.error) message = body.error;
      field = body.field;
    } catch {
      // ignore JSON parse errors — keep default message
    }
    throw new ApiError(response.status, message, field);
  }
  return response.json() as Promise<T>;
}

export async function fetchGames(): Promise<Game[]> {
  const response = await fetch(`${BASE_URL}/games`);
  return handleResponse<Game[]>(response);
}

export async function fetchGame(id: string): Promise<Game> {
  const response = await fetch(`${BASE_URL}/games/${encodeURIComponent(id)}`);
  return handleResponse<Game>(response);
}

export async function createOrder(request: CreateOrderRequest): Promise<OrderResponse> {
  const response = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  return handleResponse<OrderResponse>(response);
}

export async function fetchOrder(id: string): Promise<Order> {
  const response = await fetch(`${BASE_URL}/orders/${encodeURIComponent(id)}`);
  return handleResponse<Order>(response);
}
