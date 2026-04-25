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
      <header className="app-header">
        <a href="/" className="app-logo">
          <span>🎮</span> Videogame Store
        </a>
        <CartIcon onClick={() => setCartOpen(true)} />
      </header>

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={handleCheckout}
      />

      <main className="app-main">
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
