'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowLeft, ShoppingBag, Trash2, Minus, Plus, Truck } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { useStoreSettings } from '@/context/settings-context';
import { formatLKR } from '@/data/products';
import { getDeliveryFee } from '@/lib/config';

export function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const settings = useStoreSettings();

  const deliveryFee = getDeliveryFee(subtotal, settings);
  const total = subtotal + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="py-16 sm:py-24 bg-zinc-50 dark:bg-zinc-950 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-10 sm:p-16 shadow-xs">
            <div className="w-20 h-20 mx-auto rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500 mb-6">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
              Your cart is empty
            </h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400 text-sm sm:text-base">
              Explore our footwear collection and find your next pair.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 mt-8 px-8 py-4 bg-zinc-900 dark:bg-amber-500 text-white dark:text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl hover:bg-amber-600 dark:hover:bg-amber-400 hover:text-zinc-950 transition-all shadow-md"
            >
              <span>Shop Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 sm:py-16 bg-zinc-50 dark:bg-zinc-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-8">
          <span className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest block mb-1">
            PROEDGE Cart
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
            Shopping Cart
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400 text-sm sm:text-base">
            {items.length} {items.length === 1 ? 'item' : 'items'} in your bag — review before checkout.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Items Column */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-5 flex items-start gap-4 sm:gap-6 shadow-xs"
              >
                {/* Thumbnail */}
                <Link
                  href={`/product/${item.slug}`}
                  className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 shrink-0 overflow-hidden"
                  style={{ position: 'relative' }}
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="96px"
                    className="object-cover object-center"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        href={`/product/${item.slug}`}
                        className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors block"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                        Size: <span className="font-bold text-zinc-800 dark:text-zinc-200">{item.sizeSystem && item.sizeSystem !== 'Custom' ? `${item.sizeSystem} ${item.size}` : item.size}</span>
                        {' '}• Colour: <span className="font-bold text-zinc-800 dark:text-zinc-200">{item.color}</span>
                      </p>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                        {formatLKR(item.price)} / unit
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      aria-label={`Remove ${item.name} from cart`}
                      className="p-2 text-zinc-400 dark:text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3 sm:mt-4">
                    {/* Quantity Controls */}
                    <div className="inline-flex items-center bg-white dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 rounded-xl p-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        aria-label="Decrease quantity"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm font-black text-zinc-900 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.maxStock !== undefined && item.quantity >= item.maxStock}
                        aria-label="Increase quantity"
                        title={
                          item.maxStock !== undefined && item.quantity >= item.maxStock
                            ? `Maximum available stock (${item.maxStock}) reached`
                            : 'Increase quantity'
                        }
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-white">
                      {formatLKR(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue Shopping */}
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors pt-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>

          {/* Order Summary Column */}
          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs lg:sticky lg:top-28 space-y-4">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-4">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400 font-medium">Subtotal</span>
                  <span className="font-bold text-zinc-900 dark:text-white">{formatLKR(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-amber-500" />
                    Delivery Fee
                  </span>
                  {deliveryFee === 0 ? (
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">FREE</span>
                  ) : (
                    <span className="font-bold text-zinc-900 dark:text-white">{formatLKR(deliveryFee)}</span>
                  )}
                </div>
              </div>

              {settings.freeDeliveryEnabled && settings.freeDeliveryThreshold > 0 && (
                <div className="rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 px-4 py-3 space-y-2">
                  {deliveryFee > 0 ? (
                    <p className="text-xs text-amber-900 dark:text-amber-300 font-medium">
                      Add <span className="font-black">{formatLKR(Math.max(0, settings.freeDeliveryThreshold - subtotal))}</span> more to unlock{' '}
                      <span className="font-bold">FREE islandwide delivery</span>.
                    </p>
                  ) : (
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                      You unlocked FREE Islandwide Delivery!
                    </p>
                  )}
                  <div className="h-1.5 w-full rounded-full bg-amber-200/60 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        deliveryFee === 0 ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{
                        width: `${Math.min(100, Math.round((subtotal / settings.freeDeliveryThreshold) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  Total
                </span>
                <span className="text-2xl font-black text-zinc-900 dark:text-white">{formatLKR(total)}</span>
              </div>

              <Link
                href="/checkout"
                className="w-full py-4 bg-zinc-900 dark:bg-amber-500 text-white dark:text-zinc-950 font-black text-sm uppercase tracking-wider rounded-xl hover:bg-amber-600 dark:hover:bg-amber-400 hover:text-zinc-950 transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 text-center">
                {settings.freeDeliveryEnabled
                  ? `Free delivery applies to orders over ${formatLKR(settings.freeDeliveryThreshold)}.`
                  : 'Standard islandwide delivery applies to all orders.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
