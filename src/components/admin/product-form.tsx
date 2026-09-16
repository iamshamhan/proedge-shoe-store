'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { ArrowLeft, Check, Loader2, Save } from 'lucide-react';
import { createProduct, updateProduct } from '@/app/admin/actions';
import { ImageManager } from './image-manager';
import { VariantManager } from './variant-manager';
import Link from 'next/link';

type Category = { id: string; slug: string; name: string };

type ProductFormProps = {
  categories: Category[];
  product?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    category_id: string;
    price: number;
    compare_at_price: number | null;
    featured: boolean;
    is_new_arrival: boolean;
    is_on_sale: boolean;
    is_active: boolean;
    product_images: { id: string; url: string; alt_text: string | null; sort_order: number }[];
    product_variants: { id: string; colour: string; size: number; stock: number }[];
  };
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!product;

  const [name, setName] = useState(product?.name ?? '');
  const [slug, setSlug] = useState(product?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [description, setDescription] = useState(product?.description ?? '');
  const [categoryId, setCategoryId] = useState(product?.category_id ?? '');
  const [price, setPrice] = useState(product ? String(product.price) : '');
  const [compareAtPrice, setCompareAtPrice] = useState(
    product?.compare_at_price ? String(product.compare_at_price) : '',
  );
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [isNewArrival, setIsNewArrival] = useState(product?.is_new_arrival ?? false);
  const [isOnSale, setIsOnSale] = useState(product?.is_on_sale ?? false);
  const [isActive, setIsActive] = useState(product?.is_active ?? true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugTouched && !isEdit) setSlug(slugify(value));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const priceNum = Number(price);
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!slug.trim()) {
      setError('Slug is required.');
      return;
    }
    if (!categoryId) {
      setError('Please select a category.');
      return;
    }
    if (!Number.isInteger(priceNum) || priceNum <= 0) {
      setError('Price must be a whole number greater than zero.');
      return;
    }

    const compareNum = compareAtPrice ? Number(compareAtPrice) : null;
    if (compareNum !== null && compareNum <= priceNum) {
      setError('Compare-at price must be higher than the sale price.');
      return;
    }

    const data = {
      name,
      slug,
      description,
      category_id: categoryId,
      price: priceNum,
      compare_at_price: compareNum,
      featured,
      is_new_arrival: isNewArrival,
      is_on_sale: isOnSale,
      is_active: isActive,
    };

    setSaving(true);
    const result = isEdit
      ? await updateProduct(product.id, data)
      : await createProduct(data);
    setSaving(false);

    if ('error' in result) {
      setError(result.error);
      return;
    }

    router.push(isEdit ? '/admin/products' : `/admin/products/${(result as { id: string }).id}`);
    router.refresh();
  };

  const inputClass =
    'w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20';
  const labelClass = 'mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-500';

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/admin/products"
          className="rounded-xl border border-zinc-200 bg-white p-2.5 text-zinc-500 transition-colors hover:border-zinc-300 hover:text-zinc-900"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-zinc-900">
            {isEdit ? 'Edit Product' : 'New Product'}
          </h1>
          <p className="text-sm text-zinc-400">
            {isEdit ? `/${product.slug}` : 'Create a product, then add images and variants.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-black uppercase tracking-wider text-zinc-900">
            Basic Info
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className={labelClass}>
                Name *
              </label>
              <input
                id="name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. PROEDGE Runner Sneakers"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="slug" className={labelClass}>
                Slug *
              </label>
              <input
                id="slug"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                }}
                placeholder="e.g. proedge-runner-sneakers"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="description" className={labelClass}>
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe the product…"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="category" className={labelClass}>
                Category *
              </label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={inputClass}
              >
                <option value="">Select a category…</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-black uppercase tracking-wider text-zinc-900">
            Pricing
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="price" className={labelClass}>
                Price (LKR) *
              </label>
              <input
                id="price"
                type="number"
                min={1}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 8500"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="compare_at" className={labelClass}>
                Compare-at Price (LKR)
              </label>
              <input
                id="compare_at"
                type="number"
                min={1}
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                placeholder="e.g. 10500"
                className={inputClass}
              />
            </div>
          </div>
          {isOnSale && !compareAtPrice && (
            <p className="mt-3 text-xs text-amber-600">
              Set a compare-at price to show the original price next to the discounted one.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-black uppercase tracking-wider text-zinc-900">
            Status &amp; Flags
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 px-4 py-3 transition-colors hover:border-amber-500">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 accent-amber-500"
              />
              <span className="text-sm font-bold text-zinc-700">Active</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 px-4 py-3 transition-colors hover:border-amber-500">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="h-4 w-4 accent-amber-500"
              />
              <span className="text-sm font-bold text-zinc-700">Featured</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 px-4 py-3 transition-colors hover:border-amber-500">
              <input
                type="checkbox"
                checked={isNewArrival}
                onChange={(e) => setIsNewArrival(e.target.checked)}
                className="h-4 w-4 accent-amber-500"
              />
              <span className="text-sm font-bold text-zinc-700">New Arrival</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 px-4 py-3 transition-colors hover:border-amber-500">
              <input
                type="checkbox"
                checked={isOnSale}
                onChange={(e) => setIsOnSale(e.target.checked)}
                className="h-4 w-4 accent-amber-500"
              />
              <span className="text-sm font-bold text-zinc-700">On Sale</span>
            </label>
          </div>
        </section>

        {isEdit && (
          <>
            <ImageManager productId={product.id} images={product.product_images} />
            <VariantManager productId={product.id} variants={product.product_variants} />
          </>
        )}

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-3">
          {isEdit && (
            <Link
              href={`/${product.slug}`}
              target="_blank"
              className="rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-bold text-zinc-700 transition-colors hover:bg-zinc-50"
            >
              View in store
            </Link>
          )}
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-amber-600 hover:text-zinc-950 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isEdit ? (
              <Save className="h-4 w-4" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            {isEdit ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}