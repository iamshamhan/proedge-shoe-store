
import { Suspense } from 'react';
import { ShopContent } from '@/components/shop/shop-content';
import { getProductsByCategory } from '@/lib/supabase/products';
import { pageMetadata } from '@/lib/site';

export const metadata = pageMetadata({
  title: 'Sports & Training Footwear',
  description: 'High-energy return running shoes and cross-trainers from PROEDGE, engineered for active training in Sri Lanka.',
  path: '/sports',
});

export default async function SportsPage() {
  const products = await getProductsByCategory('sports');

  return (
    <Suspense fallback={<div className="py-20 text-center font-bold text-zinc-400">Loading catalog...</div>}>
      <ShopContent
        initialCategory="sports"
        pageTitle="Sports &amp; Athletic Line"
        pageSubtitle="Explore high energy return running shoes, sprinters, and cross-training footwear built for active training."
        products={products}
      />
    </Suspense>
  );
}