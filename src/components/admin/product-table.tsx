'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
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
} from 'lucide-react';
import { toggleProductActive, deleteProduct } from '@/app/admin/actions';
import { ConfirmDialog } from './confirm-dialog';
import { formatLKR } from '@/data/products';

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  is_active: boolean;
  featured: boolean;
  is_new_arrival: boolean;
  is_on_sale: boolean;
  categories: { slug: string; name: string } | { slug: string; name: string }[] | null;
  product_images: { url: string; sort_order: number }[];
  product_variants: { id: string; stock: number }[];
};

export function ProductTable({ products: initial }: { products: Product[] }) {
  const router = useRouter();
  const [products, setProducts] = useState(initial);
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [targetDelete, setTargetDelete] = useState<Product | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleToggle = useCallback(
    async (product: Product) => {
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
    },
    [router],
  );

  const handleDelete = useCallback(async () => {
    if (!targetDelete) return;
    setActionError(null);
    setDeleting(true);
    const result = await deleteProduct(targetDelete.id);
    setDeleting(false);
    if ('error' in result) {
      setActionError(result.error);
      return;
    }
    setProducts((prev) => prev.filter((p) => p.id !== targetDelete.id));
    setTargetDelete(null);
    router.refresh();
  }, [targetDelete, router]);

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-6 py-16 text-center">
        <Package className="mx-auto mb-4 h-12 w-12 text-zinc-300 dark:text-zinc-600" />
        <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400">No products yet.</p>
        <Link
          href="/admin/products/new"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-zinc-900 dark:bg-amber-500 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white dark:text-zinc-950 transition-colors hover:bg-amber-600 dark:hover:bg-amber-400 hover:text-zinc-950"
        >
          <Plus className="h-4 w-4" />
          Create your first product
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        {actionError && (
          <div
            role="alert"
            className="flex items-center justify-between gap-3 border-b border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-700 dark:text-red-300"
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
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <th className="px-4 py-3">Product</th>
              <th className="hidden px-4 py-3 md:table-cell">Category</th>
              <th className="hidden px-4 py-3 sm:table-cell">Price</th>
              <th className="hidden px-4 py-3 sm:table-cell">Stock</th>
              <th className="hidden px-4 py-3 lg:table-cell">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {products.map((product) => {
              const img = [...product.product_images].sort((a, b) => a.sort_order - b.sort_order)[0];
              const totalStock = product.product_variants.reduce((s, v) => s + v.stock, 0);
              const categoryName = Array.isArray(product.categories)
                ? product.categories[0]?.name
                : product.categories?.name;

              return (
                <tr key={product.id} className="transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={img.url}
                          alt={product.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500">
                          <Package className="h-5 w-5" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-zinc-900 dark:text-white">{product.name}</p>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500">/{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <span className="rounded-lg bg-zinc-100 dark:bg-zinc-800 px-2 py-1 text-xs font-bold text-zinc-600 dark:text-zinc-300">
                      {categoryName ?? '—'}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 font-bold text-zinc-900 dark:text-white sm:table-cell">
                    {formatLKR(product.price)}
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <span className={`font-bold ${totalStock === 0 ? 'text-red-500' : 'text-zinc-900 dark:text-white'}`}>
                      {totalStock}
                    </span>
                  </td>
                  <td className="hidden gap-1 px-4 py-3 lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {product.featured && (
                        <span className="rounded bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                          Featured
                        </span>
                      )}
                      {product.is_new_arrival && (
                        <span className="rounded bg-green-100 dark:bg-green-950/60 px-1.5 py-0.5 text-[10px] font-bold text-green-700 dark:text-green-400">
                          New
                        </span>
                      )}
                      {product.is_on_sale && (
                        <span className="rounded bg-red-100 dark:bg-red-950/60 px-1.5 py-0.5 text-[10px] font-bold text-red-700 dark:text-red-400">
                          Sale
                        </span>
                      )}
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
                      <Link
                        href={`/product/${product.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg p-2 text-zinc-400 dark:text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-amber-600 dark:hover:text-amber-400"
                        title="View on store"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="rounded-lg p-2 text-zinc-400 dark:text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setTargetDelete(product)}
                        className="rounded-lg p-2 text-zinc-400 dark:text-zinc-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400"
                        title="Delete"
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

      <ConfirmDialog
        open={!!targetDelete}
        title="Delete product"
        message={`Are you sure you want to delete "${targetDelete?.name}"? This will permanently remove the product, its images, and all variants. This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setTargetDelete(null)}
      />
    </>
  );
}