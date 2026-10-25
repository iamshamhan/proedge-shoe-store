import { cache } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { Product, ProductCategory, ProductVariant, SizeSystem, CategoryItem } from '@/types/product';
import { getStoreSettings } from '@/lib/settings';
import { readAllRows } from './read-all';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('The catalog is temporarily unavailable.');
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (input, init) => fetch(input, { ...init, next: { tags: ['catalog'] }, signal: AbortSignal.timeout(8000) }) },
  });
}

type DbVariantRow = {
  id: string;
  colour: string;
  size?: number | string | null;
  size_system?: string | null;
  size_value?: string | null;
  stock: number;
};

type DbProductRow = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  featured: boolean;
  is_new_arrival: boolean;
  is_on_sale: boolean;
  is_active: boolean;
  created_at: string;
  categories: { slug: string; name?: string | null; parent_id?: string | null } | null;
  product_images: { url: string; alt_text: string | null; sort_order: number }[];
  product_variants: DbVariantRow[];
};

import {
  getCategorySlugsForQuery,
  getParentCategory,
} from '@/data/categories';

// ---------------------------------------------------------------------------
// Mapper — DB row → existing UI Product model
// ---------------------------------------------------------------------------

function mapProduct(row: DbProductRow, customHierarchy?: CategoryItem[]): Product {
  const categorySlug = (row.categories?.slug ?? 'running-shoes') as ProductCategory;
  const categoryName = row.categories?.name ?? undefined;
  const parent = getParentCategory(categorySlug, customHierarchy);
  const sport = parent?.slug;
  const sportName = parent?.name;

  const images = [...(row.product_images ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => img.url);

  const uniqueColors = [...new Set((row.product_variants ?? []).map((v) => v.colour))];

  // Extract unique sizes supporting numbers and textual size values
  const uniqueSizes = [
    ...new Set(
      (row.product_variants ?? []).map((v) =>
        v.size_value !== undefined && v.size_value !== null && v.size_value !== ''
          ? String(v.size_value)
          : String(v.size ?? ''),
      ).filter(Boolean),
    ),
  ].sort((a, b) => {
    const numA = Number(a);
    const numB = Number(b);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return a.localeCompare(b);
  });

  const totalStock = (row.product_variants ?? []).reduce((sum, v) => sum + v.stock, 0);

  // Detect dominant size system from variants or default to EU
  const firstSystem = (row.product_variants ?? []).find((v) => v.size_system)?.size_system as
    | SizeSystem
    | undefined;
  const sizeSystem: SizeSystem = firstSystem || 'EU';

  const variants: ProductVariant[] = (row.product_variants ?? []).map((v) => {
    const sizeVal =
      v.size_value !== undefined && v.size_value !== null && v.size_value !== ''
        ? String(v.size_value)
        : String(v.size ?? '');
    return {
      id: v.id,
      colour: v.colour,
      sizeSystem: (v.size_system as SizeSystem) || 'EU',
      sizeValue: sizeVal,
      size: sizeVal,
      stock: v.stock,
    };
  });

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    brand: row.brand,
    category: categorySlug,
    categoryName,
    sport,
    sportName,
    description: row.description ?? '',
    price: row.price,
    compareAtPrice: row.compare_at_price ?? undefined,
    images: images.length > 0 ? images : ['/product-placeholder.svg'],
    sizes: uniqueSizes,
    sizeSystem,
    colors: uniqueColors.length > 0 ? uniqueColors : ['Standard'],
    stock: totalStock,
    featured: row.featured,
    newArrival: row.is_new_arrival,
    onSale: row.is_on_sale,
    variants,
  };
}

const PRODUCT_SELECT = `id, name, slug, brand, description, price, compare_at_price,
  featured, is_new_arrival, is_on_sale, is_active, created_at,
  categories!inner(slug, name, parent_id), product_images(url, alt_text, sort_order),
  product_variants(id, colour, size, size_system, size_value, stock)`;

type FetchOptions = { categorySlug?: string; featuredOnly?: boolean; saleOnly?: boolean };
async function fetchProducts(opts: FetchOptions = {}): Promise<Product[]> {
  const sb = getSupabase();
  const hierarchy = await getCategoriesHierarchy();
  const rows = await readAllRows((from, to) => {
    let q = sb.from('products').select(PRODUCT_SELECT).eq('is_active', true)
      .order('created_at', { ascending: false }).order('id').range(from, to);
    if (opts.categorySlug) {
      const slugs = getCategorySlugsForQuery(opts.categorySlug, hierarchy);
      if (slugs.length) q = q.in('categories.slug', slugs);
    }
    if (opts.featuredOnly) q = q.eq('featured', true);
    if (opts.saleOnly) q = q.eq('is_on_sale', true);
    return q;
  });
  return (rows as unknown as DbProductRow[]).map(row => mapProduct(row, hierarchy));
}

export const getAllCategories = cache(async (): Promise<CategoryItem[]> => {
  const sb = getSupabase();
  const data = await readAllRows((from, to) => sb.from('categories')
    .select('id,slug,name,parent_id,sort_order,description,image_url,subtitle,tagline')
    .order('sort_order').order('id').range(from,to));
  return data.map(c => ({ id:c.id, slug:c.slug, name:c.name, parentId:c.parent_id,
    sortOrder:c.sort_order, description:c.description, imageUrl:c.image_url,
    subtitle:c.subtitle, tagline:c.tagline }));
});
export const getCategoriesHierarchy = cache(async (): Promise<CategoryItem[]> => {
  const categories = await getAllCategories();
  return categories.filter(c => !c.parentId && !['men','women','sports','casual'].includes(c.slug))
    .map(parent => ({ ...parent, children: categories.filter(c => c.parentId === parent.id) }));
});
export const getAllProducts = cache(async () => fetchProducts());
export const getFeaturedProducts = cache(async () => fetchProducts({ featuredOnly: true }));
export const getNewArrivals = cache(async () => (await fetchProducts()).filter(p => p.newArrival).slice(0,8));
export const getSaleProducts = cache(async () => fetchProducts({ saleOnly: true }));
export const getProductsByCategory = cache(async (category: ProductCategory) => fetchProducts({ categorySlug: category }));
export const getProductBySlug = cache(async (slug: string): Promise<Product|null> => {
  const sb = getSupabase();
  const [result, hierarchy] = await Promise.all([
    sb.from('products').select(PRODUCT_SELECT).eq('slug',slug).eq('is_active',true).maybeSingle(),
    getCategoriesHierarchy(),
  ]);
  if (result.error) throw new Error('The product could not be loaded. Please try again.');
  return result.data ? mapProduct(result.data as unknown as DbProductRow,hierarchy) : null;
});
export const getHeroProduct = cache(async (): Promise<Product|null> => {
  const settings = await getStoreSettings();
  if (settings.heroProductSlug) {
    const product = await getProductBySlug(settings.heroProductSlug);
    if (product) return product;
  }
  return (await getFeaturedProducts())[0] ?? (await getAllProducts())[0] ?? null;
});
