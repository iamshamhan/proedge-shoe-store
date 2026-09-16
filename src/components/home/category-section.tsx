import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SectionHeading } from '@/components/ui/section-heading';
import { ArrowRight } from 'lucide-react';

const CATEGORIES = [
  {
    name: "Men's Collection",
    slug: 'men',
    href: '/men',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1000&auto=format&fit=crop',
    subtitle: 'Streetwear & Performance',
  },
  {
    name: "Women's Collection",
    slug: 'women',
    href: '/women',
    image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=1000&auto=format&fit=crop',
    subtitle: 'Sleek & Lightweight',
  },
  {
    name: 'Sports & Training',
    slug: 'sports',
    href: '/sports',
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=1000&auto=format&fit=crop',
    subtitle: 'High Energy Return',
  },
  {
    name: 'Casual Lifestyle',
    slug: 'casual',
    href: '/shop?category=casual',
    image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=1000&auto=format&fit=crop',
    subtitle: 'Everyday Versatility',
  },
];

export function CategorySection() {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Explore Collections"
          title="Shop By Category"
          subtitle="Select from engineered footwear lines designed for every environment and pace."
          linkText="View All Products"
          linkHref="/shop"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={cat.href}
              className="group relative h-80 sm:h-96 rounded-2xl overflow-hidden border border-zinc-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-end p-6"
            >
              {/* Background Image */}
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/40 to-transparent transition-opacity" />

              {/* Category Info */}
              <div className="relative z-10 space-y-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
                  {cat.subtitle}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                  {cat.name}
                </h3>
                
                <div className="pt-2 flex items-center text-xs font-bold text-white uppercase tracking-wider group-hover:text-amber-400 transition-colors">
                  <span>Shop Now</span>
                  <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
