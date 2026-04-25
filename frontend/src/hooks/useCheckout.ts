import { useState } from 'react';
import type { CreateOrderRequest } from '../types';
import { createOrder, ApiError } from '../services/api';

export interface UseCheckoutResult {
  submit(request: CreateOrderRequest): Promise<void>;
  loading: boolean;
  error: string | null;
  fieldError: string | null;
  fieldName: string | null;
  orderId: string | null;
}

export function useCheckout(): UseCheckoutResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [fieldName, setFieldName] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  async function submit(request: CreateOrderRequest): Promise<void> {
    setLoading(true);
    setError(null);
    setFieldError(null);
    setFieldName(null);

    try {
      const response = await createOrder(request);
      setOrderId(response.orderId);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 400) {
          setFieldError(err.message);
          setFieldName(err.field ?? null);
          setError(err.message);
        } else if (err.status === 409) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return { submit, loading, error, fieldError, fieldName, orderId };
}
