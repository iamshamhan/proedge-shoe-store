'use client';

import { useCartAvailability } from './use-cart-availability';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowLeft, ShoppingBag, Trash2, Minus, Plus, Truck } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { useStoreSettings } from '@/context/settings-context';
import { formatLKR } from '@/lib/currency';
import { getDeliveryFee } from '@/lib/config';

export function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const settings = useStoreSettings();
  const availability = useCartAvailability(items);

  const deliveryFee = getDeliveryFee(subtotal, settings);
  const total = subtotal + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="py-16 sm:py-24 bg-[#f5f5f7] dark:bg-[#000000] min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white dark:bg-[#1d1d1f] border border-black/[0.05] dark:border-white/[0.08] rounded-[32px] p-10 sm:p-16 soft-shadow">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#f5f5f7] dark:bg-white/[0.06] flex items-center justify-center text-[#86868b] mb-6">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-semibold tracking-[-0.025em] text-[#1d1d1f] dark:text-[#f5f5f7]">
              Your bag is empty.
            </h1>
            <p className="mt-2 text-[#6e6e73] dark:text-[#86868b] text-sm sm:text-base">
              Explore our footwear collection and find your next pair.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 mt-8 px-8 py-4 bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f] font-semibold text-sm tracking-tight rounded-full hover:bg-amber-500 dark:hover:bg-amber-400 hover:text-zinc-950 transition-all soft-shadow"
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
    <div className="py-10 sm:py-16 bg-[#f5f5f7] dark:bg-[#000000] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 border-b border-black/[0.06] dark:border-white/[0.08] pb-8">
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 block mb-1.5">
            PROEDGE Bag
          </span>
          <h1 className="text-3xl sm:text-5xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-[-0.025em]">
            Review your bag.
          </h1>
          <p className="mt-2 text-[#6e6e73] dark:text-[#86868b] text-sm sm:text-base">
            {items.length} {items.length === 1 ? 'item' : 'items'} in your bag — free islandwide delivery on qualifying orders.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Items Column */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-[#1d1d1f] rounded-[28px] border border-black/[0.05] dark:border-white/[0.08] p-4 sm:p-6 flex items-start gap-4 sm:gap-6 soft-shadow"
              >
                {/* Thumbnail */}
                <Link
                  href={`/product/${item.slug}`}
                  className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#f5f5f7] dark:bg-white/[0.05] border border-black/[0.05] dark:border-white/[0.08] shrink-0 overflow-hidden"
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
                        className="font-semibold text-base sm:text-lg tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] hover:text-amber-600 dark:hover:text-amber-400 transition-colors block"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs text-[#6e6e73] dark:text-[#86868b] mt-1 font-normal">
                        Size: <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{item.sizeSystem && item.sizeSystem !== 'Custom' ? `${item.sizeSystem} ${item.size}` : item.size}</span>
                        {' '}• Colour: <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{item.color}</span>
                      </p>
                      <p className="text-xs text-[#86868b] mt-0.5">
                        {formatLKR(item.price)} / unit
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      aria-label={`Remove ${item.name} from cart`}
                      className="p-2 text-[#86868b] hover:text-rose-600 dark:hover:text-rose-400 rounded-full hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3 sm:mt-4">
                    {/* Quantity Controls */}
                    <div className="inline-flex items-center bg-[#f5f5f7] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.1] rounded-full p-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        aria-label="Decrease quantity"
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-white dark:hover:bg-white/[0.1] transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
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
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-white dark:hover:bg-white/[0.1] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="text-base sm:text-lg font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
                      {formatLKR(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue Shopping */}
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] hover:text-amber-600 dark:hover:text-amber-400 transition-colors pt-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>

          {/* Order Summary Column */}
          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-[#1d1d1f] rounded-[28px] border border-black/[0.05] dark:border-white/[0.08] p-6 sm:p-7 soft-shadow lg:sticky lg:top-28 space-y-5">
              <h2 className="text-xl font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] border-b border-black/[0.06] dark:border-white/[0.08] pb-4">
                Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#6e6e73] dark:text-[#86868b]">Subtotal</span>
                  <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{formatLKR(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6e6e73] dark:text-[#86868b] flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-amber-500" />
                    Delivery Fee
                  </span>
                  {deliveryFee === 0 ? (
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">FREE</span>
                  ) : (
                    <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{formatLKR(deliveryFee)}</span>
                  )}
                </div>
              </div>

              {settings.freeDeliveryEnabled && settings.freeDeliveryThreshold > 0 && (
                <div className="rounded-2xl bg-[#f5f5f7] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.08] px-4 py-3.5 space-y-2">
                  {deliveryFee > 0 ? (
                    <p className="text-xs text-[#6e6e73] dark:text-[#86868b] font-normal">
                      Add <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{formatLKR(Math.max(0, settings.freeDeliveryThreshold - subtotal))}</span> more to unlock{' '}
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">Free islandwide delivery</span>.
                    </p>
                  ) : (
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                      You unlocked Free Islandwide Delivery!
                    </p>
                  )}
                  <div className="h-1.5 w-full rounded-full bg-black/[0.08] dark:bg-white/[0.1] overflow-hidden">
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

              <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
                <span className="text-sm font-medium text-[#6e6e73] dark:text-[#86868b]">
                  Total
                </span>
                <span className="text-2xl font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">{formatLKR(total)}</span>
              </div>

              {availability.checking && <p role="status">Checking current availability...</p>}
              {availability.error && <p role="alert" className="text-sm text-rose-600">
                {availability.error}{' '}<button type="button" onClick={availability.retry} className="underline">Check again</button>
              </p>}
              <Link
                aria-disabled={availability.checking || Boolean(availability.error)}
                onClick={event => { if (availability.checking || availability.error) event.preventDefault(); }}
                href="/checkout"
                className="w-full py-4 bg-[#1d1d1f] dark:bg-amber-500 text-white dark:text-zinc-950 font-semibold text-[15px] tracking-tight rounded-full hover:bg-amber-500 dark:hover:bg-amber-400 hover:text-zinc-950 transition-all flex items-center justify-center gap-2 soft-shadow"
              >
                <span>Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <p className="text-xs text-[#6e6e73] dark:text-[#86868b] text-center">
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
