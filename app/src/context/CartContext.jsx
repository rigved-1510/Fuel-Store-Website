import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getCart,
  addCartItem,
  updateCartItem as apiUpdateCartItem,
  removeCartItem as apiRemoveCartItem,
  clearCartOnServer,
} from '../services/cartService';

const CartContext = createContext(null);

const GUEST_CART_KEY = 'fuel_store_cart';
const TOKEN_KEY = 'fuel_store_token';

// ─── Helpers ──────────────────────────────────────────────────────────

function calcTotals(items) {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal === 0 || subtotal >= 1500 ? 0 : 150;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  return { subtotal, shipping, tax, total: subtotal + shipping + tax };
}

function isLoggedIn() {
  return !!localStorage.getItem(TOKEN_KEY);
}

// ─── Provider ─────────────────────────────────────────────────────────

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [totals, setTotals] = useState({ subtotal: 0, shipping: 0, tax: 0, total: 0 });
  const [isCartLoading, setIsCartLoading] = useState(false);

  // Derived count for nav badge
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // ─── Load cart on mount and on auth change ───────────────────────
  const loadCart = useCallback(async () => {
    if (isLoggedIn()) {
      try {
        setIsCartLoading(true);
        const data = await getCart();
        setItems(data.items || []);
        setTotals({
          subtotal: data.subtotal || 0,
          shipping: data.shipping || 0,
          tax: data.tax || 0,
          total: data.total || 0,
        });
      } catch (err) {
        console.error('[CartContext] Failed to load server cart:', err);
      } finally {
        setIsCartLoading(false);
      }
    } else {
      // Guest: restore from localStorage
      try {
        const saved = localStorage.getItem(GUEST_CART_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setItems(parsed);
          setTotals(calcTotals(parsed));
        }
      } catch (e) {
        console.error('[CartContext] Failed to parse guest cart:', e);
      }
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // ─── ADD TO CART ─────────────────────────────────────────────────
  const addToCart = async (product, quantity, size) => {
    if (isLoggedIn()) {
      try {
        const data = await addCartItem(product.id, size, quantity);
        setItems(data.items || []);
        setTotals({ subtotal: data.subtotal, shipping: data.shipping, tax: data.tax, total: data.total });
      } catch (err) {
        throw err; // Let the calling component handle and display the error
      }
    } else {
      // Guest path: merge into local state
      setItems(prev => {
        const idx = prev.findIndex(i => i.product.id === product.id && i.size === size);
        let next;
        if (idx > -1) {
          next = [...prev];
          next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity };
        } else {
          next = [...prev, { product, quantity, size }];
        }
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(next));
        setTotals(calcTotals(next));
        return next;
      });
    }
  };

  // ─── REMOVE FROM CART ────────────────────────────────────────────
  const removeFromCart = async (productId, size) => {
    if (isLoggedIn()) {
      // Find the cart item id (server uses cart_items.id)
      const item = items.find(i => i.product.id === productId && i.size === size);
      if (!item) return;
      try {
        const data = await apiRemoveCartItem(item.id);
        setItems(data.items || []);
        setTotals({ subtotal: data.subtotal, shipping: data.shipping, tax: data.tax, total: data.total });
      } catch (err) {
        console.error('[CartContext] Remove failed:', err);
      }
    } else {
      setItems(prev => {
        const next = prev.filter(i => !(i.product.id === productId && i.size === size));
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(next));
        setTotals(calcTotals(next));
        return next;
      });
    }
  };

  // ─── UPDATE QUANTITY ─────────────────────────────────────────────
  const updateQuantity = async (productId, size, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    if (isLoggedIn()) {
      const item = items.find(i => i.product.id === productId && i.size === size);
      if (!item) return;
      try {
        const data = await apiUpdateCartItem(item.id, quantity);
        setItems(data.items || []);
        setTotals({ subtotal: data.subtotal, shipping: data.shipping, tax: data.tax, total: data.total });
      } catch (err) {
        console.error('[CartContext] Update quantity failed:', err);
      }
    } else {
      setItems(prev => {
        const next = prev.map(i =>
          i.product.id === productId && i.size === size ? { ...i, quantity } : i
        );
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(next));
        setTotals(calcTotals(next));
        return next;
      });
    }
  };

  // ─── CLEAR CART ──────────────────────────────────────────────────
  const clearCart = async () => {
    if (isLoggedIn()) {
      try {
        await clearCartOnServer();
      } catch (err) {
        console.error('[CartContext] Clear cart failed:', err);
      }
    }
    setItems([]);
    setTotals({ subtotal: 0, shipping: 0, tax: 0, total: 0 });
    localStorage.removeItem(GUEST_CART_KEY);
  };

  // ─── REFRESH CART (after login / checkout) ───────────────────────
  const refreshCart = () => loadCart();

  const value = {
    items,
    totalItems,
    subtotal: totals.subtotal,
    shipping: totals.shipping,
    tax: totals.tax,
    total: totals.total,
    isCartLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
