import { readAllRows } from '@/lib/supabase/read-all';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getAuthUser } from '@/lib/auth/admin';
import { getSupabaseServer } from '@/lib/supabase/server';
import { ProductForm } from '@/components/admin/product-form';

export const metadata: Metadata = {
  title: 'Edit Product',
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getAuthUser();
  if (!user?.isAdmin) redirect('/admin/login');

  const { id } = await params;

  const supabase = await getSupabaseServer();
  const { data: product, error } = await supabase
    .from('products')
    .select(
      'id, updated_at, name, slug, description, category_id, price, compare_at_price, featured, is_new_arrival, is_on_sale, is_active, product_images(id, url, alt_text, sort_order), product_variants(id, colour, size, stock, size_system, size_value)',
    )
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error('Unable to load this product. Please try again.');

  if (!product) notFound();

  const categories = await readAllRows((from, to) => supabase
    .from('categories')
    .select('id, slug, name, parent_id')
    .order('sort_order').order('id').range(from, to));

  return <ProductForm categories={categories ?? []} product={product} />;
}
