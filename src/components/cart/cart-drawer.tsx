'use client';

import React, { useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, ShoppingBag, ArrowRight, Truck, CheckCircle2 } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { useStoreSettings } from '@/context/settings-context';
import { CartItemRow } from '@/components/cart/cart-item-row';
import { formatLKR } from '@/lib/currency';

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
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={close}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md bg-white/95 dark:bg-[#1d1d1f]/95 apple-glass h-full shadow-2xl flex flex-col z-10 transition-colors animate-in slide-in-from-right duration-200 border-l border-black/[0.06] dark:border-white/[0.08]">
        
        {/* Drawer Header */}
        <div className="p-5 sm:p-6 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7] leading-none">
                Your Bag ({totalItemsCount})
              </h2>
              <p className="text-xs font-normal text-[#6e6e73] dark:text-[#86868b] mt-1">
                Ready for instant WhatsApp checkout
              </p>
            </div>
          </div>
          <button
            type="button"
            autoFocus
            onClick={close}
            aria-label="Close cart drawer"
            className="p-2 text-[#6e6e73] hover:text-[#1d1d1f] dark:hover:text-white rounded-full bg-black/[0.04] dark:bg-white/[0.08] transition-colors focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Free Delivery Progress Bar */}
        {freeDeliveryEnabled && items.length > 0 && (
          <div className="px-6 py-3.5 bg-[#f5f5f7] dark:bg-white/[0.03] border-b border-black/[0.05] dark:border-white/[0.08]">
            {remainingForFree > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#6e6e73] dark:text-[#86868b] flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    Add <strong className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{formatLKR(remainingForFree)}</strong> more for <strong className="text-emerald-600 dark:text-emerald-400">Free Delivery</strong>
                  </span>
                  <span className="text-[11px] font-semibold text-[#86868b]">{progressPct}%</span>
                </div>
                <div className="w-full h-1.5 bg-black/[0.08] dark:bg-white/[0.1] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Unlocked! Your order qualifies for Free Islandwide Delivery.</span>
              </div>
            )}
          </div>
        )}

        {/* Drawer Body (Items List) */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
              <div className="w-16 h-16 rounded-full bg-[#f5f5f7] dark:bg-white/[0.06] flex items-center justify-center text-[#86868b]">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-lg tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
                  Your bag is empty.
                </h3>
                <p className="text-xs text-[#6e6e73] dark:text-[#86868b]">
                  Explore our engineered PROEDGE footwear &amp; gear collection.
                </p>
              </div>
              <Link
                href="/shop"
                onClick={close}
                className="px-6 py-3 bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f] font-semibold text-xs tracking-tight rounded-full hover:bg-amber-500 dark:hover:bg-amber-400 hover:text-zinc-950 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500"
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
          <div className="p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] border-t border-black/[0.06] dark:border-white/[0.08] bg-[#f5f5f7]/80 dark:bg-black/40 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#6e6e73] dark:text-[#86868b]">
                Subtotal
              </span>
              <span className="text-xl font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
                {formatLKR(subtotal)}
              </span>
            </div>

            <p className="text-xs text-[#6e6e73] dark:text-[#86868b] text-center">
              Islandwide courier delivery calculated at checkout.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/cart"
                onClick={close}
                className="py-3.5 px-4 bg-white dark:bg-[#1d1d1f] border border-black/[0.08] dark:border-white/[0.12] text-[#1d1d1f] dark:text-[#f5f5f7] font-semibold text-sm tracking-tight rounded-full text-center hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                View Bag
              </Link>

              <Link
                href="/checkout"
                onClick={close}
                className="py-3.5 px-4 bg-[#1d1d1f] dark:bg-amber-500 text-white dark:text-zinc-950 font-semibold text-sm tracking-tight rounded-full text-center hover:bg-amber-500 dark:hover:bg-amber-400 hover:text-zinc-950 transition-all flex items-center justify-center gap-1.5 soft-shadow focus-visible:ring-2 focus-visible:ring-amber-500"
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