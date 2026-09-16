'use client';

import React, { useEffect, useCallback } from 'react';
import Link from 'next/link';
import { X, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { CartItemRow } from '@/components/cart/cart-item-row';
import { formatLKR } from '@/data/products';

export function CartDrawer() {
  const { items, isCartDrawerOpen, setIsCartDrawerOpen, subtotal, totalItemsCount } = useCart();

  const close = useCallback(() => setIsCartDrawerOpen(false), [setIsCartDrawerOpen]);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!isCartDrawerOpen) return;
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollY);
    };
  }, [isCartDrawerOpen]);

  // Close on Escape key.
  useEffect(() => {
    if (!isCartDrawerOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isCartDrawerOpen, close]);

  if (!isCartDrawerOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Shopping cart"
      className="fixed inset-0 z-50 flex justify-end"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={close}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10">
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-black uppercase tracking-wider text-zinc-900">
              Shopping Cart ({totalItemsCount})
            </h2>
          </div>
          <button
            type="button"
            autoFocus
            onClick={close}
            aria-label="Close cart drawer"
            className="p-2 text-zinc-400 hover:text-zinc-900 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-zinc-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body (Items List) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
              <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-base text-zinc-900 uppercase">
                  Your cart is empty
                </h3>
                <p className="text-xs text-zinc-500">
                  Explore our engineered PROEDGE footwear collection.
                </p>
              </div>
              <Link
                href="/shop"
                onClick={close}
                className="px-6 py-3 bg-zinc-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-amber-600 hover:text-zinc-950 transition-colors focus-visible:ring-2 focus-visible:ring-zinc-900"
              >
                Shop Now
              </Link>
            </div>
          ) : (
            items.map((item) => <CartItemRow key={item.id} item={item} />)
          )}
        </div>

        {/* Drawer Footer (Subtotal & Actions) */}
        {items.length > 0 && (
          <div className="p-6 border-t border-zinc-200 bg-zinc-50 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                Subtotal
              </span>
              <span className="text-lg font-black text-zinc-900">
                {formatLKR(subtotal)}
              </span>
            </div>

            <p className="text-[11px] text-zinc-400 text-center">
              Taxes and islandwide delivery calculated at checkout.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/cart"
                onClick={close}
                className="py-3.5 px-4 bg-white border border-zinc-300 text-zinc-900 font-extrabold text-xs uppercase tracking-wider rounded-xl text-center hover:bg-zinc-100 transition-colors focus-visible:ring-2 focus-visible:ring-zinc-900"
              >
                View Cart
              </Link>

              <Link
                href="/checkout"
                onClick={close}
                className="py-3.5 px-4 bg-zinc-900 text-white font-black text-xs uppercase tracking-wider rounded-xl text-center hover:bg-amber-600 hover:text-zinc-950 transition-all flex items-center justify-center gap-1.5 shadow-md focus-visible:ring-2 focus-visible:ring-zinc-900"
              >
                <span>Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}