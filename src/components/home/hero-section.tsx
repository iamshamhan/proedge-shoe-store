import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import type { Product } from '@/types/product';
import { formatLKR } from '@/data/products';
import { formatWhatsAppChatUrl } from '@/lib/whatsapp';

interface HeroSectionProps {
  heroProduct?: Product | null;
  whatsappNumber?: string;
}

export function HeroSection({ heroProduct, whatsappNumber }: HeroSectionProps) {
  const productName = heroProduct?.name ?? 'Explore the collection';
  const productImage =
    heroProduct?.images?.[0] ||
    '/product-placeholder.svg';
  const productPrice = heroProduct ? formatLKR(heroProduct.price) : 'Browse products';
  const productBadge = heroProduct?.sport
    ? `${heroProduct.sport} Spotlight`
    : heroProduct?.category
      ? `${heroProduct.category.toUpperCase()}`
      : 'Featured Model';
  const productHref = heroProduct ? `/product/${heroProduct.slug}` : '/shop';

  return (
    <section className="relative bg-background text-foreground overflow-hidden py-16 sm:py-24 lg:py-28 transition-colors">
      {/* Subtle Ambient Glow */}
      <div className="absolute -top-48 -right-48 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-48 -left-48 w-[500px] h-[500px] bg-zinc-400/10 dark:bg-zinc-800/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          
          {/* Left Column: Apple Keynote Typography & Pill CTAs */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-7 text-center lg:text-left">
            
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-[#1d1d1f] border border-black/[0.06] dark:border-white/[0.08] text-amber-600 dark:text-amber-400 text-xs font-semibold tracking-tight soft-shadow">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Built for your next step</span>
            </div>

            {/* Main Headline (Apple Display Style) */}
            <h1 className="text-4xl sm:text-6xl lg:text-[68px] font-semibold tracking-[-0.03em] leading-[1.05] text-[#1d1d1f] dark:text-white">
              Step into <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 dark:from-amber-300 dark:via-amber-400 dark:to-amber-500">
                your style.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-[#6e6e73] dark:text-[#86868b] text-base sm:text-xl font-normal max-w-xl mx-auto lg:mx-0 leading-relaxed tracking-[-0.01em]">
              Precision-engineered footwear, performance apparel, and matchday equipment crafted for Football, Rugby, Basketball, and Running.
            </p>

            {/* Apple Pill Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link
                href="/shop"
                className="w-full sm:w-auto px-7 py-3.5 bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f] font-semibold text-sm tracking-tight rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 soft-shadow group min-h-[44px]"
              >
                <span>Shop the Collection</span>
                <ArrowRight className="w-4 h-4 motion-safe:group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                href="/sale"
                className="w-full sm:w-auto px-7 py-3.5 bg-white/80 dark:bg-[#1d1d1f] text-[#1d1d1f] dark:text-white border border-black/[0.08] dark:border-white/[0.12] font-semibold text-sm tracking-tight rounded-full hover:bg-white dark:hover:bg-zinc-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 min-h-[44px]"
              >
                <span>Explore Special Offers</span>
              </Link>
            </div>

            {/* Hero Stats */}
            <div className="pt-8 border-t border-black/[0.06] dark:border-white/[0.08] grid grid-cols-3 gap-2 sm:gap-4 text-center lg:text-left">
              <div>
                <p className="text-lg sm:text-2xl lg:text-3xl font-semibold tracking-tight text-[#1d1d1f] dark:text-white">100%</p>
                <p className="text-[11px] sm:text-xs text-[#6e6e73] dark:text-[#86868b] font-medium mt-0.5">Authentic Quality</p>
              </div>
              <div>
                <p className="text-lg sm:text-2xl lg:text-3xl font-semibold tracking-tight text-[#1d1d1f] dark:text-white truncate">Islandwide</p>
                <p className="text-[11px] sm:text-xs text-[#6e6e73] dark:text-[#86868b] font-medium mt-0.5">Express Delivery</p>
              </div>
              <a
                href={formatWhatsAppChatUrl(
                  whatsappNumber,
                  'Hello PROEDGE team! I have an inquiry about athletic footwear and sporting gear.',
                )}
                target="_blank"
                rel="noopener noreferrer"
                title="Chat with PROEDGE on WhatsApp"
                className="group block hover:opacity-90 transition-opacity focus:outline-none"
              >
                <p className="text-lg sm:text-2xl lg:text-3xl font-semibold tracking-tight text-[#1d1d1f] dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  24/7
                </p>
                <p className="text-[11px] sm:text-xs text-[#6e6e73] dark:text-[#86868b] font-medium mt-0.5 group-hover:underline">
                  WhatsApp Concierge
                </p>
              </a>
            </div>

          </div>

          {/* Right Column: Apple Bento Visual Spotlight */}
          <div className="lg:col-span-5 relative flex justify-center">
            <Link
              href={productHref}
              className="relative w-full max-w-md aspect-4/5 rounded-[36px] bg-white dark:bg-[#1d1d1f] p-3 border border-black/[0.05] dark:border-white/[0.08] soft-shadow group block hover:-translate-y-1 transition-all duration-500"
            >
              <div className="relative w-full h-full rounded-[28px] overflow-hidden bg-zinc-900">
                <Image
                  src={productImage}
                  alt={productName}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover object-center motion-safe:group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                
                {/* Frosted Glass Info Pill */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-black/65 apple-glass border border-white/15 flex items-center justify-between gap-3 transition-all">
                  <div className="min-w-0 pr-2">
                    <span className="text-[11px] font-semibold text-amber-400 tracking-tight block truncate">
                      {productBadge}
                    </span>
                    <h3 className="font-semibold text-base text-white truncate tracking-tight">
                      {productName}
                    </h3>
                  </div>
                  <span className="shrink-0 px-3.5 py-1.5 rounded-full bg-white text-[#1d1d1f] text-xs font-semibold tracking-tight">
                    {productPrice}
                  </span>
                </div>
              </div>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}

