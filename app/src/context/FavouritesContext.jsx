import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getWishlist,
  addToWishlist as apiAdd,
  removeFromWishlist as apiRemove,
} from '../services/wishlistService';

const FavouritesContext = createContext(null);

const GUEST_KEY = 'fuel_store_favourites';
const TOKEN_KEY = 'fuel_store_token';

function isLoggedIn() {
  return !!localStorage.getItem(TOKEN_KEY);
}

export function FavouritesProvider({ children }) {
  const [favourites, setFavourites] = useState([]);

  // ─── Load on mount ───────────────────────────────────────────────
  const loadFavourites = useCallback(async () => {
    if (isLoggedIn()) {
      try {
        const items = await getWishlist();
        setFavourites(items || []);
      } catch (err) {
        console.error('[FavouritesContext] Failed to load wishlist:', err);
      }
    } else {
      try {
        const saved = localStorage.getItem(GUEST_KEY);
        if (saved) setFavourites(JSON.parse(saved));
      } catch (e) {
        console.error('[FavouritesContext] Failed to parse guest wishlist:', e);
      }
    }
  }, []);

  useEffect(() => {
    loadFavourites();
  }, [loadFavourites]);

  // ─── Toggle ──────────────────────────────────────────────────────
  const toggleFavourite = async (product) => {
    const alreadyIn = favourites.some(p => p.id === product.id);

    if (isLoggedIn()) {
      try {
        let updated;
        if (alreadyIn) {
          updated = await apiRemove(product.id);
        } else {
          updated = await apiAdd(product.id);
        }
        setFavourites(updated || []);
      } catch (err) {
        console.error('[FavouritesContext] Toggle failed:', err);
      }
    } else {
      setFavourites(prev => {
        const next = alreadyIn
          ? prev.filter(p => p.id !== product.id)
          : [...prev, product];
        localStorage.setItem(GUEST_KEY, JSON.stringify(next));
        return next;
      });
    }
  };

  const isFavourite = (productId) => favourites.some(p => p.id === productId);

  // Expose refresh for post-login sync
  const refreshFavourites = () => loadFavourites();

  return (
    <FavouritesContext.Provider value={{ favourites, toggleFavourite, isFavourite, refreshFavourites }}>
      {children}
    </FavouritesContext.Provider>
  );
}

export function useFavourites() {
  const context = useContext(FavouritesContext);
  if (!context) {
    throw new Error('useFavourites must be used within a FavouritesProvider');
  }
  return context;
}
