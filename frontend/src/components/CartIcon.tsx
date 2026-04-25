import { useCart } from '../hooks/useCart';

interface CartIconProps {
  onClick: () => void;
}

export function CartIcon({ onClick }: CartIconProps) {
  const { items } = useCart();
  const count = items.length;

  return (
    <button
      onClick={onClick}
      className="cart-btn"
      aria-label={`Carrito${count > 0 ? `, ${count} ítems` : ''}`}
    >
      🛒
      {count > 0 && <span className="cart-badge">{count}</span>}
    </button>
  );
}
