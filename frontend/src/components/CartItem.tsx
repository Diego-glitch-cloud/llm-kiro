import type { CartItem } from '../types';
import { useCart } from '../hooks/useCart';

interface CartItemProps {
  item: CartItem;
}

export function CartItemComponent({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();
  const { game, quantity } = item;
  const subtotal = (game.price * quantity).toFixed(2);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 0', borderBottom: '1px solid #e2e8f0' }}>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>{game.title}</p>
        <p style={{ margin: 0, color: '#718096', fontSize: '0.875rem' }}>${game.price.toFixed(2)} c/u</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          onClick={() => updateQuantity(game.id, quantity - 1)}
          disabled={quantity <= 1}
          aria-label="Decrementar cantidad"
          style={{ width: '28px', height: '28px', cursor: quantity <= 1 ? 'not-allowed' : 'pointer' }}
        >
          -
        </button>
        <span>{quantity}</span>
        <button
          onClick={() => updateQuantity(game.id, quantity + 1)}
          disabled={quantity >= game.stock}
          aria-label="Incrementar cantidad"
          style={{ width: '28px', height: '28px', cursor: quantity >= game.stock ? 'not-allowed' : 'pointer' }}
        >
          +
        </button>
      </div>

      <p style={{ margin: 0, minWidth: '60px', textAlign: 'right' }}>${subtotal}</p>

      <button
        onClick={() => removeFromCart(game.id)}
        aria-label={`Eliminar ${game.title}`}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e53e3e' }}
      >
        Eliminar
      </button>
    </div>
  );
}
