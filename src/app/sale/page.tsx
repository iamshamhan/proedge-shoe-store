
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
    <div className="py-12 sm:py-20 bg-[#f5f5f7] dark:bg-[#000000] min-h-screen text-[#1d1d1f] dark:text-[#f5f5f7] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Sale Header Banner */}
        {isSaleActive ? (
          <div className="bg-[#1d1d1f] text-[#f5f5f7] rounded-[36px] p-8 sm:p-12 mb-12 border border-white/[0.08] soft-shadow relative overflow-hidden text-center sm:text-left">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500 text-zinc-950 text-xs font-semibold tracking-tight">
                <Tag className="w-3.5 h-3.5" />
                <span>Special Offers</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-semibold tracking-[-0.025em] text-[#f5f5f7] leading-[1.08]">
                Step into the sale.
              </h1>

              <p className="text-[#86868b] text-sm sm:text-base font-normal leading-relaxed">
                Save up to <span className="text-amber-400 font-semibold">{discountPercent}% off</span> on selected PROEDGE footwear models. All sales include islandwide courier delivery in Sri Lanka.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-[#1d1d1f] text-[#f5f5f7] rounded-[36px] p-8 sm:p-12 mb-12 border border-white/[0.08] soft-shadow relative overflow-hidden text-center sm:text-left">
            <div className="relative z-10 max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.08] text-[#86868b] text-xs font-semibold border border-white/[0.1]">
                <Tag className="w-3.5 h-3.5" />
                <span>Campaign Paused</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-semibold tracking-[-0.025em] text-[#f5f5f7] leading-[1.08]">
                Promotional sale paused.
              </h1>

              <p className="text-[#86868b] text-sm sm:text-base font-normal leading-relaxed">
                Our promotional sale campaign is currently offline. You can still discover clearance footwear below or explore our full range of sports footwear.
              </p>

              <div className="pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#1d1d1f] font-semibold text-sm tracking-tight rounded-full hover:bg-amber-400 transition-colors"
                >
                  <span>Explore All Shoes</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Sale Grid Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/[0.06] dark:border-white/[0.08]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
              Discounted Footwear ({saleProducts.length} Items)
            </h2>
          </div>
          <span className="text-xs text-[#6e6e73] dark:text-[#86868b] font-medium">Prices in LKR</span>
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