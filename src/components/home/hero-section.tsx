import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import type { Product } from '@/types/product';
import { formatLKR } from '@/data/products';

interface HeroSectionProps {
  heroProduct?: Product | null;
}

export function HeroSection({ heroProduct }: HeroSectionProps) {
  const productName = heroProduct?.name ?? 'PROEDGE Runner X1';
  const productImage =
    heroProduct?.images?.[0] ||
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop';
  const productPrice = heroProduct?.price ? formatLKR(heroProduct.price) : 'Rs. 24,500';
  const productBadge = heroProduct?.sport
    ? `${heroProduct.sport} Spotlight`
    : heroProduct?.category
      ? `${heroProduct.category.toUpperCase()}`
      : 'Featured Model';
  const productHref = heroProduct ? `/product/${heroProduct.slug}` : '/shop';

  return (
    <section className="relative bg-background text-foreground overflow-hidden py-16 sm:py-24 lg:py-32 transition-colors">
      {/* Subtle Background Glow Effect */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-muted/50 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Text & CTAs */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
            
            {/* Tagline Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card border border-border text-accent text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>Built for Your Next Step</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight text-foreground">
              Natural <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-light">
                Movement.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-muted-foreground text-base sm:text-xl font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Designed to move with the earth. Unparalleled comfort meets sustainable materials in our lightest silhouettes yet.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/shop"
                className="w-full sm:w-auto px-8 py-4 bg-foreground text-background font-semibold text-sm rounded-full hover:opacity-90 transition-all flex items-center justify-center gap-2 soft-shadow group min-h-[44px]"
              >
                <span>Explore Collection</span>
                <ArrowRight className="w-4 h-4 motion-safe:group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                href="/sale"
                className="w-full sm:w-auto px-8 py-4 bg-transparent text-foreground border border-border font-semibold text-sm rounded-full hover:bg-card transition-all flex items-center justify-center gap-2 min-h-[44px]"
              >
                <span>View Sale</span>
              </Link>
            </div>

            {/* Hero Stats */}
            <div className="pt-8 border-t border-border/50 grid grid-cols-3 gap-4 text-center lg:text-left">
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">100%</p>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Authentic Quality</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">Islandwide</p>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Fast Delivery</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">24/7</p>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">WhatsApp Support</p>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Sneaker Visual Spotlight */}
          <div className="lg:col-span-5 relative flex justify-center">
            <Link
              href={productHref}
              className="relative w-full max-w-md aspect-4/5 rounded-[40px] bg-card p-4 soft-shadow group block hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative w-full h-full rounded-[32px] overflow-hidden bg-background">
                <Image
                  src={productImage}
                  alt={productName}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover object-center mix-blend-multiply dark:mix-blend-screen dark:brightness-90 dark:contrast-110 motion-safe:group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Product Info Block */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-card to-transparent pt-20 flex items-end justify-between transition-all">
                  <div className="min-w-0 pr-2 space-y-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block truncate">
                      {productBadge}
                    </span>
                    <h3 className="font-bold text-lg text-foreground truncate">
                      {productName}
                    </h3>
                  </div>
                  <span className="shrink-0 text-lg font-bold text-foreground">
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

