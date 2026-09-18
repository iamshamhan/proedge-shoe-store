import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getAuthUser } from '@/lib/auth/admin';
import { getSupabaseServer } from '@/lib/supabase/server';
import { ProductForm } from '@/components/admin/product-form';

export const metadata: Metadata = {
  title: 'New Product',
};

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sport?: string }>;
}) {
  const user = await getAuthUser();
  if (!user?.isAdmin) redirect('/admin/login');

  const { category: queryCategory, sport: querySport } = (await searchParams) || {};

  const supabase = await getSupabaseServer();
  const { data: categories } = await supabase
    .from('categories')
    .select('id, slug, name, parent_id')
    .order('sort_order');

  let defaultCategoryId: string | undefined;

  if (queryCategory) {
    const match = categories?.find(
      (c) => c.id === queryCategory || c.slug === queryCategory,
    );
    if (match) defaultCategoryId = match.id;
  }

  if (!defaultCategoryId && querySport) {
    const parent = categories?.find((c) => c.slug === querySport || c.id === querySport);
    if (parent) {
      // Pick first child subcategory of this sport if available, else the parent category
      const firstChild = categories?.find((c) => c.parent_id === parent.id);
      defaultCategoryId = firstChild?.id || parent.id;
    }
  }

  return (
    <ProductForm
      categories={categories ?? []}
      defaultCategoryId={defaultCategoryId}
    />
  );
}