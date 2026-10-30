import { AdminPagination } from '@/components/admin/pagination';
import { adminPage, ADMIN_PAGE_SIZE, searchTerm, type AdminSearchParams } from '@/lib/admin-pagination';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Plus, Package } from 'lucide-react';
import { getAuthUser } from '@/lib/auth/admin';
import { getSupabaseServer } from '@/lib/supabase/server';
import { ProductTable, type Product } from '@/components/admin/product-table';
import { readAllRows } from '@/lib/supabase/read-all';

export const metadata: Metadata = {
  title: 'Products | Admin',
};

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<AdminSearchParams> }) {
  const user = await getAuthUser();
  if (!user?.isAdmin) redirect('/admin/login');

  const supabase = await getSupabaseServer();
  const params = await searchParams;
  const page = adminPage(params.page);
  const categories = await readAllRows((from, to) => supabase.from('categories')
    .select('id, slug, name, parent_id, sort_order').order('sort_order').order('id').range(from, to));
  let categoryIds: string[] | null = null;
  if (params.category && params.category !== 'all') {
    const parent = categories.find(c => c.slug === params.category);
    categoryIds = parent ? categories.filter(c => c.id === parent.id || c.parent_id === parent.id).map(c => c.id) : [];
  }
  const filters = ['all', 'featured', 'on-sale', 'inactive', 'low-stock', 'out-of-stock'];
  const { data, error } = await supabase.rpc('admin_get_product_page', {
    p_page: page, p_page_size: ADMIN_PAGE_SIZE, p_query: searchTerm(params.q),
    p_category_ids: categoryIds, p_filter: filters.includes(params.filter ?? '') ? params.filter : 'all',
  });
  if (error || !data || !Array.isArray(data.products) || !Number.isSafeInteger(data.count) || data.count < 0) {
    throw new Error('Unable to load products. Please try again.');
  }
  const products = data.products as Product[];
  const count = data.count as number;

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
              {count ?? 0} product{(count ?? 0) === 1 ? '' : 's'} organized by sports category
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

      <AdminPagination path="/admin/products" params={params} page={page} total={count ?? 0} />
      <ProductTable key={JSON.stringify(params)} filters={params}
        products={products ?? []}
        categories={categories ?? []}
      />
    </div>
  );
}
