import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Plus, Package } from 'lucide-react';
import { getAuthUser } from '@/lib/auth/admin';
import { getSupabaseServer } from '@/lib/supabase/server';
import { ProductTable } from '@/components/admin/product-table';
import { readAllRows } from '@/lib/supabase/read-all';

export const metadata: Metadata = {
  title: 'Products | Admin',
};

export default async function AdminProductsPage() {
  const user = await getAuthUser();
  if (!user?.isAdmin) redirect('/admin/login');

  const supabase = await getSupabaseServer();
  const [products, categories] = await Promise.all([
    readAllRows((from, to) => supabase
      .from('products')
      .select(
        'id, name, slug, price, is_active, featured, is_new_arrival, is_on_sale, category_id, categories(id, slug, name, parent_id), product_images(url, sort_order), product_variants(id, stock)',
      )
      .order('created_at', { ascending: false }).order('id').range(from, to)),
    readAllRows((from, to) => supabase
      .from('categories')
      .select('id, slug, name, parent_id, sort_order')
      .order('sort_order', { ascending: true }).order('id').range(from, to)),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1d1d1f] dark:bg-white/[0.08] text-white soft-shadow">
            <Package className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-[-0.025em] text-[#1d1d1f] dark:text-[#f5f5f7]">Products Catalog</h1>
            <p className="text-sm text-[#6e6e73] dark:text-[#86868b]">
              {products?.length ?? 0} product{(products?.length ?? 0) === 1 ? '' : 's'} organized by sports category
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <Link
            href="/admin/categories/new"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-full border border-black/[0.08] dark:border-white/[0.12] bg-white dark:bg-[#1d1d1f] px-4 py-2.5 text-xs font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06] soft-shadow"
          >
            <Plus className="h-4 w-4" />
            <span>New Main Category</span>
          </Link>
          <Link
            href="/admin/products/new"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-5 py-2.5 text-xs font-semibold tracking-tight text-zinc-950 transition-colors hover:bg-amber-400 soft-shadow"
          >
            <Plus className="h-4 w-4" />
            <span>New Product</span>
          </Link>
        </div>
      </div>

      <ProductTable
        products={products ?? []}
        categories={categories ?? []}
      />
    </div>
  );
}
