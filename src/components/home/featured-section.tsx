import React from 'react';
import { getSaleProducts } from '@/lib/supabase/products';
import { SectionHeading } from '@/components/ui/section-heading';
import { ProductGrid } from '@/components/ui/product-grid';
import { getStoreSettings } from '@/lib/settings';

export async function FeaturedSection() {
  const saleProducts = await getSaleProducts();
  const settings = await getStoreSettings();

  return (
    <section className="py-16 sm:py-24 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Top Picks"
          title={settings.saleSectionTitle || 'Special Offers'}
          subtitle={settings.saleSectionSubtitle || 'Explore our top discounted sneakers and gear.'}
          linkText="Browse All"
          linkHref="/sale"
        />

        <ProductGrid products={saleProducts} />
      </div>
    </section>
  );
}
