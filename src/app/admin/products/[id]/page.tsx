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
  const fullRes = await supabase
    .from('products')
    .select(
      'id, name, slug, description, category_id, price, compare_at_price, featured, is_new_arrival, is_on_sale, is_active, product_images(id, url, alt_text, sort_order), product_variants(id, colour, size, stock, size_system, size_value)',
    )
    .eq('id', id)
    .single();

  let product = fullRes.data;

  if (fullRes.error && fullRes.error.message?.includes('size_system')) {
    const fallbackRes = await supabase
      .from('products')
      .select(
        'id, name, slug, description, category_id, price, compare_at_price, featured, is_new_arrival, is_on_sale, is_active, product_images(id, url, alt_text, sort_order), product_variants(id, colour, size, stock)',
      )
      .eq('id', id)
      .single();
    if (fallbackRes.data) {
      product = {
        ...fallbackRes.data,
        product_variants: fallbackRes.data.product_variants.map((v) => ({
          ...v,
          size_system: 'EU',
          size_value: String(v.size),
        })),
      };
    }
  }

  if (!product) notFound();

  const { data: categories } = await supabase
    .from('categories')
    .select('id, slug, name, parent_id')
    .order('sort_order');

  return <ProductForm categories={categories ?? []} product={product} />;
}