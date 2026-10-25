'use client';

import type { AdminSearchParams } from '@/lib/admin-pagination';
import { localImage } from '@/lib/local-images';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, useMemo } from 'react';
import {
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Package,
  Plus,
  X,
  ExternalLink,
  Search,
  Copy,
} from 'lucide-react';
import {
  toggleProductActive,
  deleteProduct,
  updateProductFlags,
  duplicateProduct,
} from '@/app/admin/actions';
import { ConfirmDialog } from './confirm-dialog';
import { formatLKR } from '@/data/products';

export type Category = {
  id: string;
  slug: string;
  name: string;
  parent_id?: string | null;
  sort_order?: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  is_active: boolean;
  featured: boolean;
  is_new_arrival: boolean;
  is_on_sale: boolean;
  category_id?: string | null;
  categories:
    | { id?: string; slug: string; name: string; parent_id?: string | null }
    | { id?: string; slug: string; name: string; parent_id?: string | null }[]
    | null;
  product_images: { url: string; sort_order: number }[];
  product_variants: { id: string; stock: number }[];
};

type QuickFilter = 'all' | 'low-stock' | 'out-of-stock' | 'on-sale' | 'featured' | 'inactive';

interface ProductTableProps {
  products: Product[];
  filters?: AdminSearchParams;
  categories?: Category[];
}

