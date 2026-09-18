'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getSupabaseServer } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/auth/admin';
import { isOrderStatus } from '@/lib/order-status';

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function signOut() {
  const supabase = await getSupabaseServer();
  await supabase.auth.signOut();
  redirect('/admin/login');
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function revalidateProductPaths(slug?: string | null, productId?: string | null) {
  try {
    revalidatePath('/', 'page');
    revalidatePath('/shop', 'page');
    revalidatePath('/men', 'page');
    revalidatePath('/women', 'page');
    revalidatePath('/sports', 'page');
    revalidatePath('/sale', 'page');
    revalidatePath('/admin/products', 'page');
    revalidatePath('/admin/settings', 'page');
    if (slug) {
      revalidatePath(`/product/${slug}`, 'page');
    }
    if (productId) {
      revalidatePath(`/admin/products/${productId}`, 'page');
    }
  } catch (err) {
    console.warn('revalidatePath warning:', err);
  }
}

// ---------------------------------------------------------------------------
// Product CRUD
// ---------------------------------------------------------------------------

type ProductInput = {
  name: string;
  slug: string;
  description: string;
  category_id: string;
  price: number;
  compare_at_price: number | null;
  featured: boolean;
  is_new_arrival: boolean;
  is_on_sale: boolean;
  is_active: boolean;
};

export async function createProduct(
  data: ProductInput,
): Promise<{ id: string } | { error: string }> {
  if (!data.name.trim()) return { error: 'Name is required.' };
  if (!data.slug.trim()) return { error: 'Slug is required.' };
  if (!data.category_id) return { error: 'Category is required.' };
  if (!data.price || data.price <= 0) return { error: 'Price must be greater than zero.' };

  const supabase = await getSupabaseServer();
  const { data: product, error } = await supabase
    .from('products')
    .insert({
      name: data.name.trim(),
      slug: data.slug.trim(),
      description: data.description || null,
      category_id: data.category_id,
      price: Math.round(data.price),
      compare_at_price: data.compare_at_price ? Math.round(data.compare_at_price) : null,
      featured: data.featured,
      is_new_arrival: data.is_new_arrival,
      is_on_sale: data.is_on_sale,
      is_active: data.is_active,
    })
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') return { error: 'A product with this slug already exists.' };
    return { error: error.message };
  }

  await revalidateProductPaths(data.slug.trim(), product.id);

  return { id: product.id };
}

export async function updateProduct(
  id: string,
  data: ProductInput,
): Promise<{ success: true } | { error: string }> {
  if (!data.name.trim()) return { error: 'Name is required.' };
  if (!data.slug.trim()) return { error: 'Slug is required.' };
  if (!data.category_id) return { error: 'Category is required.' };
  if (!data.price || data.price <= 0) return { error: 'Price must be greater than zero.' };

  const supabase = await getSupabaseServer();

  // Get current slug to invalidate previous URL if slug changed
  const { data: currentProduct } = await supabase
    .from('products')
    .select('slug')
    .eq('id', id)
    .single();

  const { error } = await supabase
    .from('products')
    .update({
      name: data.name.trim(),
      slug: data.slug.trim(),
      description: data.description || null,
      category_id: data.category_id,
      price: Math.round(data.price),
      compare_at_price: data.compare_at_price ? Math.round(data.compare_at_price) : null,
      featured: data.featured,
      is_new_arrival: data.is_new_arrival,
      is_on_sale: data.is_on_sale,
      is_active: data.is_active,
    })
    .eq('id', id);

  if (error) {
    if (error.code === '23505') return { error: 'A product with this slug already exists.' };
    return { error: error.message };
  }

  await revalidateProductPaths(data.slug.trim(), id);
  if (currentProduct?.slug && currentProduct.slug !== data.slug.trim()) {
    await revalidateProductPaths(currentProduct.slug, id);
  }

  return { success: true };
}

export async function deleteProduct(
  id: string,
): Promise<{ success: true } | { error: string }> {
  const supabase = await getSupabaseServer();

  // Fetch product slug before deleting to invalidate cache
  const { data: prod } = await supabase.from('products').select('slug').eq('id', id).single();

  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) return { error: error.message };

  await revalidateProductPaths(prod?.slug, id);

  return { success: true };
}

