import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getAuthUser } from '@/lib/auth/admin';
import { getSupabaseServer } from '@/lib/supabase/server';
import { CategoryForm } from '@/components/admin/category-form';

export const metadata: Metadata = {
  title: 'Edit Category | Admin',
};

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getAuthUser();
  if (!user?.isAdmin) redirect('/admin/login');

  const { id } = await params;
  const supabase = await getSupabaseServer();

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();

  if (!category) {
    redirect('/admin/categories');
  }

  const { data: parentCategories } = await supabase
    .from('categories')
    .select('id, name')
    .is('parent_id', null)
    .order('sort_order');

  return (
    <CategoryForm
      parentCategories={parentCategories ?? []}
      initialData={{
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description || undefined,
        image_url: category.image_url || undefined,
        subtitle: category.subtitle || undefined,
        tagline: category.tagline || undefined,
        parent_id: category.parent_id || undefined,
      }}
    />
  );
}
