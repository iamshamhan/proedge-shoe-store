import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Product, ProductCategory } from '@/types/product';
import { MOCK_PRODUCTS } from '@/data/products';

// ---------------------------------------------------------------------------
// Client factory — returns null when env vars are not yet filled
// ---------------------------------------------------------------------------

let supabaseClient: SupabaseClient | null = null;

function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (supabaseClient) return supabaseClient;
  supabaseClient = createClient(url, key);
  return supabaseClient;
}

// ---------------------------------------------------------------------------
// Supabase row shape (with joined tables)
// ---------------------------------------------------------------------------

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
  categories: { slug: string } | null;
  product_images: { url: string; alt_text: string | null; sort_order: number }[];
  product_variants: { id: string; colour: string; size: number; stock: number }[];
};

// ---------------------------------------------------------------------------
// Mapper — DB row → existing UI Product model
// ---------------------------------------------------------------------------

function mapProduct(row: DbProductRow): Product {
  const categorySlug = (row.categories?.slug ?? 'casual') as ProductCategory;

  const images = [...(row.product_images ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => img.url);

  const uniqueColors = [...new Set((row.product_variants ?? []).map((v) => v.colour))];
  const uniqueSizes = [...new Set((row.product_variants ?? []).map((v) => v.size))].sort(
    (a, b) => a - b,
  );
  const totalStock = (row.product_variants ?? []).reduce((sum, v) => sum + v.stock, 0);

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    brand: row.brand,
    category: categorySlug,
    description: row.description ?? '',
    price: row.price,
    compareAtPrice: row.compare_at_price ?? undefined,
    images: images.length > 0 ? images : [MOCK_PRODUCTS[0].images[0]],
    sizes: uniqueSizes,
    colors: uniqueColors,
    stock: totalStock,
    featured: row.featured,
    newArrival: row.is_new_arrival,
    onSale: row.is_on_sale,
    variants: (row.product_variants ?? []).map((v) => ({ id: v.id, size: v.size, colour: v.colour })),
  };
}

// ---------------------------------------------------------------------------
// Select fragment reused by every query
// ---------------------------------------------------------------------------

const PRODUCT_SELECT = `
  id, name, slug, brand, description, price, compare_at_price,
  featured, is_new_arrival, is_on_sale, is_active, created_at,
  categories!inner(slug),
  product_images(url, alt_text, sort_order),
  product_variants(id, colour, size, stock)
`;

// ---------------------------------------------------------------------------
// Internal fetch helpers — return null on any failure so callers can fall back
// ---------------------------------------------------------------------------

type FetchOptions = {
  categorySlug?: string;
  featuredOnly?: boolean;
  saleOnly?: boolean;
};

async function fetchProducts(opts: FetchOptions = {}): Promise<Product[] | null> {
  const sb = getSupabase();
  if (!sb) return null;

  try {
    let q = sb
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('is_active', true);

    if (opts.categorySlug) q = q.eq('categories.slug', opts.categorySlug);
    if (opts.featuredOnly) q = q.eq('featured', true);
    if (opts.saleOnly) q = q.eq('is_on_sale', true);

    const { data, error } = await q;

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
    const { data, error } = await sb
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

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
// Public API — mirrors src/data/products.ts but reads from Supabase first,
// falling back to MOCK_PRODUCTS on error or missing config.
// ---------------------------------------------------------------------------

export async function getAllProducts(): Promise<Product[]> {
  return (await fetchProducts()) ?? MOCK_PRODUCTS;
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return (await fetchProducts({ featuredOnly: true })) ?? MOCK_PRODUCTS.filter((p) => p.featured);
}

export async function getNewArrivals(): Promise<Product[]> {
  const db = await fetchProducts();
  if (db) return db.filter((p) => p.newArrival).slice(0, 4);
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