export async function toggleProductActive(
  id: string,
  isActive: boolean,
): Promise<{ success: true } | { error: string }> {
  const supabase = await getSupabaseServer();

  const { data: prod } = await supabase.from('products').select('slug').eq('id', id).single();

  const { error } = await supabase.from('products').update({ is_active: isActive }).eq('id', id);
  if (error) return { error: error.message };

  await revalidateProductPaths(prod?.slug, id);

  return { success: true };
}

// ---------------------------------------------------------------------------
// Product Images
// ---------------------------------------------------------------------------

export async function addProductImage(
  productId: string,
  url: string,
  altText: string,
  sortOrder: number,
): Promise<{ id: string } | { error: string }> {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from('product_images')
    .insert({ product_id: productId, url, alt_text: altText || null, sort_order: sortOrder })
    .select('id')
    .single();

  if (error) return { error: error.message };

  const { data: prod } = await supabase.from('products').select('slug').eq('id', productId).single();
  await revalidateProductPaths(prod?.slug, productId);

  return { id: data.id };
}

export async function removeProductImage(
  imageId: string,
  imageUrl: string,
): Promise<{ success: true } | { error: string }> {
  const supabase = await getSupabaseServer();

  const { data: img } = await supabase
    .from('product_images')
    .select('product_id')
    .eq('id', imageId)
    .single();

  const storagePath = imageUrl.split('/product-images/')[1];
  if (storagePath) {
    await supabase.storage.from('product-images').remove([storagePath]);
  }

  const { error } = await supabase.from('product_images').delete().eq('id', imageId);
  if (error) return { error: error.message };

  if (img?.product_id) {
    const { data: prod } = await supabase.from('products').select('slug').eq('id', img.product_id).single();
    await revalidateProductPaths(prod?.slug, img.product_id);
  }

  return { success: true };
}

// ---------------------------------------------------------------------------
// Product Variants
// ---------------------------------------------------------------------------

export async function addProductVariant(
  productId: string,
  colour: string,
  size: number | string,
  stock: number,
  sizeSystem: string = 'EU',
): Promise<{ id: string } | { error: string }> {
  if (!colour.trim()) return { error: 'Colour is required.' };
  const sizeValueStr = String(size).trim();
  if (!sizeValueStr) return { error: 'Size is required.' };
  if (stock < 0) return { error: 'Stock cannot be negative.' };

  const parsedInt = parseInt(sizeValueStr, 10);
  const numericSize = !isNaN(parsedInt) ? parsedInt : 0;

  const supabase = await getSupabaseServer();
  let { data, error } = await supabase
    .from('product_variants')
    .insert({
      product_id: productId,
      colour: colour.trim(),
      size: numericSize,
      size_system: sizeSystem,
      size_value: sizeValueStr,
      stock,
    })
    .select('id')
    .single();

  if (error && error.message?.includes('size_system')) {
    // Fallback for pre-migration schema
    const fallbackRes = await supabase
      .from('product_variants')
      .insert({
        product_id: productId,
        colour: colour.trim(),
        size: numericSize || 42,
        stock,
      })
      .select('id')
      .single();
    data = fallbackRes.data;
    error = fallbackRes.error;
  }

  if (error) {
    if (error.code === '23505') return { error: 'A variant with this colour and size already exists.' };
    return { error: error.message };
  }

  const { data: prod } = await supabase.from('products').select('slug').eq('id', productId).single();
  await revalidateProductPaths(prod?.slug, productId);

  return { id: data!.id };
}

export async function removeProductVariant(
  variantId: string,
): Promise<{ success: true } | { error: string }> {
  const supabase = await getSupabaseServer();

  const { data: v } = await supabase
    .from('product_variants')
    .select('product_id')
    .eq('id', variantId)
    .single();

  const { error } = await supabase.from('product_variants').delete().eq('id', variantId);
  if (error) return { error: error.message };

  if (v?.product_id) {
    const { data: prod } = await supabase.from('products').select('slug').eq('id', v.product_id).single();
    await revalidateProductPaths(prod?.slug, v.product_id);
  }

  return { success: true };
}

