import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative bg-zinc-950 text-white overflow-hidden py-16 sm:py-24 lg:py-32">
      {/* Subtle Background Glow Effect */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-zinc-700/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Text & CTAs */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
            
            {/* Tagline Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-amber-400 text-xs font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Built for Your Next Step</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none uppercase text-white">
              STEP INTO <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-200">
                YOUR STYLE
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-zinc-400 text-base sm:text-xl font-normal max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Discover high-performance and daily lifestyle footwear engineered with peak comfort, durable soles, and bold modern street aesthetic.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/men"
                className="w-full sm:w-auto px-8 py-4 bg-amber-500 text-zinc-950 font-black text-sm uppercase tracking-wider rounded-xl hover:bg-amber-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 group"
              >
                <span>SHOP MEN</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                href="/women"
                className="w-full sm:w-auto px-8 py-4 bg-zinc-900 text-white border border-zinc-700 font-extrabold text-sm uppercase tracking-wider rounded-xl hover:bg-zinc-800 hover:border-zinc-500 transition-all flex items-center justify-center gap-2"
              >
                <span>SHOP WOMEN</span>
              </Link>
            </div>

            {/* Hero Stats */}
            <div className="pt-8 border-t border-zinc-800/80 grid grid-cols-3 gap-4 text-center lg:text-left">
              <div>
                <p className="text-2xl sm:text-3xl font-black text-white">100%</p>
                <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Authentic Quality</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-amber-500">Islandwide</p>
                <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Fast Delivery</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-white">24/7</p>
                <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">WhatsApp Support</p>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Sneaker Visual */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-md aspect-4/5 rounded-3xl bg-gradient-to-b from-zinc-800 to-zinc-900 p-3 border border-zinc-800 shadow-2xl overflow-hidden group">
              <div className="relative w-full h-full rounded-2xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop"
                  alt="PROEDGE Hero Sneaker"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Floating Badge */}
                <div className="absolute bottom-4 left-4 right-4 bg-zinc-950/80 backdrop-blur-md p-4 rounded-xl border border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block">
                      Featured Model
                    </span>
                    <h3 className="font-extrabold text-sm text-white uppercase">
                      PROEDGE Runner X1
                    </h3>
                  </div>
                  <span className="text-sm font-black text-white px-2.5 py-1 bg-amber-500 text-zinc-950 rounded-md">
                    Rs. 24,500
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
