'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

interface WishlistContextType {
  productIds: string[];
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (productId: string) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'proedge_wishlist_v1';

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [productIds, setProductIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as unknown;
          if (Array.isArray(parsed)) {
            setProductIds(parsed.filter((id): id is string => typeof id === 'string'));
          }
        }
      } catch (err) {
        console.error('Failed to parse wishlist from localStorage:', err);
      } finally {
        setIsLoaded(true);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(productIds));
    } catch (err) {
      console.error('Failed to save wishlist to localStorage:', err);
    }
  }, [productIds, isLoaded]);

  const isWishlisted = useCallback(
    (productId: string) => productIds.includes(productId),
    [productIds]
  );

  const toggleWishlist = useCallback((productId: string) => {
    setProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  }, []);

  const clearWishlist = useCallback(() => setProductIds([]), []);

  const contextValue = useMemo(
    () => ({
      productIds,
      isWishlisted,
      toggleWishlist,
      clearWishlist,
    }),
    [productIds, isWishlisted, toggleWishlist, clearWishlist]
  );

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}