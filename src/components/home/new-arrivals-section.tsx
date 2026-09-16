import React from 'react';
import { getNewArrivals } from '@/lib/supabase/products';
import { SectionHeading } from '@/components/ui/section-heading';
import { ProductGrid } from '@/components/ui/product-grid';

export async function NewArrivalsSection() {
  const newArrivals = await getNewArrivals();

  return (
    <section className="py-16 sm:py-24 bg-white border-t border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Fresh Drops"
          title="New Arrivals"
          subtitle="Just released designs with improved sole ergonomics and cutting-edge material tech."
          linkText="View New Drops"
          linkHref="/shop?sort=newest"
        />

        <ProductGrid products={newArrivals} />
      </div>
    </section>
  );
}