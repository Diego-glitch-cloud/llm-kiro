import React, { createContext, useContext, useEffect, useReducer } from 'react';
import type { Game, CartItem } from '../types';

const STORAGE_KEY = 'videogame-store-cart';

// State & Actions interfaces
export interface CartState {
  items: CartItem[];
  total: number;
}

export interface CartActions {
  addToCart(game: Game): void;
  removeFromCart(gameId: string): void;
  updateQuantity(gameId: string, quantity: number): void;
  clearCart(): void;
}

type CartContextValue = CartState & CartActions;

// Reducer actions
type CartAction =
  | { type: 'ADD_TO_CART'; game: Game }
  | { type: 'REMOVE_FROM_CART'; gameId: string }
  | { type: 'UPDATE_QUANTITY'; gameId: string; quantity: number }
  | { type: 'CLEAR_CART' };

function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.game.price * item.quantity, 0);
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existing = state.items.find((i) => i.game.id === action.game.id);
      let newItems: CartItem[];
      if (existing) {
        const newQty = Math.min(existing.quantity + 1, action.game.stock);
        newItems = state.items.map((i) =>
          i.game.id === action.game.id ? { ...i, quantity: newQty } : i
        );
      } else {
        newItems = [...state.items, { game: action.game, quantity: 1 }];
      }
      return { items: newItems, total: calculateTotal(newItems) };
    }
    case 'REMOVE_FROM_CART': {
      const newItems = state.items.filter((i) => i.game.id !== action.gameId);
      return { items: newItems, total: calculateTotal(newItems) };
    }
    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map((i) => {
        if (i.game.id !== action.gameId) return i;
        const capped = Math.min(Math.max(action.quantity, 1), i.game.stock);
        return { ...i, quantity: capped };
      });
      return { items: newItems, total: calculateTotal(newItems) };
    }
    case 'CLEAR_CART':
      return { items: [], total: 0 };
    default:
      return state;
  }
}

function loadFromStorage(): CartState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: [], total: 0 };
    const parsed = JSON.parse(raw) as { items: CartItem[] };
    const items = parsed.items ?? [];
    return { items, total: calculateTotal(items) };
  } catch {
    return { items: [], total: 0 };
  }
}

// Context
const CartContext = createContext<CartContextValue | null>(null);

// Provider
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, undefined, loadFromStorage);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: state.items }));
  }, [state.items]);

  const addToCart = (game: Game) => dispatch({ type: 'ADD_TO_CART', game });
  const removeFromCart = (gameId: string) => dispatch({ type: 'REMOVE_FROM_CART', gameId });
  const updateQuantity = (gameId: string, quantity: number) =>
    dispatch({ type: 'UPDATE_QUANTITY', gameId, quantity });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  return React.createElement(
    CartContext.Provider,
    { value: { ...state, addToCart, removeFromCart, updateQuantity, clearCart } },
    children
  );
}

// Hook
export function useCartStore(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCartStore must be used within a CartProvider');
  return ctx;
}
