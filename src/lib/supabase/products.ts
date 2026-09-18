import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Product, ProductCategory, ProductVariant, SizeSystem, CategoryItem } from '@/types/product';
import { MOCK_PRODUCTS } from '@/data/products';
import { getStoreSettings } from '@/lib/settings';

// ---------------------------------------------------------------------------
// Client factory — returns null when env vars are not yet filled
// ---------------------------------------------------------------------------

let supabaseClient: SupabaseClient | null = null;

function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (supabaseClient) return supabaseClient;
  supabaseClient = createClient(url, key, {
    auth: { persistSession: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
    },
  });
  return supabaseClient;
}

// ---------------------------------------------------------------------------
// Supabase row shape (with joined tables)
// ---------------------------------------------------------------------------

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
  PARENT_SPORTS,
  ALL_CANONICAL_CATEGORIES,
} from '@/data/categories';

// ---------------------------------------------------------------------------
// Mapper — DB row → existing UI Product model
// ---------------------------------------------------------------------------

function mapProduct(row: DbProductRow): Product {
  const categorySlug = (row.categories?.slug ?? 'running-shoes') as ProductCategory;
  const categoryName = row.categories?.name ?? undefined;
  const parent = getParentCategory(categorySlug);
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
    images: images.length > 0 ? images : [MOCK_PRODUCTS[0].images[0]],
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

// ---------------------------------------------------------------------------
// Select fragments (with safe fallback if migration hasn't run yet)
// ---------------------------------------------------------------------------

const PRODUCT_SELECT_FULL = `
  id, name, slug, brand, description, price, compare_at_price,
  featured, is_new_arrival, is_on_sale, is_active, created_at,
  categories!inner(slug, name, parent_id),
  product_images(url, alt_text, sort_order),
  product_variants(id, colour, size, size_system, size_value, stock)
`;

const PRODUCT_SELECT_LEGACY = `
  id, name, slug, brand, description, price, compare_at_price,
  featured, is_new_arrival, is_on_sale, is_active, created_at,
  categories!inner(slug),
  product_images(url, alt_text, sort_order),
  product_variants(id, colour, size, stock)
`;

// ---------------------------------------------------------------------------
// Internal fetch helpers
// ---------------------------------------------------------------------------

type FetchOptions = {
  categorySlug?: string;
  featuredOnly?: boolean;
  saleOnly?: boolean;
};

async function executeProductQuery(sb: SupabaseClient, querySelect: string, opts: FetchOptions) {
  let q = sb
    .from('products')
    .select(querySelect)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (opts.categorySlug) {
    const matchingSlugs = getCategorySlugsForQuery(opts.categorySlug);
    if (matchingSlugs.length > 1) {
      q = q.in('categories.slug', matchingSlugs);
    } else if (matchingSlugs.length === 1) {
      q = q.eq('categories.slug', matchingSlugs[0]);
    }
  }
  if (opts.featuredOnly) q = q.eq('featured', true);
  if (opts.saleOnly) q = q.eq('is_on_sale', true);

  return q;
}

async function fetchProducts(opts: FetchOptions = {}): Promise<Product[] | null> {
  const sb = getSupabase();
  if (!sb) return null;

  try {
    // Try full select first
    let { data, error } = await executeProductQuery(sb, PRODUCT_SELECT_FULL, opts);

    // If size_system column doesn't exist yet, fall back to legacy select
    if (error && error.message.includes('size_system')) {
      const fallbackResult = await executeProductQuery(sb, PRODUCT_SELECT_LEGACY, opts);
      data = fallbackResult.data;
      error = fallbackResult.error;
    }

    if (error) {
      console.error('[supabase] products query failed:', error.message);
      return null;
    }

    return (data as unknown as DbProductRow[]).map(mapProduct);
  } catch (err) {
    console.error('[supabase] connection error:', err);
    return null;
  }
}

async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const sb = getSupabase();
  if (!sb) return null;

  try {
    let data: unknown;
    let error: { message: string } | null = null;

    const fullResult = await sb
      .from('products')
      .select(PRODUCT_SELECT_FULL)
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    data = fullResult.data;
    error = fullResult.error;

    if (error && error.message.includes('size_system')) {
      const legacyResult = await sb
        .from('products')
        .select(PRODUCT_SELECT_LEGACY)
        .eq('slug', slug)
        .eq('is_active', true)
        .single();
      data = legacyResult.data;
      error = legacyResult.error;
    }

    if (error || !data) {
      console.error('[supabase] product slug query failed:', error?.message);
      return null;
    }

    return mapProduct(data as unknown as DbProductRow);
  } catch (err) {
    console.error('[supabase] connection error:', err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Categories API
// ---------------------------------------------------------------------------

export async function getAllCategories(): Promise<CategoryItem[]> {
  const sb = getSupabase();
  if (!sb) {
    return ALL_CANONICAL_CATEGORIES.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      parentId: c.parentId,
      sortOrder: c.sortOrder,
      description: c.description,
    }));
  }

  try {
    const { data, error } = await sb
      .from('categories')
      .select('id, slug, name, parent_id, sort_order, description')
      .order('sort_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return ALL_CANONICAL_CATEGORIES.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        parentId: c.parentId,
        sortOrder: c.sortOrder,
        description: c.description,
      }));
    }

    return data.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      parentId: c.parent_id,
      sortOrder: c.sort_order,
      description: c.description,
    }));
  } catch {
    return ALL_CANONICAL_CATEGORIES.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      parentId: c.parentId,
      sortOrder: c.sortOrder,
      description: c.description,
    }));
  }
}

