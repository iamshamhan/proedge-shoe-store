import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Plus, Package } from 'lucide-react';
import { getAuthUser } from '@/lib/auth/admin';
import { getSupabaseServer } from '@/lib/supabase/server';
import { ProductTable } from '@/components/admin/product-table';

export const metadata: Metadata = {
  title: 'Products',
};

export default async function AdminProductsPage() {
  const user = await getAuthUser();
  if (!user?.isAdmin) redirect('/admin/login');

  const supabase = await getSupabaseServer();
  const { data: products } = await supabase
    .from('products')
    .select(
      'id, name, slug, price, is_active, featured, is_new_arrival, is_on_sale, categories(slug, name), product_images(url, sort_order), product_variants(id, stock)',
    )
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-zinc-900">Products</h1>
            <p className="text-sm text-zinc-400">
              {products?.length ?? 0} product{(products?.length ?? 0) === 1 ? '' : 's'} in catalog
            </p>
          </div>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-amber-600 hover:text-zinc-950"
        >
          <Plus className="h-4 w-4" />
          New Product
        </Link>
      </div>

      <ProductTable products={products ?? []} />
    </div>
  );
}