export async function updateVariantStock(
  variantId: string,
  stock: number,
): Promise<{ success: true } | { error: string }> {
  if (stock < 0) return { error: 'Stock cannot be negative.' };
  const supabase = await getSupabaseServer();

  const { data: v } = await supabase
    .from('product_variants')
    .select('product_id')
    .eq('id', variantId)
    .single();

  const { error } = await supabase.from('product_variants').update({ stock }).eq('id', variantId);
  if (error) return { error: error.message };

  if (v?.product_id) {
    const { data: prod } = await supabase.from('products').select('slug').eq('id', v.product_id).single();
    await revalidateProductPaths(prod?.slug, v.product_id);
  }

  return { success: true };
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export async function updateOrderStatus(
  orderId: string,
  status: string,
): Promise<{ success: true } | { error: string }> {
  if (!isOrderStatus(status)) return { error: 'Invalid order status.' };
  const supabase = await getSupabaseServer();
  const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
  if (error) return { error: error.message };
  return { success: true };
}

// ---------------------------------------------------------------------------
// Store Settings
// ---------------------------------------------------------------------------

export type UpdateSettingsInput = {
  free_delivery_enabled: boolean;
  free_delivery_threshold: number;
  default_delivery_fee: number;
  banner_tagline?: string;
  hero_product_slug?: string;
  sale_enabled?: boolean;
  sale_discount_percent?: number;
};

export async function updateStoreSettings(
  input: UpdateSettingsInput,
): Promise<{ success: true } | { error: string }> {
  const user = await getAuthUser();
  if (!user?.isAdmin) {
    return { error: 'Unauthorized: Admin privileges required.' };
  }

  if (typeof input.free_delivery_threshold !== 'number' || input.free_delivery_threshold < 0) {
    return { error: 'Free delivery threshold must be a positive number.' };
  }

  if (typeof input.default_delivery_fee !== 'number' || input.default_delivery_fee < 0) {
    return { error: 'Default delivery fee must be a positive number.' };
  }

  if (
    input.sale_discount_percent !== undefined &&
    (typeof input.sale_discount_percent !== 'number' ||
      input.sale_discount_percent < 0 ||
      input.sale_discount_percent > 100)
  ) {
    return { error: 'Sale discount percent must be between 0 and 100.' };
  }

  const supabase = await getSupabaseServer();
  const upsertPayload: Record<string, unknown> = {
    id: 'default',
    free_delivery_enabled: Boolean(input.free_delivery_enabled),
    free_delivery_threshold: Math.round(input.free_delivery_threshold),
    default_delivery_fee: Math.round(input.default_delivery_fee),
    banner_tagline: input.banner_tagline?.trim() || 'Built for Your Next Step',
    updated_at: new Date().toISOString(),
  };

  if (input.hero_product_slug !== undefined) {
    upsertPayload.hero_product_slug = input.hero_product_slug.trim() || null;
  }

  if (input.sale_enabled !== undefined) {
    upsertPayload.sale_enabled = Boolean(input.sale_enabled);
  }

  if (input.sale_discount_percent !== undefined) {
    upsertPayload.sale_discount_percent = Math.round(input.sale_discount_percent);
  }

  let { error } = await supabase.from('store_settings').upsert(upsertPayload);

  // If newly added columns do not exist yet in Supabase, retry progressively so settings still save
  if (error && (error.code === '42703' || error.message?.includes('sale_') || error.message?.includes('hero_product_slug'))) {
    delete upsertPayload.sale_enabled;
    delete upsertPayload.sale_discount_percent;
    delete upsertPayload.hero_product_slug;
    const retry = await supabase.from('store_settings').upsert(upsertPayload);
    error = retry.error;
  }

  if (error) {
    if (error.code === '42P01') {
      return {
        error:
          'Table "store_settings" does not exist in Supabase yet. Please run the SQL file "supabase/add_settings.sql" in your Supabase SQL Editor.',
      };
    }
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  revalidatePath('/sale');
  revalidatePath('/cart');
  revalidatePath('/checkout');
  revalidatePath('/admin/settings');
  return { success: true };
}
