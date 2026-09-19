import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SectionHeading } from '@/components/ui/section-heading';
import { ArrowRight, Trophy } from 'lucide-react';
import type { CategoryItem } from '@/types/product';

interface SportShowcaseItem {
  name: string;
  slug: string;
  href: string;
  image: string;
  subtitle: string;
  tagline: string;
}

const SPORTS_SHOWCASE: SportShowcaseItem[] = [
  {
    name: 'Football',
    slug: 'football',
    href: '/shop?category=football',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1000&auto=format&fit=crop',
    subtitle: 'Matchday Precision & Speed',
    tagline: 'Boots, Turf Shoes, Match Balls & Protection',
  },
  {
    name: 'Rugby',
    slug: 'rugby',
    href: '/shop?category=rugby',
    image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?q=80&w=1000&auto=format&fit=crop',
    subtitle: 'Power, Traction & Impact',
    tagline: '8-Stud Boots, Match Balls & Kicking Tees',
  },
  {
    name: 'Basketball',
    slug: 'basketball',
    href: '/shop?category=basketball',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1000&auto=format&fit=crop',
    subtitle: 'High-Elevation Court Control',
    tagline: 'Court Shoes, Grip Balls & Accessories',
  },
  {
    name: 'Running',
    slug: 'running',
    href: '/shop?category=running',
    image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=1000&auto=format&fit=crop',
    subtitle: 'Distance & Energy Return',
    tagline: 'Road Runners, Trail Max & Race Day Trainers',
  },
  {
    name: 'General Gear & Accessories',
    slug: 'general',
    href: '/shop?category=general',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop',
    subtitle: 'Training Bags, Slides & Essentials',
    tagline: 'Boot Bags, Gym Duffles, Grip Socks & Strapping Tape',
  },
];

interface CategorySectionProps {
  categories?: CategoryItem[];
}

export function CategorySection({ categories }: CategorySectionProps) {
  const displayCategories = categories && categories.length > 0
    ? categories.slice(0, 6).map((cat) => ({
        name: cat.name,
        slug: cat.slug,
        href: '/shop?category=' + cat.slug,
        image: cat.imageUrl || 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=1000',
        subtitle: cat.subtitle || 'Proedge Sports Collection',
        tagline: cat.tagline || cat.description || 'Explore the best gear for your next match.',
      }))
    : SPORTS_SHOWCASE;

  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-zinc-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Engineered For Every Athlete"
          title="Shop By Sport & Discipline"
          subtitle="Precision-built performance footwear, apparel, and training equipment across all primary sporting disciplines."
          linkText="View Full Catalog"
          linkHref="/shop"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {displayCategories.map((item) => (
            <Link
              key={item.slug}
              href={item.href}
              className="group relative h-80 sm:h-96 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-end p-6 sm:p-8"
              style={{ position: 'relative' }}
            >
              {/* Background Image */}
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />

              {/* Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/95 via-zinc-950/50 to-transparent transition-opacity" />
              <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/10 transition-colors duration-300" />

              {/* Category Info */}
              <div className="relative z-10 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-widest">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>{item.subtitle}</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                  {item.name}
                </h3>

                <p className="text-xs text-zinc-300 line-clamp-1 sm:line-clamp-none font-medium">
                  {item.tagline}
                </p>

                <div className="pt-2 flex items-center text-xs font-bold text-white uppercase tracking-wider group-hover:text-amber-400 transition-colors">
                  <span>Explore Department</span>
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


