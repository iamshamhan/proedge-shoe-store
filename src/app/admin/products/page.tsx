import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Plus, Package } from 'lucide-react';
import { getAuthUser } from '@/lib/auth/admin';
import { getSupabaseServer } from '@/lib/supabase/server';
import { ProductTable } from '@/components/admin/product-table';

export const metadata: Metadata = {
  title: 'Products | Admin',
};

export default async function AdminProductsPage() {
  const user = await getAuthUser();
  if (!user?.isAdmin) redirect('/admin/login');

  const supabase = await getSupabaseServer();
  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase
      .from('products')
      .select(
        'id, name, slug, price, is_active, featured, is_new_arrival, is_on_sale, category_id, categories(id, slug, name, parent_id), product_images(url, sort_order), product_variants(id, stock)',
      )
      .order('created_at', { ascending: false }),
    supabase
      .from('categories')
      .select('id, slug, name, parent_id, sort_order')
      .order('sort_order', { ascending: true }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 dark:bg-zinc-800 text-white">
            <Package className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-xl font-black text-zinc-900 dark:text-white">Products Catalog</h1>
            <p className="text-sm text-zinc-400 dark:text-zinc-500">
              {products?.length ?? 0} product{(products?.length ?? 0) === 1 ? '' : 's'} organized by sports category
            </p>
          </div>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-zinc-950 transition-colors hover:bg-amber-400"
        >
          <Plus className="h-4 w-4" />
          <span>New Product</span>
        </Link>
      </div>

      <ProductTable
        products={products ?? []}
        categories={categories ?? []}
      />
    </div>
  );
}