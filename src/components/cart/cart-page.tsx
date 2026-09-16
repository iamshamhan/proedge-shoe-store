'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowLeft, ShoppingBag, Trash2, Minus, Plus, Truck } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { formatLKR } from '@/data/products';
import { getDeliveryFee, STORE_CONFIG } from '@/lib/config';

export function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();

  const deliveryFee = getDeliveryFee(subtotal);
  const total = subtotal + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="py-16 sm:py-24 bg-zinc-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white border border-zinc-200 rounded-3xl p-10 sm:p-16 shadow-xs">
            <div className="w-20 h-20 mx-auto rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mb-6">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-900">
              Your cart is empty
            </h1>
            <p className="mt-2 text-zinc-500 text-sm sm:text-base">
              Explore our footwear collection and find your next pair.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 mt-8 px-8 py-4 bg-zinc-900 text-white font-black text-xs uppercase tracking-wider rounded-xl hover:bg-amber-600 hover:text-zinc-950 transition-all shadow-md"
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
    <div className="py-10 sm:py-16 bg-zinc-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 border-b border-zinc-200 pb-8">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block mb-1">
            PROEDGE Cart
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-zinc-900 uppercase tracking-tight">
            Shopping Cart
          </h1>
          <p className="mt-2 text-zinc-500 text-sm sm:text-base">
            {items.length} {items.length === 1 ? 'item' : 'items'} in your bag — review before checkout.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Items Column */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 flex items-start gap-4 sm:gap-6 shadow-xs"
              >
                {/* Thumbnail */}
                <Link
                  href={`/product/${item.slug}`}
                  className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-zinc-100 border border-zinc-200 shrink-0 overflow-hidden"
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
                        className="font-bold text-sm sm:text-base text-zinc-900 hover:text-amber-600 transition-colors block"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs text-zinc-500 mt-1 font-medium">
                        Size: <span className="font-bold text-zinc-800">EU {item.size}</span>
                        {' '}• Colour: <span className="font-bold text-zinc-800">{item.color}</span>
                      </p>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {formatLKR(item.price)} / unit
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      aria-label={`Remove ${item.name} from cart`}
                      className="p-2 text-zinc-400 hover:text-rose-600 rounded-lg transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3 sm:mt-4">
                    {/* Quantity Controls */}
                    <div className="inline-flex items-center bg-white border border-zinc-300 rounded-xl p-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        aria-label="Decrease quantity"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-600 hover:bg-zinc-100 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm font-black text-zinc-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        aria-label="Increase quantity"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-600 hover:bg-zinc-100 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="text-sm sm:text-base font-extrabold text-zinc-900">
                      {formatLKR(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue Shopping */}
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-sm font-bold text-zinc-700 hover:text-amber-600 transition-colors pt-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>

          {/* Order Summary Column */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs lg:sticky lg:top-28 space-y-4">
              <h2 className="text-lg font-black uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-4">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 font-medium">Subtotal</span>
                  <span className="font-bold text-zinc-900">{formatLKR(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 font-medium flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-amber-500" />
                    Delivery Fee
                  </span>
                  {deliveryFee === 0 ? (
                    <span className="font-bold text-emerald-600">FREE</span>
                  ) : (
                    <span className="font-bold text-zinc-900">{formatLKR(deliveryFee)}</span>
                  )}
                </div>
              </div>

              {deliveryFee > 0 && (
                <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-900 font-medium">
                  Add {formatLKR(STORE_CONFIG.freeDeliveryThreshold - subtotal)} more to unlock
                  free islandwide delivery.
                </div>
              )}

              <div className="pt-4 border-t border-zinc-200 flex items-center justify-between">
                <span className="text-sm font-bold uppercase tracking-wider text-zinc-600">
                  Total
                </span>
                <span className="text-2xl font-black text-zinc-900">{formatLKR(total)}</span>
              </div>

              <Link
                href="/checkout"
                className="w-full py-4 bg-zinc-900 text-white font-black text-sm uppercase tracking-wider rounded-xl hover:bg-amber-600 hover:text-zinc-950 transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <p className="text-[11px] text-zinc-400 text-center">
                Delivery fee applies to orders under {formatLKR(STORE_CONFIG.freeDeliveryThreshold)}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}