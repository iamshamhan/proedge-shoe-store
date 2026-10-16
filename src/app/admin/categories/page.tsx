import Image from 'next/image';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getAuthUser } from '@/lib/auth/admin';
import { getSupabaseServer } from '@/lib/supabase/server';
import { Plus, FolderTree, Edit2, CornerDownRight, Info, ExternalLink } from 'lucide-react';
import { CategoryRowActions } from '@/components/admin/category-row-actions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Categories | Admin',
};

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  image_url: string | null;
  sort_order: number;
};

function ProductCount({ count }: { count: number }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${
        count > 0
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
          : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
      }`}
    >
      {count} {count === 1 ? 'product' : 'products'}
    </span>
  );
}

export default async function CategoriesAdminPage() {
  const user = await getAuthUser();
  if (!user?.isAdmin) redirect('/admin/login');

  const supabase = await getSupabaseServer();
  const [{ data: categoryData }, { data: productRows }] = await Promise.all([
    supabase
      .from('categories')
      .select('id, name, slug, parent_id, image_url, sort_order')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true }),
    supabase.from('products').select('category_id'),
  ]);

  const categories = (categoryData ?? []) as CategoryRow[];

  const directCounts = new Map<string, number>();
  for (const row of productRows ?? []) {
    directCounts.set(row.category_id, (directCounts.get(row.category_id) ?? 0) + 1);
  }

  const knownIds = new Set(categories.map((c) => c.id));
  // Treat a category whose parent no longer exists as a main category.
  const mainCategories = categories.filter((c) => !c.parent_id || !knownIds.has(c.parent_id));
  const childrenOf = (parentId: string) => categories.filter((c) => c.parent_id === parentId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1d1d1f] dark:bg-white/[0.08] text-amber-500 soft-shadow">
            <FolderTree className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-[-0.025em] text-[#1d1d1f] dark:text-[#f5f5f7]">Categories</h1>
            <p className="text-sm text-[#6e6e73] dark:text-[#86868b]">
              {mainCategories.length} main {mainCategories.length === 1 ? 'category' : 'categories'} ·{' '}
              {categories.length - mainCategories.length} subcategories
            </p>
          </div>
        </div>
        <Link
          href="/admin/categories/new"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-5 py-2.5 text-xs font-semibold tracking-tight text-zinc-950 transition-colors hover:bg-amber-400 soft-shadow"
        >
          <Plus className="h-4 w-4" />
          New Main Category
        </Link>
      </div>

      <div className="flex gap-3 rounded-[24px] border border-black/[0.05] dark:border-white/[0.08] bg-white dark:bg-[#1d1d1f] p-4 sm:p-5 text-sm text-[#6e6e73] dark:text-[#86868b] soft-shadow">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        <ul className="space-y-1 leading-relaxed">
          <li>
            <strong className="text-[#1d1d1f] dark:text-[#f5f5f7]">Main categories</strong> (e.g. Football) appear as the
            boxes on the homepage and in the menu. Products are filed under a{' '}
            <strong className="text-[#1d1d1f] dark:text-[#f5f5f7]">subcategory</strong> (e.g. Football Boots).
          </li>
          <li>
            Use the arrows to change the order shown on the website. A category can only be deleted when it has no
            products and no subcategories.
          </li>
        </ul>
      </div>

      {mainCategories.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-black/15 dark:border-white/15 p-10 text-center text-sm text-[#6e6e73]">
          No categories yet. Create your first main category to get started.
        </div>
      ) : (
        <div className="space-y-4">
          {mainCategories.map((main, mainIndex) => {
            const children = childrenOf(main.id);
            const totalProducts =
              (directCounts.get(main.id) ?? 0) +
              children.reduce((sum, c) => sum + (directCounts.get(c.id) ?? 0), 0);

            return (
              <section
                key={main.id}
                className="overflow-hidden rounded-[24px] border border-black/[0.05] dark:border-white/[0.08] bg-white dark:bg-[#1d1d1f] soft-shadow"
              >
                {/* Main category header */}
                <div className="flex flex-col gap-3 border-b border-black/[0.05] dark:border-white/[0.08] bg-[#f5f5f7]/70 dark:bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    {main.image_url ? (
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                        <Image src={main.image_url} alt={main.name} fill sizes="44px" className="object-cover" unoptimized />
                      </div>
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black/[0.04] text-[10px] text-[#86868b] dark:bg-white/[0.06]">
                        No image
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-base font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">{main.name}</h2>
                        <ProductCount count={totalProducts} />
                      </div>
                      <p className="truncate text-xs text-[#86868b]">
                        /{main.slug} · {children.length} {children.length === 1 ? 'subcategory' : 'subcategories'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                    <Link
                      href={`/shop?category=${main.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#6e6e73] hover:text-[#1d1d1f] dark:hover:text-white"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View
                    </Link>
                    <Link
                      href={`/admin/categories/new?parent=${main.id}`}
                      className="inline-flex items-center gap-1 rounded-full border border-black/[0.08] dark:border-white/[0.12] bg-white dark:bg-[#1d1d1f] px-3 py-1.5 text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/[0.04] dark:hover:bg-white/[0.08]"
                    >
                      <Plus className="h-3 w-3" />
                      Subcategory
                    </Link>
                    <Link
                      href={`/admin/categories/${main.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                    >
                      <Edit2 className="h-3 w-3" />
                      Edit
                    </Link>
                    <CategoryRowActions
                      id={main.id}
                      name={main.name}
                      canMoveUp={mainIndex > 0}
                      canMoveDown={mainIndex < mainCategories.length - 1}
                    />
                  </div>
                </div>

                {/* Subcategories */}
                {children.length === 0 ? (
                  <p className="px-4 py-4 text-sm text-zinc-400 sm:pl-[4.5rem]">
                    No subcategories yet.{' '}
                    <Link
                      href={`/admin/categories/new?parent=${main.id}`}
                      className="font-bold text-amber-600 hover:underline dark:text-amber-400"
                    >
                      Add one
                    </Link>{' '}
                    so products can be filed here.
                  </p>
                ) : (
                  <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {children.map((child, childIndex) => (
                      <li
                        key={child.id}
                        className="flex flex-col gap-2 px-4 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40 sm:flex-row sm:items-center sm:justify-between sm:pl-[4.5rem]"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <CornerDownRight className="h-4 w-4 shrink-0 text-zinc-300 dark:text-zinc-600" />
                          <span className="truncate text-sm font-bold text-zinc-800 dark:text-zinc-100">
                            {child.name}
                          </span>
                          <span className="hidden truncate text-xs text-zinc-400 sm:inline">/{child.slug}</span>
                          <ProductCount count={directCounts.get(child.id) ?? 0} />
                        </div>
                        <div className="flex items-center gap-3 sm:justify-end">
                          <Link
                            href={`/shop?category=${child.slug}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View
                          </Link>
                          <Link
                            href={`/admin/categories/${child.id}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                          >
                            <Edit2 className="h-3 w-3" />
                            Edit
                          </Link>
                          <CategoryRowActions
                            id={child.id}
                            name={child.name}
                            canMoveUp={childIndex > 0}
                            canMoveDown={childIndex < children.length - 1}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
