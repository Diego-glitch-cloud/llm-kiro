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
      aria-label={`Carrito${count > 0 ? `, ${count} ítems` : ''}`}
      style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}
    >
      🛒
      {count > 0 && (
        <span
          style={{
            position: 'absolute',
            top: '-6px',
            right: '-6px',
            background: '#e53e3e',
            color: '#fff',
            borderRadius: '50%',
            fontSize: '0.7rem',
            width: '18px',
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}