export function ProductTable({ products: initial, filters = {}, categories = [] }: ProductTableProps) {
  const router = useRouter();
  const [products, setProducts] = useState(initial);
  const [toggling, setToggling] = useState<string | null>(null);
  const [flagBusy, setFlagBusy] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [targetDelete, setTargetDelete] = useState<Product | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(filters.q ?? '');
  const [activeTab, setActiveTab] = useState<string>(filters.category ?? 'all');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>((filters.filter as QuickFilter) ?? 'all');

  useEffect(() => {
    setProducts(initial);
  }, [initial]);

  const handleToggle = useCallback(
    async (product: Product) => {
      try {
        setActionError(null);
        setToggling(product.id);
        const result = await toggleProductActive(product.id, !product.is_active);
        setToggling(null);
        if ('error' in result) {
          setActionError(result.error);
          return;
        }
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, is_active: !p.is_active } : p)),
        );
        router.refresh();

      } catch {
        setActionError('The operation could not be completed. Check your connection and refresh before retrying.');
      } finally {
        setToggling(null);
      }
  },
    [router],
  );

  const handleFlagToggle = useCallback(
    async (product: Product, field: 'featured' | 'is_new_arrival' | 'is_on_sale') => {
      try {
        setActionError(null);
        const key = `${product.id}:${field}`;
        setFlagBusy(key);
        const nextVal = !product[field];
        const result = await updateProductFlags(product.id, { [field]: nextVal });
        setFlagBusy(null);
        if ('error' in result) {
          setActionError(result.error);
          return;
        }
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, [field]: nextVal } : p)),
        );
        router.refresh();

      } catch {
        setActionError('The operation could not be completed. Check your connection and refresh before retrying.');
      } finally {
        setFlagBusy(null);
      }
  },
    [router],
  );

  const handleDuplicate = useCallback(
    async (product: Product) => {
      try {
        setActionError(null);
        setDuplicating(product.id);
        const result = await duplicateProduct(product.id);
        setDuplicating(null);
        if ('error' in result) {
          setActionError(result.error);
          return;
        }
        router.push(`/admin/products/${result.id}`);
        router.refresh();

      } catch {
        setActionError('The operation could not be completed. Check your connection and refresh before retrying.');
      } finally {
        setDuplicating(null);
      }
  },
    [router],
  );

  const handleDelete = useCallback(async () => {
    try {
      if (!targetDelete) return;
      setActionError(null);
      setDeleting(true);
      const result = await deleteProduct(targetDelete.id);
      setDeleting(false);
      if ('error' in result) {
        setActionError(result.error);
        setTargetDelete(null);
        return;
      }
      setProducts((prev) => prev.filter((p) => p.id !== targetDelete.id));
      setTargetDelete(null);
      router.refresh();

    } catch {
      setActionError('The operation could not be completed. Check your connection and refresh before retrying.');
    } finally {
      setDeleting(false);
    }
  }, [targetDelete, router]);

  const applyFilter = (key: string, value: string) => {
    const params = new URLSearchParams();
    for (const [name, current] of Object.entries(filters)) if (current && name !== 'page') params.set(name, current);
    params.set(key, value);
    router.push('/admin/products?' + params);
  };

  // Build category lookup map
  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((cat) => {
      map.set(cat.id, cat);
      map.set(cat.slug, cat);
    });
    return map;
  }, [categories]);

  // Primary Sports / Big Categories
  const bigCategories = useMemo(() => {
    return categories
      .filter((c) => !c.parent_id)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }, [categories]);

  // Filter products by search query and quick filter
  const filteredProducts = products;

  // Group filtered products by Big Category and Small Category
  const groupedData = useMemo(() => {
    type SubGroup = {
      subcat: Category;
      products: Product[];
    };
    type BigGroup = {
      bigCat: Category;
      subgroups: SubGroup[];
      totalCount: number;
    };

    const bigGroupMap = new Map<string, BigGroup>();

    // Initialize all big categories
    bigCategories.forEach((bigCat) => {
      const childCats = categories.filter((c) => c.parent_id === bigCat.id);
      const subgroups: SubGroup[] = childCats.map((child) => ({
        subcat: child,
        products: [],
      }));

      // Also support direct assignments to the parent category
      subgroups.push({
        subcat: {
          id: bigCat.id,
          slug: bigCat.slug,
          name: `${bigCat.name} (General)`,
          parent_id: null,
        },
        products: [],
      });

      bigGroupMap.set(bigCat.id, {
        bigCat,
        subgroups,
        totalCount: 0,
      });
    });

    // Uncategorized fallback group
    const uncategorizedBigCat: Category = {
      id: 'uncategorized',
      slug: 'uncategorized',
      name: 'Uncategorized',
      parent_id: null,
    };
    const uncategorizedSubGroup: SubGroup = {
      subcat: {
        id: 'uncategorized',
        slug: 'uncategorized',
        name: 'General',
        parent_id: null,
      },
      products: [],
    };
    const uncategorizedGroup: BigGroup = {
      bigCat: uncategorizedBigCat,
      subgroups: [uncategorizedSubGroup],
      totalCount: 0,
    };

    // Distribute products into groups
    filteredProducts.forEach((product) => {
      const catObj = Array.isArray(product.categories)
        ? product.categories[0]
        : product.categories;
      const catId = product.category_id || catObj?.id || catObj?.slug;
      const directCat = catId ? categoryMap.get(catId) : null;

      if (!directCat) {
        uncategorizedSubGroup.products.push(product);
        uncategorizedGroup.totalCount++;
        return;
      }

      if (directCat.parent_id) {
        // Belongs to a child subcategory
        const parentBig = bigGroupMap.get(directCat.parent_id);
        if (parentBig) {
          let subgroup = parentBig.subgroups.find((s) => s.subcat.id === directCat.id);
          if (!subgroup) {
            subgroup = { subcat: directCat, products: [] };
            parentBig.subgroups.push(subgroup);
          }
          subgroup.products.push(product);
          parentBig.totalCount++;
        } else {
          uncategorizedSubGroup.products.push(product);
          uncategorizedGroup.totalCount++;
        }
      } else {
        // Direct assignment to parent category
        const parentBig = bigGroupMap.get(directCat.id);
        if (parentBig) {
          const generalSub = parentBig.subgroups.find((s) => s.subcat.id === directCat.id);
          if (generalSub) {
            generalSub.products.push(product);
          } else {
            parentBig.subgroups.push({ subcat: directCat, products: [product] });
          }
          parentBig.totalCount++;
        } else {
          uncategorizedSubGroup.products.push(product);
          uncategorizedGroup.totalCount++;
        }
      }
    });

    const result: BigGroup[] = Array.from(bigGroupMap.values());
    if (uncategorizedGroup.totalCount > 0) {
      result.push(uncategorizedGroup);
    }
    return result;
  }, [bigCategories, categories, categoryMap, filteredProducts]);

  // Visible big groups according to active tab
  const visibleGroups = useMemo(() => {
    if (activeTab === 'all') {
      return groupedData;
    }
    return groupedData.filter((g) => g.bigCat.slug === activeTab || g.bigCat.id === activeTab);
  }, [groupedData, activeTab]);


  return (
    <div className="space-y-6">
      {/* Action Notification Error */}
      {actionError && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-700 dark:text-red-300"
        >
          <span>{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError(null)}
            aria-label="Dismiss error"
            className="rounded p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Search & Sports Tab Filter Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => { setActiveTab('all'); applyFilter('category', 'all'); }}
              className={`px-3.5 py-1.5 text-xs font-semibold tracking-tight rounded-full transition-colors ${
                activeTab === 'all'
                  ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f] shadow-xs'
                  : 'bg-white dark:bg-[#1d1d1f] border border-black/[0.06] dark:border-white/[0.08] text-[#6e6e73] dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'
              }`}
            >
              All ({filteredProducts.length})
            </button>
            {groupedData.map((group) => (
              <button
                key={group.bigCat.id}
                type="button"
                onClick={() => { setActiveTab(group.bigCat.slug); applyFilter('category', group.bigCat.slug); }}
                className={`px-3.5 py-1.5 text-xs font-semibold tracking-tight rounded-full transition-colors ${
                  activeTab === group.bigCat.slug
                    ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f] shadow-xs'
                    : 'bg-white dark:bg-[#1d1d1f] border border-black/[0.06] dark:border-white/[0.08] text-[#6e6e73] dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'
                }`}
              >
                {group.bigCat.name} ({group.totalCount})
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#86868b]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') applyFilter('q', searchQuery); }}
                onBlur={() => { if (searchQuery !== (filters.q ?? '')) applyFilter('q', searchQuery); }}
              placeholder="Search products…"
              className="w-full rounded-full border border-black/[0.08] dark:border-white/[0.12] bg-white dark:bg-[#1d1d1f] pl-9 pr-4 py-2 text-xs font-medium text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-amber-500 soft-shadow"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); applyFilter('q', ''); }}
                className="absolute right-3 top-2.5 text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Inventory & Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="font-semibold text-[#6e6e73] dark:text-[#86868b] mr-1">
            Quick Filter:
          </span>
          {(
            [
              { id: 'all', label: 'All Inventory' },
              { id: 'low-stock', label: 'Low Stock (≤ 5)' },
              { id: 'out-of-stock', label: 'Out of Stock (0)' },
              { id: 'on-sale', label: 'On Sale' },
              { id: 'featured', label: 'Featured' },
              { id: 'inactive', label: 'Inactive' },
            ] as { id: QuickFilter; label: string }[]
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => { setQuickFilter(f.id); applyFilter('filter', f.id); }}
              className={`px-3 py-1 rounded-full font-semibold transition-colors ${
                quickFilter === f.id
                  ? 'bg-amber-500 text-zinc-950'
                  : 'bg-white dark:bg-[#1d1d1f] border border-black/[0.06] dark:border-white/[0.08] text-[#6e6e73] dark:text-[#86868b] hover:border-amber-500'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Categorized Product Sections */}
      <div className="space-y-10">
        {visibleGroups.map((group) => {
          // If in "All" view and this group has 0 products and not searching/filtering, hide empty groups
          if (group.totalCount === 0 && activeTab === 'all' && !searchQuery && quickFilter === 'all') {
            return null;
          }

          return (
            <div key={group.bigCat.id} className="space-y-4">
              {/* Big Category Heading with Add Product button */}
              <div className="flex items-center justify-between rounded-2xl bg-white dark:bg-[#1d1d1f] px-5 py-3.5 border border-black/[0.05] dark:border-white/[0.08] soft-shadow">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
                    {group.bigCat.name}
                  </span>
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#f5f5f7] dark:bg-white/[0.08] text-[#6e6e73] dark:text-[#86868b]">
                    {group.totalCount} {group.totalCount === 1 ? 'item' : 'items'}
                  </span>
                </div>

                {group.bigCat.id !== 'uncategorized' && (
                  <Link
                    href={`/admin/categories/new?parent=${group.bigCat.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] px-3.5 py-1.5 rounded-full bg-[#f5f5f7] dark:bg-white/[0.08] hover:bg-amber-500 hover:text-zinc-950 transition-colors"
                    title={`Add subcategory to ${group.bigCat.name}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Subcategory</span>
                  </Link>
                )}
              </div>

              {/* Subcategories under this Big Category */}
              <div className="space-y-6 pl-1 sm:pl-2">
                {group.subgroups.map((subgroup) => {
                  // Only display subgroups with products, or if active tab is focused on this sport
                  const hasProducts = subgroup.products.length > 0;
                  if (!hasProducts && activeTab === 'all') {
                    return null;
                  }

                  return (
                    <div key={subgroup.subcat.id} className="space-y-2.5">
                      {/* Subcategory Little Heading with Direct Add Button */}
                      <div className="flex items-center justify-between px-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          <h3 className="font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
                            {subgroup.subcat.name}
                          </h3>
                          <span className="text-[11px] text-[#86868b] font-medium">
                            ({subgroup.products.length})
                          </span>
                        </div>

                        {subgroup.subcat.id !== 'uncategorized' && (
                          <Link
                            href={`/admin/products/new?category=${subgroup.subcat.id}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline px-2.5 py-1 rounded-full hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                            title={`Add product directly to ${subgroup.subcat.name}`}
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add {subgroup.subcat.name}</span>
                          </Link>
                        )}
                      </div>

                      {/* Products Table for this Subcategory */}
                      {hasProducts ? (
                        <div className="overflow-x-auto rounded-[24px] border border-black/[0.05] dark:border-white/[0.08] bg-white dark:bg-[#1d1d1f] soft-shadow">
                          <table className="w-full text-left text-sm">
                            <thead>
                              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/75 dark:bg-zinc-800/50 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                <th className="px-4 py-2.5">Product</th>
                                <th className="hidden px-4 py-2.5 sm:table-cell">Price</th>
                                <th className="hidden px-4 py-2.5 sm:table-cell">Stock</th>
                                <th className="hidden px-4 py-2.5 md:table-cell">Quick Flags</th>
                                <th className="px-4 py-2.5 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                              {subgroup.products.map((product) => {
                                const img = [...product.product_images].sort(
                                  (a, b) => a.sort_order - b.sort_order,
                                )[0];
                                const totalStock = product.product_variants.reduce(
                                  (s, v) => s + v.stock,
                                  0,
                                );

                                return (
                                  <tr
                                    key={product.id}
                                    className="transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40"
                                  >
                                    <td className="px-4 py-3">
                                      <div className="flex items-center gap-3">
                                        {img ? (
                                          // eslint-disable-next-line @next/next/no-img-element
                                          <img
                                            src={localImage(img.url)}
                                            alt={product.name}
                                            className="h-10 w-10 rounded-lg object-cover border border-zinc-200 dark:border-zinc-800"
                                          />
                                        ) : (
                                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500">
                                            <Package className="h-5 w-5" />
                                          </div>
                                        )}
                                        <div>
                                          <Link
                                            href={`/admin/products/${product.id}`}
                                            className="font-bold text-zinc-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                                          >
                                            {product.name}
                                          </Link>
                                          <p className="text-xs text-zinc-400 dark:text-zinc-500">
                                            /{product.slug}
                                          </p>
                                          <div className="flex items-center gap-2 mt-0.5 sm:hidden text-[11px] text-zinc-500">
                                            <span className="font-bold text-zinc-900 dark:text-zinc-100">
                                              {formatLKR(product.price)}
                                            </span>
                                            <span>·</span>
                                            <span className={totalStock === 0 ? 'text-red-500 font-bold' : ''}>
                                              {totalStock} in stock
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="hidden px-4 py-3 font-bold text-zinc-900 dark:text-white sm:table-cell">
                                      {formatLKR(product.price)}
                                    </td>
                                    <td className="hidden px-4 py-3 sm:table-cell">
                                      <span
                                        className={`font-bold ${
                                          totalStock === 0
                                            ? 'text-red-500'
                                            : totalStock <= 5
                                              ? 'text-amber-600 dark:text-amber-400'
                                              : 'text-zinc-900 dark:text-white'
                                        }`}
                                      >
                                        {totalStock} in stock
                                      </span>
                                    </td>
                                    <td className="hidden px-4 py-3 md:table-cell">
                                      <div className="flex flex-wrap gap-1">
                                        <button
                                          type="button"
                                          disabled={flagBusy === `${product.id}:featured`}
                                          onClick={() => handleFlagToggle(product, 'featured')}
                                          title="Click to toggle Featured status"
                                          className={`rounded px-2 py-0.5 text-[10px] font-bold transition-colors ${
                                            product.featured
                                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                                          }`}
                                        >
                                          Featured
                                        </button>
                                        <button
                                          type="button"
                                          disabled={flagBusy === `${product.id}:is_new_arrival`}
                                          onClick={() => handleFlagToggle(product, 'is_new_arrival')}
                                          title="Click to toggle New Arrival status"
                                          className={`rounded px-2 py-0.5 text-[10px] font-bold transition-colors ${
                                            product.is_new_arrival
                                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                                          }`}
                                        >
                                          New
                                        </button>
                                        <button
                                          type="button"
                                          disabled={flagBusy === `${product.id}:is_on_sale`}
                                          onClick={() => handleFlagToggle(product, 'is_on_sale')}
                                          title="Click to toggle On Sale status"
                                          className={`rounded px-2 py-0.5 text-[10px] font-bold transition-colors ${
                                            product.is_on_sale
                                              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
                                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                                          }`}
                                        >
                                          Sale
                                        </button>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="flex items-center justify-end gap-1">
                                        <button
                                          type="button"
                                          onClick={() => handleToggle(product)}
                                          disabled={toggling === product.id}
                                          title={product.is_active ? 'Deactivate' : 'Activate'}
                                          className="rounded-lg p-2 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
                                        >
                                          {toggling === product.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                                          ) : product.is_active ? (
                                            <ToggleRight className="h-5 w-5 text-green-600 dark:text-green-500" />
                                          ) : (
                                            <ToggleLeft className="h-5 w-5 text-zinc-300 dark:text-zinc-600" />
                                          )}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDuplicate(product)}
                                          disabled={duplicating === product.id}
                                          title="Duplicate product (clones images & variants)"
                                          className="rounded-lg p-2 text-zinc-400 dark:text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-amber-600 dark:hover:text-amber-400 disabled:opacity-50"
                                        >
                                          {duplicating === product.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                          ) : (
                                            <Copy className="h-4 w-4" />
                                          )}
                                        </button>
                                        <Link
                                          href={`/product/${product.slug}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="rounded-lg p-2 text-zinc-400 dark:text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-amber-600 dark:hover:text-amber-400"
                                          title="View on storefront"
                                        >
                                          <ExternalLink className="h-4 w-4" />
                                        </Link>
                                        <Link
                                          href={`/admin/products/${product.id}`}
                                          className="rounded-lg p-2 text-zinc-400 dark:text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
                                          title="Edit product"
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Link>
                                        <button
                                          type="button"
                                          onClick={() => setTargetDelete(product)}
                                          className="rounded-lg p-2 text-zinc-400 dark:text-zinc-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400"
                                          title="Delete product"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 p-4 text-center">
                          <p className="text-xs text-zinc-400 dark:text-zinc-500">
                            No products in {subgroup.subcat.name} yet.{' '}
                            <Link
                              href={`/admin/products/new?category=${subgroup.subcat.id}`}
                              className="font-bold text-amber-600 dark:text-amber-400 hover:underline ml-1"
                            >
                              + Add the first product
                            </Link>
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!targetDelete}
        title="Delete Product?"
        badge={targetDelete?.name}
        message="This permanently removes the product, its images, and all variants from your catalog."
        confirmLabel="Delete"
        cancelLabel="Keep Product"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setTargetDelete(null)}
      />
    </div>
  );
}