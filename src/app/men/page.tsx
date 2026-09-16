export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { ShopContent } from '@/components/shop/shop-content';
import { getProductsByCategory } from '@/lib/supabase/products';
import { pageMetadata } from '@/lib/site';

export const metadata = pageMetadata({
  title: "Men's Footwear",
  description: "Discover PROEDGE men's sneakers, running shoes, and street style footwear in Sri Lanka with islandwide delivery.",
  path: '/men',
});

export default async function MenPage() {
  const products = await getProductsByCategory('men');

  return (
    <Suspense fallback={<div className="py-20 text-center font-bold text-zinc-400">Loading catalog...</div>}>
      <ShopContent
        initialCategory="men"
        pageTitle="Men's Footwear"
        pageSubtitle="Engineered sneakers and performance shoes designed for maximum durability and strength."
        products={products}
      />
    </Suspense>
  );
}