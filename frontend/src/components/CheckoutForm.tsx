import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { CreateOrderRequest } from '../types';
import { useCheckout } from '../hooks/useCheckout';
import { useCart } from '../hooks/useCart';

interface CheckoutFormProps {
  onSuccess: (orderId: string) => void;
}

interface FormFields { name: string; email: string; address: string; }
interface ClientErrors { name?: string; email?: string; address?: string; }

function validate(fields: FormFields): ClientErrors {
  const errors: ClientErrors = {};
  if (!fields.name.trim()) errors.name = 'El nombre es obligatorio.';
  if (!fields.email.trim()) {
    errors.email = 'El correo electrónico es obligatorio.';
  } else if (!fields.email.includes('@')) {
    errors.email = 'El correo electrónico no es válido.';
  }
  if (!fields.address.trim()) errors.address = 'La dirección de envío es obligatoria.';
  return errors;
}

export function CheckoutForm({ onSuccess }: CheckoutFormProps) {
  const { submit, loading, error, fieldError, fieldName, orderId } = useCheckout();
  const { items, clearCart } = useCart();
  const [fields, setFields] = useState<FormFields>({ name: '', email: '', address: '' });
  const [clientErrors, setClientErrors] = useState<ClientErrors>({});

  const serverFieldError: ClientErrors = {};
  if (fieldError && fieldName) {
    if (fieldName === 'buyer.name') serverFieldError.name = fieldError;
    else if (fieldName === 'buyer.email') serverFieldError.email = fieldError;
    else if (fieldName === 'buyer.address') serverFieldError.address = fieldError;
  }

  useEffect(() => {
    if (orderId) { clearCart(); onSuccess(orderId); }
  }, [orderId, clearCart, onSuccess]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    setClientErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errors = validate(fields);
    if (Object.keys(errors).length > 0) { setClientErrors(errors); return; }
    setClientErrors({});
    const request: CreateOrderRequest = {
      buyer: { name: fields.name.trim(), email: fields.email.trim(), address: fields.address.trim() },
      items: items.map((item) => ({ gameId: item.game.id, quantity: item.quantity })),
    };
    await submit(request);
  }

  const is409 = error && !fieldName;

  return (
    <div className="checkout-wrap">
      <Link to="/" className="detail-back">← Volver al catálogo</Link>
      <h1 className="checkout-title">Finalizar compra</h1>
      <p className="checkout-subtitle">Completa tus datos para procesar el pedido</p>

      <form className="form-card" onSubmit={handleSubmit} noValidate>
        {is409 && (
          <div className="alert-error" role="alert">
            ⚠️ {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="name">Nombre completo</label>
          <input
            id="name" name="name" type="text"
            className={`form-input${clientErrors.name || serverFieldError.name ? ' error' : ''}`}
            placeholder="Juan García"
            value={fields.name}
            onChange={handleChange}
          />
          {(clientErrors.name || serverFieldError.name) && (
            <span className="form-error" role="alert">
              ⚠ {clientErrors.name ?? serverFieldError.name}
            </span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="email">Correo electrónico</label>
          <input
            id="email" name="email" type="email"
            className={`form-input${clientErrors.email || serverFieldError.email ? ' error' : ''}`}
            placeholder="juan@ejemplo.com"
            value={fields.email}
            onChange={handleChange}
          />
          {(clientErrors.email || serverFieldError.email) && (
            <span className="form-error" role="alert">
              ⚠ {clientErrors.email ?? serverFieldError.email}
            </span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="address">Dirección de envío</label>
          <textarea
            id="address" name="address"
            className={`form-textarea${clientErrors.address || serverFieldError.address ? ' error' : ''}`}
            placeholder="Calle, número, ciudad, país..."
            value={fields.address}
            onChange={handleChange}
          />
          {(clientErrors.address || serverFieldError.address) && (
            <span className="form-error" role="alert">
              ⚠ {clientErrors.address ?? serverFieldError.address}
            </span>
          )}
        </div>

        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? '⏳ Procesando...' : '✓ Confirmar pedido'}
        </button>
      </form>
    </div>
  );
}
