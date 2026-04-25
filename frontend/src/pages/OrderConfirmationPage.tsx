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
      .then((data) => { if (!cancelled) setOrder(data); })
      .catch((err: unknown) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Error desconocido'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [orderId]);

  if (loading) {
    return (
      <div className="state-center">
        <div className="spinner" />
        <p>Cargando confirmación...</p>
      </div>
    );
  }

  if (error) return <div className="error-state">⚠️ {error}</div>;
  if (!order) return <div className="error-state">Orden no encontrada.</div>;

  return (
    <div className="confirm-wrap">
      <div className="confirm-hero">
        <div className="confirm-icon">🎉</div>
        <h1 className="confirm-title">¡Pedido confirmado!</h1>
        <p style={{ color: 'var(--clr-muted)', fontSize: '.9rem' }}>Gracias por tu compra</p>
        <span className="confirm-order-id">#{order.id}</span>
      </div>

      <div className="confirm-section">
        <p className="confirm-section-title">Datos del comprador</p>
        <div className="confirm-buyer-info">
          <div className="confirm-buyer-row">
            <span className="confirm-buyer-label">Nombre</span>
            <span className="confirm-buyer-value">{order.buyer.name}</span>
          </div>
          <div className="confirm-buyer-row">
            <span className="confirm-buyer-label">Email</span>
            <span className="confirm-buyer-value">{order.buyer.email}</span>
          </div>
          <div className="confirm-buyer-row">
            <span className="confirm-buyer-label">Dirección</span>
            <span className="confirm-buyer-value">{order.buyer.address}</span>
          </div>
        </div>
      </div>

      <div className="confirm-section">
        <p className="confirm-section-title">Resumen del pedido</p>
        <div className="confirm-items">
          {order.items.map((item) => (
            <div key={item.gameId} className="confirm-item">
              <div>
                <p className="confirm-item-name">{item.gameTitle}</p>
                <p className="confirm-item-qty">× {item.quantity} unidades</p>
              </div>
              <span className="confirm-item-price">
                ${(item.unitPrice * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
          <div className="confirm-total-row">
            <span>Total pagado</span>
            <span className="confirm-total-amount">${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <Link to="/" className="btn btn-accent btn-full" style={{ textAlign: 'center' }}>
        ← Volver al catálogo
      </Link>
    </div>
  );
}
