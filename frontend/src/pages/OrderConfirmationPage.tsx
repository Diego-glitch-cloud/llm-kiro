import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Order } from '../types';
import { fetchOrder } from '../services/api';

export function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchOrder(orderId)
      .then((data) => {
        if (!cancelled) setOrder(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error desconocido');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [orderId]);

  if (loading) return <p>Cargando confirmación...</p>;
  if (error) return <p role="alert" style={{ color: 'red' }}>Error: {error}</p>;
  if (!order) return <p>Orden no encontrada.</p>;

  return (
    <div>
      <h1>¡Pedido confirmado!</h1>
      <p>Número de orden: <strong>{order.id}</strong></p>

      <h2>Datos del comprador</h2>
      <p>{order.buyer.name}</p>
      <p>{order.buyer.email}</p>
      <p>{order.buyer.address}</p>

      <h2>Resumen del pedido</h2>
      <ul>
        {order.items.map((item) => (
          <li key={item.gameId}>
            {item.gameTitle} × {item.quantity} — ${(item.unitPrice * item.quantity).toFixed(2)}
          </li>
        ))}
      </ul>

      <p><strong>Total: ${order.total.toFixed(2)}</strong></p>

      <Link to="/">Volver al catálogo</Link>
    </div>
  );
}
