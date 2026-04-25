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
    <div className="cart-item">
      <div className="cart-item-info">
        <p className="cart-item-title">{game.title}</p>
        <p className="cart-item-price">${game.price.toFixed(2)} c/u</p>
      </div>

      <div className="cart-item-qty">
        <button
          className="qty-btn"
          onClick={() => updateQuantity(game.id, quantity - 1)}
          disabled={quantity <= 1}
          aria-label="Decrementar cantidad"
        >−</button>
        <span className="qty-value">{quantity}</span>
        <button
          className="qty-btn"
          onClick={() => updateQuantity(game.id, quantity + 1)}
          disabled={quantity >= game.stock}
          aria-label="Incrementar cantidad"
        >+</button>
      </div>

      <span className="cart-item-subtotal">${subtotal}</span>

      <button
        className="cart-item-remove"
        onClick={() => removeFromCart(game.id)}
        aria-label={`Eliminar ${game.title}`}
      >✕</button>
    </div>
  );
}
