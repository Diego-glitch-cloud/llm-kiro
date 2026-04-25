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
    <div
      role="dialog"
      aria-label="Carrito de compras"
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '380px',
        height: '100vh',
        background: '#fff',
        boxShadow: '-4px 0 16px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>
        <h2 style={{ margin: 0 }}>Carrito</h2>
        <button onClick={onClose} aria-label="Cerrar carrito" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}>
          ✕
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 1rem' }}>
        {items.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#718096', marginTop: '2rem' }}>Tu carrito está vacío</p>
        ) : (
          items.map((item) => <CartItemComponent key={item.game.id} item={item} />)
        )}
      </div>

      {items.length > 0 && (
        <div style={{ padding: '1rem', borderTop: '1px solid #e2e8f0' }}>
          <p style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', margin: '0 0 1rem' }}>
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </p>
          <button
            onClick={clearCart}
            style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer', background: '#fff', border: '1px solid #e53e3e', color: '#e53e3e', borderRadius: '4px' }}
          >
            Vaciar carrito
          </button>
          <button
            onClick={onCheckout}
            style={{ width: '100%', padding: '0.5rem', cursor: 'pointer', background: '#3182ce', border: 'none', color: '#fff', borderRadius: '4px' }}
          >
            Proceder al checkout
          </button>
        </div>
      )}
    </div>
  );
}
