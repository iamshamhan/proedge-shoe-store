'use client';

import React, { useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, ShoppingBag, ArrowRight, Truck, CheckCircle2 } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { useStoreSettings } from '@/context/settings-context';
import { CartItemRow } from '@/components/cart/cart-item-row';
import { formatLKR } from '@/data/products';

export function CartDrawer() {
  const pathname = usePathname();
  const { items, isCartDrawerOpen, setIsCartDrawerOpen, subtotal, totalItemsCount } = useCart();
  const { freeDeliveryEnabled, freeDeliveryThreshold } = useStoreSettings();

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

  if (!isCartDrawerOpen || pathname.startsWith('/admin')) return null;

  const threshold = freeDeliveryThreshold || 30000;
  const remainingForFree = Math.max(0, threshold - subtotal);
  const progressPct = Math.min(100, Math.round((subtotal / threshold) * 100));

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
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 h-full shadow-2xl flex flex-col z-10 transition-colors animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-zinc-900 dark:text-white leading-none">
                Your Bag ({totalItemsCount})
              </h2>
              <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
                Ready for instant WhatsApp checkout
              </p>
            </div>
          </div>
          <button
            type="button"
            autoFocus
            onClick={close}
            aria-label="Close cart drawer"
            className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Delivery Progress Bar */}
        {freeDeliveryEnabled && items.length > 0 && (
          <div className="px-6 py-3.5 bg-zinc-50 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800">
            {remainingForFree > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    Add <strong className="font-black text-zinc-900 dark:text-white">{formatLKR(remainingForFree)}</strong> more for <strong className="text-emerald-600 dark:text-emerald-400">FREE Delivery</strong>
                  </span>
                  <span className="text-[11px] font-bold text-zinc-400">{progressPct}%</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Unlocked! Your order qualifies for FREE Islandwide Delivery.</span>
              </div>
            )}
          </div>
        )}

        {/* Drawer Body (Items List) */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
              <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-base text-zinc-900 dark:text-white uppercase">
                  Your bag is empty
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Explore our engineered PROEDGE footwear &amp; gear collection.
                </p>
              </div>
              <Link
                href="/shop"
                onClick={close}
                className="px-6 py-3 bg-zinc-900 dark:bg-amber-500 text-white dark:text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-full hover:bg-amber-600 dark:hover:bg-amber-400 hover:text-zinc-950 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500"
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
          <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Subtotal
              </span>
              <span className="text-lg font-black text-zinc-900 dark:text-white">
                {formatLKR(subtotal)}
              </span>
            </div>

            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 text-center">
              Islandwide courier delivery calculated at checkout.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/cart"
                onClick={close}
                className="py-3.5 px-4 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-extrabold text-xs uppercase tracking-wider rounded-full text-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                View Bag
              </Link>

              <Link
                href="/checkout"
                onClick={close}
                className="py-3.5 px-4 bg-zinc-900 dark:bg-amber-500 text-white dark:text-zinc-950 font-black text-xs uppercase tracking-wider rounded-full text-center hover:bg-amber-600 dark:hover:bg-amber-400 hover:text-zinc-950 transition-all flex items-center justify-center gap-1.5 soft-shadow focus-visible:ring-2 focus-visible:ring-amber-500"
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