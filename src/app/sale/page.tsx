export const dynamic = 'force-dynamic';

import React from 'react';
import { getSaleProducts } from '@/lib/supabase/products';
import { ProductGrid } from '@/components/ui/product-grid';
import { Tag, Sparkles } from 'lucide-react';
import { pageMetadata } from '@/lib/site';

export const metadata = pageMetadata({
  title: 'Sale & Special Offers',
  description: 'Shop PROEDGE footwear sale items with discounts up to 30% off in Sri Lanka. Islandwide courier delivery included.',
  path: '/sale',
});

export default async function SalePage() {
  const saleProducts = await getSaleProducts();

  return (
    <div className="py-12 sm:py-20 bg-zinc-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Sale Header Banner */}
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
              Save up to <span className="text-amber-400 font-bold">30% off</span> on selected PROEDGE footwear models. All sales include islandwide courier delivery in Sri Lanka.
            </p>
          </div>
        </div>

        {/* Sale Grid Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-extrabold uppercase tracking-wider text-zinc-900">
              Discounted Footwear ({saleProducts.length} Items)
            </h2>
          </div>
          <span className="text-xs text-zinc-500 font-semibold">Prices in LKR</span>
        </div>

        {/* Product Grid */}
        <ProductGrid products={saleProducts} emptyMessage="No promotional sale items currently active." />

      </div>
    </div>
  );
}