
import { Suspense } from 'react';
import { ShopContent } from '@/components/shop/shop-content';
import { getProductsByCategory } from '@/lib/supabase/products';
import { pageMetadata } from '@/lib/site';

export const metadata = pageMetadata({
  title: "Women's Footwear",
  description: "Discover PROEDGE women's trainers, running shoes, and lightweight casual footwear with islandwide delivery in Sri Lanka.",
  path: '/women',
});

export default async function WomenPage() {
  const products = await getProductsByCategory('women');

  return (
    <Suspense fallback={<div className="py-20 text-center font-bold text-zinc-400">Loading catalog...</div>}>
      <ShopContent
        initialCategory="women"
        pageTitle="Women's Footwear"
        pageSubtitle="Feather-light performance trainers and aesthetic lifestyle shoes tailored for all-day active comfort."
        products={products}
      />
    </Suspense>
  );
}