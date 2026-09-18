import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getAuthUser } from '@/lib/auth/admin';
import { getSupabaseServer } from '@/lib/supabase/server';
import { CategoryForm } from '@/components/admin/category-form';

export const metadata: Metadata = {
  title: 'New Category | Admin',
};

export default async function NewCategoryPage({
  searchParams,
}: {
  searchParams: Promise<{ parent?: string }>;
}) {
  const user = await getAuthUser();
  if (!user?.isAdmin) redirect('/admin/login');

  const { parent: queryParent } = (await searchParams) || {};

  const supabase = await getSupabaseServer();
  // Fetch only top-level categories to use as parents
  const { data: parentCategories } = await supabase
    .from('categories')
    .select('id, name')
    .is('parent_id', null)
    .order('sort_order');

  let defaultParentId = '';
  if (queryParent) {
    const match = parentCategories?.find(
      (c) => c.id === queryParent || c.name.toLowerCase() === queryParent.toLowerCase()
    );
    if (match) defaultParentId = match.id;
  }

  return (
    <CategoryForm
      parentCategories={parentCategories ?? []}
      defaultParentId={defaultParentId}
    />
  );
}
