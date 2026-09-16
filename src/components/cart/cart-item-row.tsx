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
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex items-center gap-4 py-4 border-b border-zinc-200">
      {/* Thumbnail Image */}
      <Link href={`/product/${item.slug}`} className="relative w-20 h-20 rounded-xl bg-zinc-100 border border-zinc-200 shrink-0 overflow-hidden group">
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
        <Link href={`/product/${item.slug}`} className="font-bold text-sm text-zinc-900 hover:text-amber-600 transition-colors line-clamp-1 block">
          {item.name}
        </Link>
        <p className="text-xs text-zinc-500 mt-0.5 font-medium">
          Size: <span className="font-bold text-zinc-800">EU {item.size}</span> • Colour: <span className="font-bold text-zinc-800">{item.color}</span>
        </p>

        {/* Quantity Controls */}
        <div className="flex items-center justify-between mt-3">
          <div className="inline-flex items-center border border-zinc-300 rounded-lg p-0.5 bg-white">
            <button
              type="button"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              aria-label="Decrease quantity"
              className="w-6 h-6 rounded flex items-center justify-center text-zinc-600 hover:bg-zinc-100"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-8 text-center text-xs font-bold text-zinc-900">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              aria-label="Increase quantity"
              className="w-6 h-6 rounded flex items-center justify-center text-zinc-600 hover:bg-zinc-100"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <div className="text-right">
            <span className="text-sm font-extrabold text-zinc-900 block">
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
        className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg transition-colors shrink-0"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
