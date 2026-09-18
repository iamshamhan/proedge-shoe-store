'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ArrowRight, Trash2 } from 'lucide-react';
import { Product } from '@/types/product';
import { useWishlist } from '@/context/wishlist-context';
import { ProductGrid } from '@/components/ui/product-grid';

interface WishlistContentProps {
  allProducts: Product[];
}

export function WishlistContent({ allProducts }: WishlistContentProps) {
  const { productIds, clearWishlist } = useWishlist();

  const savedProducts = allProducts.filter((p) => productIds.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest block">
                PROEDGE Wishlist
              </span>
            </div>
            <h1 className="mt-1 text-3xl sm:text-5xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
              Your Saved Styles
            </h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400 text-sm sm:text-base">
              {savedProducts.length}{' '}
              {savedProducts.length === 1 ? 'style saved' : 'styles saved'}
              {savedProducts.length > 0 ? ' — tap the heart on any card to remove it.' : ''}
            </p>
          </div>

          {savedProducts.length > 0 && (
            <button
              type="button"
              onClick={clearWishlist}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 transition-colors hover:border-rose-300 dark:hover:border-rose-800 hover:text-rose-600 dark:hover:text-rose-400"
            >
              <Trash2 className="h-4 w-4" />
              Clear Wishlist
            </button>
          )}
        </div>
      </div>

      {savedProducts.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-6 py-16 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6">
            <Heart className="w-10 h-10" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
            Your wishlist is empty
          </h2>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400 text-sm sm:text-base max-w-sm mx-auto">
            Tap the heart icon on any product to save it here for later.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 mt-8 px-8 py-4 bg-zinc-900 dark:bg-amber-500 text-white dark:text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl hover:bg-amber-600 dark:hover:bg-amber-400 hover:text-zinc-950 transition-all shadow-md"
          >
            <span>Browse Footwear</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <ProductGrid products={savedProducts} />
      )}
    </div>
  );
}