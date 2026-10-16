import React from 'react';
import { getNewArrivals } from '@/lib/supabase/products';
import { SectionHeading } from '@/components/ui/section-heading';
import { ProductGrid } from '@/components/ui/product-grid';
import { getStoreSettings } from '@/lib/settings';

export async function NewArrivalsSection() {
  const newArrivals = await getNewArrivals();
  const settings = await getStoreSettings();

  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-[#0a0a0c] border-t border-black/[0.06] dark:border-white/[0.08] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="The Latest"
          title={settings.newArrivalsTitle || 'New Arrivals.'}
          subtitle={settings.newArrivalsSubtitle || 'Just-released designs with improved sole ergonomics and next-generation material tech.'}
          linkText="View New Drops"
          linkHref="/shop?sort=newest"
        />

        <ProductGrid products={newArrivals} />
      </div>
    </section>
  );
}
