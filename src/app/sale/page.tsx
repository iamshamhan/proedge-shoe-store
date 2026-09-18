export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import { getSaleProducts } from '@/lib/supabase/products';
import { getStoreSettings } from '@/lib/settings';
import { ProductGrid } from '@/components/ui/product-grid';
import { Tag, Sparkles, ArrowRight } from 'lucide-react';
import { pageMetadata } from '@/lib/site';

export const metadata = pageMetadata({
  title: 'Sale & Special Offers',
  description: 'Shop PROEDGE footwear sale items with exclusive discounts in Sri Lanka. Islandwide courier delivery included.',
  path: '/sale',
});

export default async function SalePage() {
  const [saleProducts, settings] = await Promise.all([
    getSaleProducts(),
    getStoreSettings(),
  ]);

  const discountPercent = settings.saleDiscountPercent ?? 30;
  const isSaleActive = settings.saleEnabled !== false;

  return (
    <div className="py-12 sm:py-20 bg-zinc-50 dark:bg-zinc-950 min-h-screen text-zinc-900 dark:text-zinc-100 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Sale Header Banner */}
        {isSaleActive ? (
          <div className="bg-zinc-950 text-white rounded-3xl p-8 sm:p-12 mb-12 border border-zinc-800 shadow-2xl relative overflow-hidden text-center sm:text-left">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500 text-zinc-950 text-xs font-black uppercase tracking-widest">
                <Tag className="w-3.5 h-3.5" />
                <span>Limited Stock Sale</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-none">
                STEP INTO THE SALE
              </h1>

              <p className="text-zinc-300 text-sm sm:text-base font-medium">
                Save up to <span className="text-amber-400 font-bold">{discountPercent}% off</span> on selected PROEDGE footwear models. All sales include islandwide courier delivery in Sri Lanka.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-zinc-950 text-white rounded-3xl p-8 sm:p-12 mb-12 border border-zinc-800 shadow-2xl relative overflow-hidden text-center sm:text-left">
            <div className="relative z-10 max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-xs font-bold uppercase tracking-widest border border-zinc-700">
                <Tag className="w-3.5 h-3.5 text-zinc-400" />
                <span>Campaign Paused</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-none">
                PROMOTIONAL SALE PAUSED
              </h1>

              <p className="text-zinc-300 text-sm sm:text-base font-medium">
                Our promotional sale campaign is currently offline. You can still discover clearance footwear below or explore our full range of sports footwear.
              </p>

              <div className="pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-amber-400 transition-colors"
                >
                  <span>Explore All Shoes</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Sale Grid Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-extrabold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Discounted Footwear ({saleProducts.length} Items)
            </h2>
          </div>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">Prices in LKR</span>
        </div>

        {/* Product Grid */}
        <ProductGrid
          products={saleProducts}
          emptyMessage={
            isSaleActive
              ? 'No promotional sale items currently active.'
              : 'There are currently no active sale items. Check back soon!'
          }
        />

      </div>
    </div>
  );
}