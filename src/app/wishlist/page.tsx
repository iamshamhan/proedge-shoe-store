import { getAllProducts } from '@/lib/supabase/products';
import { WishlistContent } from '@/components/wishlist/wishlist-content';
import { pageMetadata } from '@/lib/site';

export const dynamic = 'force-dynamic';

export const metadata = pageMetadata({
  title: 'Wishlist',
  description: 'View the PROEDGE footwear styles you have saved to your wishlist.',
  path: '/wishlist',
  noindex: true,
});

export default async function WishlistPage() {
  const products = await getAllProducts();

  return (
    <div className="py-10 sm:py-16 bg-zinc-50 dark:bg-zinc-950 min-h-screen">
      <WishlistContent allProducts={products} />
    </div>
  );
}