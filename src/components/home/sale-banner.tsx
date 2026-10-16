import React from 'react';
import Link from 'next/link';
import { ArrowRight, Tag } from 'lucide-react';

interface SaleBannerProps {
  discountPercent?: number;
}

export function SaleBanner({ discountPercent = 30 }: SaleBannerProps) {
  return (
    <section className="relative my-12 mx-4 sm:mx-6 lg:mx-8 max-w-7xl lg:mx-auto rounded-[32px] bg-[#1d1d1f] text-white overflow-hidden py-14 sm:py-16 px-6 sm:px-14 border border-white/[0.08] soft-shadow">
      {/* Subtle Ambient Glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold tracking-tight">
            <Tag className="w-3.5 h-3.5" />
            <span>Limited-Time Store Event</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.03em] text-white leading-tight">
            Step into the sale.
          </h2>

          <p className="text-zinc-400 text-base sm:text-lg font-normal leading-relaxed">
            Selected high-performance footwear and gear up to <span className="text-amber-400 font-semibold">{discountPercent}% off</span>. Available islandwide across Sri Lanka.
          </p>
        </div>

        <div className="shrink-0">
          <Link
            href="/sale"
            className="px-7 py-3.5 bg-white text-[#1d1d1f] font-semibold text-sm tracking-tight rounded-full hover:bg-amber-400 hover:text-zinc-950 active:scale-[0.98] transition-all inline-flex items-center gap-2 shadow-sm group min-h-[44px]"
          >
            <span>Shop Special Offers</span>
            <ArrowRight className="w-4 h-4 motion-safe:group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
