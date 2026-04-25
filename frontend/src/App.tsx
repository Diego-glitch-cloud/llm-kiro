import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { CartProvider } from './store/cartStore';
import { CartIcon } from './components/CartIcon';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutForm } from './components/CheckoutForm';
import { HomePage } from './pages/HomePage';
import { GameDetailPage } from './pages/GameDetailPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';

function AppLayout() {
  const [cartOpen, setCartOpen] = useState(false);
  const navigate = useNavigate();

  function handleCheckout() {
    setCartOpen(false);
    navigate('/checkout');
  }

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>
        <a href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Videogame Store</h1>
        </a>
        <CartIcon onClick={() => setCartOpen(true)} />
      </header>

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={handleCheckout}
      />

      <main style={{ padding: '1rem' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/games/:id" element={<GameDetailPage />} />
          <Route path="/orders/:orderId" element={<OrderConfirmationPage />} />
          <Route
            path="/checkout"
            element={
              <CheckoutForm
                onSuccess={(orderId) => navigate(`/orders/${orderId}`)}
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </CartProvider>
  );
}
