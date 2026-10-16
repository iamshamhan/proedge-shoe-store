'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Minus, Plus } from 'lucide-react';
import { CartItem, useCart } from '@/context/cart-context';
import { formatLKR } from '@/data/products';

interface CartItemRowProps {
  item: CartItem;
}

export function CartItemRow({ item }: CartItemRowProps) {
  const { updateQuantity, removeItem, setIsCartDrawerOpen } = useCart();
  const isAtMaxStock = item.maxStock !== undefined && item.maxStock > 0 && item.quantity >= item.maxStock;

  return (
    <div className="flex items-center gap-4 py-4 border-b border-black/[0.06] dark:border-white/[0.08]">
      {/* Thumbnail Image */}
      <Link
        href={`/product/${item.slug}`}
        onClick={() => setIsCartDrawerOpen(false)}
        className="relative w-20 h-20 rounded-2xl bg-[#f5f5f7] dark:bg-white/[0.05] border border-black/[0.05] dark:border-white/[0.08] shrink-0 overflow-hidden group"
        style={{ position: 'relative' }}
      >
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="80px"
          className="object-cover object-center group-hover:scale-105 transition-transform"
        />
      </Link>

      {/* Item Details */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/product/${item.slug}`}
          onClick={() => setIsCartDrawerOpen(false)}
          className="font-semibold text-sm tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] hover:text-amber-600 dark:hover:text-amber-400 transition-colors line-clamp-1 block"
        >
          {item.name}
        </Link>
        <p className="text-xs text-[#6e6e73] dark:text-[#86868b] mt-0.5 font-normal">
          Size: <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{item.sizeSystem && item.sizeSystem !== 'Custom' ? `${item.sizeSystem} ${item.size}` : item.size}</span> • Colour: <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{item.color}</span>
        </p>

        {/* Quantity Controls */}
        <div className="flex items-center justify-between mt-3">
          <div className="inline-flex items-center border border-black/[0.08] dark:border-white/[0.12] rounded-full p-0.5 bg-white dark:bg-[#1d1d1f]">
            <button
              type="button"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              aria-label="Decrease quantity"
              className="w-6 h-6 rounded-full flex items-center justify-center text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-8 text-center text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              disabled={isAtMaxStock}
              title={isAtMaxStock ? `Max available stock (${item.maxStock}) reached` : 'Increase quantity'}
              aria-label="Increase quantity"
              className="w-6 h-6 rounded-full flex items-center justify-center text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <div className="text-right">
            <span className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] block">
              {formatLKR(item.price * item.quantity)}
            </span>
          </div>
        </div>
      </div>

      {/* Trash Button */}
      <button
        type="button"
        onClick={() => removeItem(item.id)}
        aria-label="Remove item"
        className="p-2 text-[#86868b] hover:text-rose-600 dark:hover:text-rose-400 rounded-full hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors shrink-0"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
