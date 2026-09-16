export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { ShopContent } from '@/components/shop/shop-content';
import { getAllProducts } from '@/lib/supabase/products';
import { pageMetadata } from '@/lib/site';

export const metadata = pageMetadata({
  title: 'Shop All Footwear',
  description: 'Browse the full PROEDGE shoe collection in Sri Lanka — high performance and casual street styles with islandwide delivery.',
  path: '/shop',
});

export default async function ShopPage() {
  const products = await getAllProducts();

  return (
    <Suspense fallback={<div className="py-20 text-center font-bold text-zinc-400">Loading catalog...</div>}>
      <ShopContent initialCategory="all" products={products} />
    </Suspense>
  );
}