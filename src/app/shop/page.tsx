
import { Suspense } from 'react';
import { ShopContent } from '@/components/shop/shop-content';
import { getAllProducts, getCategoriesHierarchy } from '@/lib/supabase/products';
import { pageMetadata } from '@/lib/site';

export const metadata = pageMetadata({
  title: 'Shop PROEDGE Gear & Footwear',
  description: 'Browse the full PROEDGE sports collection in Sri Lanka — boots, apparel, balls, and accessories with islandwide delivery.',
  path: '/shop',
});

export default async function ShopPage() {
  const [products, categories] = await Promise.all([
    getAllProducts(),
    getCategoriesHierarchy(),
  ]);

  return (
    <Suspense fallback={<div className="py-20 text-center font-bold text-zinc-400">Loading catalog...</div>}>
      <ShopContent initialCategory="all" products={products} categories={categories} />
    </Suspense>
  );
}