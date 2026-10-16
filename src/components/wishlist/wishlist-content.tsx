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
      <div className="mb-8 border-b border-black/[0.06] dark:border-white/[0.08] pb-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 block">
                PROEDGE Saved
              </span>
            </div>
            <h1 className="mt-1 text-3xl sm:text-5xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-[-0.025em]">
              Your saved styles.
            </h1>
            <p className="mt-2 text-[#6e6e73] dark:text-[#86868b] text-sm sm:text-base">
              {savedProducts.length}{' '}
              {savedProducts.length === 1 ? 'style saved' : 'styles saved'}
              {savedProducts.length > 0 ? ' — tap the heart on any card to remove it.' : ''}
            </p>
          </div>

          {savedProducts.length > 0 && (
            <button
              type="button"
              onClick={clearWishlist}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-black/[0.08] dark:border-white/[0.12] bg-white dark:bg-[#1d1d1f] px-4 py-2.5 text-xs font-semibold text-[#6e6e73] dark:text-[#86868b] transition-colors hover:border-rose-300 dark:hover:border-rose-800 hover:text-rose-600 dark:hover:text-rose-400 soft-shadow"
            >
              <Trash2 className="h-4 w-4" />
              Clear Saved
            </button>
          )}
        </div>
      </div>

      {savedProducts.length === 0 ? (
        <div className="bg-white dark:bg-[#1d1d1f] border border-black/[0.05] dark:border-white/[0.08] rounded-[32px] px-6 py-16 text-center soft-shadow">
          <div className="w-20 h-20 mx-auto rounded-full bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6">
            <Heart className="w-10 h-10" />
          </div>
          <h2 className="text-xl sm:text-3xl font-semibold tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7]">
            Your saved list is empty.
          </h2>
          <p className="mt-2 text-[#6e6e73] dark:text-[#86868b] text-sm sm:text-base max-w-sm mx-auto">
            Tap the heart icon on any product to save it here for later.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 mt-8 px-8 py-4 bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f] font-semibold text-sm tracking-tight rounded-full hover:bg-amber-500 dark:hover:bg-amber-400 hover:text-zinc-950 transition-all soft-shadow"
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