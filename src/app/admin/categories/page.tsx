import Image from 'next/image';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getAuthUser } from '@/lib/auth/admin';
import { getSupabaseServer } from '@/lib/supabase/server';
import { Plus, FolderTree, Edit2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Categories | Admin',
};

export default async function CategoriesAdminPage() {
  const user = await getAuthUser();
  if (!user?.isAdmin) redirect('/admin/login');

  const supabase = await getSupabaseServer();
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  const parentCategories = (categories || []).filter((c) => !c.parent_id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 dark:bg-zinc-800 text-amber-500">
            <FolderTree className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-zinc-900 dark:text-white">Categories</h1>
            <p className="text-sm text-zinc-400 dark:text-zinc-500">
              Manage your product categories and homepage layout boxes.
            </p>
          </div>
        </div>
        <Link
          href="/admin/categories/new"
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-zinc-950 transition-colors hover:bg-amber-400"
        >
          <Plus className="h-4 w-4" />
          New Category
        </Link>
      </div>

      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
            <thead className="bg-zinc-50 dark:bg-zinc-900 text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4">Category Name</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4">Parent</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {(categories || []).map((cat) => {
                const parent = parentCategories.find((p) => p.id === cat.parent_id);
                return (
                  <tr key={cat.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-zinc-900 dark:text-white">
                      <div className="flex items-center gap-3">
                        {cat.image_url ? (
                          <div className="w-8 h-8 rounded bg-zinc-100 shrink-0 overflow-hidden">
                            <Image src={cat.image_url} alt={cat.name} width={32} height={32} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-[10px]">
                            No Img
                          </div>
                        )}
                        <span>{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{cat.slug}</td>
                    <td className="px-6 py-4">
                      {parent ? (
                        <span className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                          {parent.name}
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-400">None (Top-Level)</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/categories/${cat.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                      >
                        <Edit2 className="w-3 h-3" />
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {(!categories || categories.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                    No categories found. Create your first one!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

