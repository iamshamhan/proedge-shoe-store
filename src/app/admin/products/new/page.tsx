import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getAuthUser } from '@/lib/auth/admin';
import { getSupabaseServer } from '@/lib/supabase/server';
import { ProductForm } from '@/components/admin/product-form';

export const metadata: Metadata = {
  title: 'New Product',
};

export default async function NewProductPage() {
  const user = await getAuthUser();
  if (!user?.isAdmin) redirect('/admin/login');

  const supabase = await getSupabaseServer();
  const { data: categories } = await supabase
    .from('categories')
    .select('id, slug, name, parent_id')
    .order('sort_order');

  return <ProductForm categories={categories ?? []} />;
}