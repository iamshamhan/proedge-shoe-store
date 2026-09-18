import React from 'react';
import { getFeaturedProducts } from '@/lib/supabase/products';
import { SectionHeading } from '@/components/ui/section-heading';
import { ProductGrid } from '@/components/ui/product-grid';

export async function FeaturedSection() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <section className="py-16 sm:py-24 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Top Picks"
          title="Featured Footwear"
          subtitle="Explore our top recommended sneakers engineered for peak comfort and standout presence."
          linkText="Browse All"
          linkHref="/shop"
        />

        <ProductGrid products={featuredProducts} />
      </div>
    </section>
  );
}