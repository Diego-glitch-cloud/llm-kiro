import { useCart } from '../hooks/useCart';
import { CartItemComponent } from './CartItem';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export function CartDrawer({ isOpen, onClose, onCheckout }: CartDrawerProps) {
  const { items, total, clearCart } = useCart();

  if (!isOpen) return null;

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div role="dialog" aria-label="Carrito de compras" className="drawer">
        <div className="drawer-header">
          <span className="drawer-title">🛒 Mi Carrito</span>
          <button className="btn-icon" onClick={onClose} aria-label="Cerrar carrito">✕</button>
        </div>

        <div className="drawer-body">
          {items.length === 0 ? (
            <div className="drawer-empty">
              <span className="drawer-empty-icon">🛒</span>
              <p>Tu carrito está vacío</p>
              <p style={{ fontSize: '.8rem' }}>¡Agrega algunos juegos!</p>
            </div>
          ) : (
            items.map((item) => <CartItemComponent key={item.game.id} item={item} />)
          )}
        </div>

        {items.length > 0 && (
          <div className="drawer-footer">
            <div className="drawer-total">
              <span>Total</span>
              <span className="drawer-total-amount">${total.toFixed(2)}</span>
            </div>
            <button className="btn btn-outline btn-full btn-sm" onClick={clearCart}>
              Vaciar carrito
            </button>
            <button className="btn btn-primary btn-full" onClick={onCheckout}>
              Proceder al checkout →
            </button>
          </div>
        )}
      </div>
    </>
  );
}
