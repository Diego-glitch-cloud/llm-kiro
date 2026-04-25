import { useEffect, useState } from 'react';
import type { CreateOrderRequest } from '../types';
import { useCheckout } from '../hooks/useCheckout';
import { useCart } from '../hooks/useCart';

interface CheckoutFormProps {
  onSuccess: (orderId: string) => void;
}

interface FormFields {
  name: string;
  email: string;
  address: string;
}

interface ClientErrors {
  name?: string;
  email?: string;
  address?: string;
}

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

  // Map server fieldName to form field key
  const serverFieldError: ClientErrors = {};
  if (fieldError && fieldName) {
    if (fieldName === 'buyer.name') serverFieldError.name = fieldError;
    else if (fieldName === 'buyer.email') serverFieldError.email = fieldError;
    else if (fieldName === 'buyer.address') serverFieldError.address = fieldError;
  }

  // On successful order, clear cart and notify parent
  useEffect(() => {
    if (orderId) {
      clearCart();
      onSuccess(orderId);
    }
  }, [orderId, clearCart, onSuccess]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    // Clear client error on change
    setClientErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errors = validate(fields);
    if (Object.keys(errors).length > 0) {
      setClientErrors(errors);
      return;
    }
    setClientErrors({});

    const request: CreateOrderRequest = {
      buyer: {
        name: fields.name.trim(),
        email: fields.email.trim(),
        address: fields.address.trim(),
      },
      items: items.map((item) => ({
        gameId: item.game.id,
        quantity: item.quantity,
      })),
    };

    await submit(request);
  }

  const is409 = error && !fieldName;

  return (
    <form onSubmit={handleSubmit} noValidate>
      {is409 && (
        <div role="alert" style={{ color: 'red', marginBottom: '1rem', border: '1px solid red', padding: '0.5rem' }}>
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name">Nombre completo</label>
        <input
          id="name"
          name="name"
          type="text"
          value={fields.name}
          onChange={handleChange}
          aria-describedby={clientErrors.name || serverFieldError.name ? 'name-error' : undefined}
        />
        {(clientErrors.name || serverFieldError.name) && (
          <span id="name-error" role="alert" style={{ color: 'red' }}>
            {clientErrors.name ?? serverFieldError.name}
          </span>
        )}
      </div>

      <div>
        <label htmlFor="email">Correo electrónico</label>
        <input
          id="email"
          name="email"
          type="email"
          value={fields.email}
          onChange={handleChange}
          aria-describedby={clientErrors.email || serverFieldError.email ? 'email-error' : undefined}
        />
        {(clientErrors.email || serverFieldError.email) && (
          <span id="email-error" role="alert" style={{ color: 'red' }}>
            {clientErrors.email ?? serverFieldError.email}
          </span>
        )}
      </div>

      <div>
        <label htmlFor="address">Dirección de envío</label>
        <textarea
          id="address"
          name="address"
          value={fields.address}
          onChange={handleChange}
          aria-describedby={clientErrors.address || serverFieldError.address ? 'address-error' : undefined}
        />
        {(clientErrors.address || serverFieldError.address) && (
          <span id="address-error" role="alert" style={{ color: 'red' }}>
            {clientErrors.address ?? serverFieldError.address}
          </span>
        )}
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Procesando...' : 'Confirmar pedido'}
      </button>
    </form>
  );
}