export async function getCategoriesHierarchy(): Promise<CategoryItem[]> {
  const categories = await getAllCategories();
  const parents = categories.filter(
    (c) => !c.parentId && !['men', 'women', 'sports', 'casual'].includes(c.slug),
  );
  if (parents.length === 0) {
    return PARENT_SPORTS as CategoryItem[];
  }
  return parents
    .map((parent) => ({
      ...parent,
      children: categories
        .filter((c) => c.parentId === parent.id)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

// ---------------------------------------------------------------------------
// Public Products API
// ---------------------------------------------------------------------------

export async function getAllProducts(): Promise<Product[]> {
  return (await fetchProducts()) ?? MOCK_PRODUCTS;
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return (await fetchProducts({ featuredOnly: true })) ?? MOCK_PRODUCTS.filter((p) => p.featured);
}

export async function getNewArrivals(): Promise<Product[]> {
  const db = await fetchProducts();
  if (db && db.length > 0) return db.filter((p) => p.newArrival).slice(0, 4);
  return MOCK_PRODUCTS.filter((p) => p.newArrival).slice(0, 4);
}

export async function getSaleProducts(): Promise<Product[]> {
  return (await fetchProducts({ saleOnly: true })) ?? MOCK_PRODUCTS.filter((p) => p.onSale);
}

export async function getProductsByCategory(category: ProductCategory): Promise<Product[]> {
  return (
    (await fetchProducts({ categorySlug: category })) ??
    MOCK_PRODUCTS.filter((p) => p.category === category)
  );
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const db = await fetchProductBySlug(slug);
  if (db) return db;
  return MOCK_PRODUCTS.find((p) => p.slug === slug) ?? null;
}

export async function getHeroProduct(): Promise<Product | null> {
  try {
    const settings = await getStoreSettings();
    if (settings.heroProductSlug) {
      const product = await getProductBySlug(settings.heroProductSlug);
      if (product) return product;
    }

    // Fallback 1: first featured product
    const featured = await getFeaturedProducts();
    if (featured && featured.length > 0) return featured[0];

    // Fallback 2: runner-x1 or first product in mock catalog
    return (await getProductBySlug('proedge-runner-x1')) ?? MOCK_PRODUCTS[0] ?? null;
  } catch (err) {
    console.error('Error in getHeroProduct:', err);
    return MOCK_PRODUCTS.find((p) => p.slug === 'proedge-runner-x1') ?? MOCK_PRODUCTS[0] ?? null;
  }
}
