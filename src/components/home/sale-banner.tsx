import React from 'react';
import Link from 'next/link';
import { ArrowRight, Tag } from 'lucide-react';

interface SaleBannerProps {
  discountPercent?: number;
}

export function SaleBanner({ discountPercent = 30 }: SaleBannerProps) {
  return (
    <section className="relative my-12 mx-4 sm:mx-6 lg:mx-8 max-w-7xl lg:mx-auto rounded-3xl bg-zinc-950 text-white overflow-hidden py-16 px-6 sm:px-12 border border-zinc-800 shadow-2xl">
      {/* Background Decorative Pattern */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest">
            <Tag className="w-3.5 h-3.5" />
            <span>Limited Time Store Offer</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-none">
            STEP INTO THE SALE
          </h2>

          <p className="text-zinc-300 text-base sm:text-lg font-medium">
            Selected high-performance styles up to <span className="text-amber-400 font-bold">{discountPercent}% off</span>. Limited quantities available across Sri Lanka.
          </p>
        </div>

        <div className="shrink-0">
          <Link
            href="/sale"
            className="px-8 py-4 bg-amber-500 text-zinc-950 font-black text-sm rounded-xl hover:bg-amber-400 transition-all inline-flex items-center gap-2 shadow-lg shadow-amber-500/20 group min-h-[44px]"
          >
            <span>Shop Sale</span>
            <ArrowRight className="w-4 h-4 motion-safe:group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
