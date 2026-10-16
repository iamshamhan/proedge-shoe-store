'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getSupabaseServer } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/auth/admin';
import {
  VALID_ORDER_STATUSES,
  type OrderStatus,
  type SaleItemInput,
  type CatalogProductOption,
  type OrderItemWithStock,
} from '@/types/order';


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
    revalidatePath('/admin', 'page');
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
  const user = await getAuthUser();
  if (!user?.isAdmin) return { error: "Unauthorized." };

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
  const user = await getAuthUser();
  if (!user?.isAdmin) return { error: "Unauthorized." };

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
  const user = await getAuthUser();
  if (!user?.isAdmin) return { error: "Unauthorized." };

  const supabase = await getSupabaseServer();

  // Fetch product slug and images before deleting
  const [{ data: prod }, { data: imgs }] = await Promise.all([
    supabase.from('products').select('slug').eq('id', id).single(),
    supabase.from('product_images').select('url').eq('product_id', id),
  ]);

  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) {
    if (error.code === '23503') {
      return {
        error:
          'This product is linked to existing customer order history and cannot be permanently deleted. Toggle it to Inactive instead to hide it from the store.',
      };
    }
    return { error: error.message };
  }

  // Clean up storage images after successful product deletion
  if (imgs && imgs.length > 0) {
    const storagePaths = imgs
      .map((img) => img.url?.split('/product-images/')[1])
      .filter((p): p is string => Boolean(p));
    if (storagePaths.length > 0) {
      await supabase.storage.from('product-images').remove(storagePaths);
    }
  }

  await revalidateProductPaths(prod?.slug, id);

  return { success: true };
}

export async function toggleProductActive(
  id: string,
  isActive: boolean,
): Promise<{ success: true } | { error: string }> {
  const user = await getAuthUser();
  if (!user?.isAdmin) return { error: "Unauthorized." };

  const supabase = await getSupabaseServer();

  const { data: prod } = await supabase.from('products').select('slug').eq('id', id).single();

  const { error } = await supabase.from('products').update({ is_active: isActive }).eq('id', id);
  if (error) return { error: error.message };

  await revalidateProductPaths(prod?.slug, id);

  return { success: true };
}

export async function updateProductFlags(
  id: string,
  updates: {
    featured?: boolean;
    is_new_arrival?: boolean;
    is_on_sale?: boolean;
    price?: number;
  },
): Promise<{ success: true } | { error: string }> {
  const user = await getAuthUser();
  if (!user?.isAdmin) return { error: 'Unauthorized.' };

  if (updates.price !== undefined && (!Number.isFinite(updates.price) || updates.price <= 0)) {
    return { error: 'Price must be greater than zero.' };
  }

  const supabase = await getSupabaseServer();
  const payload: Record<string, unknown> = {};
  if (updates.featured !== undefined) payload.featured = updates.featured;
  if (updates.is_new_arrival !== undefined) payload.is_new_arrival = updates.is_new_arrival;
  if (updates.is_on_sale !== undefined) payload.is_on_sale = updates.is_on_sale;
  if (updates.price !== undefined) payload.price = Math.round(updates.price);

  const { data: prod } = await supabase.from('products').select('slug').eq('id', id).single();
  const { error } = await supabase.from('products').update(payload).eq('id', id);
  if (error) return { error: error.message };

  await revalidateProductPaths(prod?.slug, id);
  return { success: true };
}

export async function duplicateProduct(
  sourceId: string,
): Promise<{ id: string; slug: string } | { error: string }> {
  const user = await getAuthUser();
  if (!user?.isAdmin) return { error: 'Unauthorized.' };

  const supabase = await getSupabaseServer();

  const { data: source, error: fetchErr } = await supabase
    .from('products')
    .select(
      `
      name, slug, description, category_id, price, compare_at_price,
      featured, is_new_arrival, is_on_sale,
      product_images (url, alt_text, sort_order),
      product_variants (colour, size, size_system, size_value, stock)
    `,
    )
    .eq('id', sourceId)
    .single();

  if (fetchErr || !source) {
    return { error: fetchErr?.message || 'Source product not found.' };
  }

  const suffix = Math.random().toString(36).substring(2, 6);
  const newName = `${source.name} (Copy)`;
  const newSlug = `${source.slug}-copy-${suffix}`;

  const { data: created, error: insertErr } = await supabase
    .from('products')
    .insert({
      name: newName,
      slug: newSlug,
      description: source.description,
      category_id: source.category_id,
      price: source.price,
      compare_at_price: source.compare_at_price,
      featured: source.featured,
      is_new_arrival: source.is_new_arrival,
      is_on_sale: source.is_on_sale,
      is_active: false, // Start inactive so admin can review before publishing
    })
    .select('id')
    .single();

  if (insertErr || !created) {
    return { error: insertErr?.message || 'Failed to duplicate product.' };
  }

  // Copy images references
  if (Array.isArray(source.product_images) && source.product_images.length > 0) {
    await supabase.from('product_images').insert(
      source.product_images.map((img) => ({
        product_id: created.id,
        url: img.url,
        alt_text: img.alt_text,
        sort_order: img.sort_order,
      })),
    );
  }

  // Copy variants
  if (Array.isArray(source.product_variants) && source.product_variants.length > 0) {
    await supabase.from('product_variants').insert(
      source.product_variants.map((v) => ({
        product_id: created.id,
        colour: v.colour,
        size: v.size ?? 0,
        size_system: v.size_system || 'EU',
        size_value: v.size_value || String(v.size ?? ''),
        stock: v.stock,
      })),
    );
  }

  await revalidateProductPaths(newSlug, created.id);
  return { id: created.id, slug: newSlug };
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
  const user = await getAuthUser();
  if (!user?.isAdmin) return { error: "Unauthorized." };

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

export async function reorderProductImages(
  productId: string,
  orderedImageIds: string[],
): Promise<{ success: true } | { error: string }> {
  const user = await getAuthUser();
  if (!user?.isAdmin) return { error: 'Unauthorized.' };

  const supabase = await getSupabaseServer();

  for (let i = 0; i < orderedImageIds.length; i++) {
    const { error } = await supabase
      .from('product_images')
      .update({ sort_order: i })
      .eq('id', orderedImageIds[i])
      .eq('product_id', productId);
    if (error) return { error: error.message };
  }

  const { data: prod } = await supabase.from('products').select('slug').eq('id', productId).single();
  await revalidateProductPaths(prod?.slug, productId);

  return { success: true };
}

export async function removeProductImage(
  imageId: string,
  imageUrl: string,
): Promise<{ success: true } | { error: string }> {
  const user = await getAuthUser();
  if (!user?.isAdmin) return { error: "Unauthorized." };

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
  const user = await getAuthUser();
  if (!user?.isAdmin) return { error: "Unauthorized." };

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

export async function addProductVariantsBulk(
  productId: string,
  colour: string,
  sizes: string[],
  stock: number,
  sizeSystem: string = 'EU',
): Promise<
  | {
      added: {
        id: string;
        colour: string;
        size: string;
        size_system: string;
        size_value: string;
        stock: number;
      }[];
      skippedCount: number;
    }
  | { error: string }
> {
  const user = await getAuthUser();
  if (!user?.isAdmin) return { error: 'Unauthorized.' };

  const cleanColour = colour.trim();
  if (!cleanColour) return { error: 'Colour is required.' };

  const uniqueSizes = Array.from(new Set(sizes.map((s) => s.trim()).filter(Boolean)));
  if (uniqueSizes.length === 0) return { error: 'At least one size is required.' };
  if (stock < 0) return { error: 'Stock cannot be negative.' };

  const supabase = await getSupabaseServer();

  // Check existing variants for this product to skip duplicates gracefully
  const { data: existing } = await supabase
    .from('product_variants')
    .select('colour, size, size_value')
    .eq('product_id', productId);

  const existingKeys = new Set(
    (existing ?? []).map(
      (v) => `${v.colour.toLowerCase()}::${String(v.size_value || v.size).toLowerCase()}`,
    ),
  );

  const toInsert = uniqueSizes.filter(
    (sz) => !existingKeys.has(`${cleanColour.toLowerCase()}::${sz.toLowerCase()}`),
  );
  const skippedCount = uniqueSizes.length - toInsert.length;

  if (toInsert.length === 0) {
    return { error: `All selected sizes for "${cleanColour}" already exist.` };
  }

  const rows = toInsert.map((sz) => {
    const parsedInt = parseInt(sz, 10);
    const numericSize = !isNaN(parsedInt) ? parsedInt : 0;
    return {
      product_id: productId,
      colour: cleanColour,
      size: numericSize,
      size_system: sizeSystem,
      size_value: sz,
      stock,
    };
  });

  const { data: inserted, error } = await supabase
    .from('product_variants')
    .insert(rows)
    .select('id, colour, size, size_system, size_value, stock');

  if (error) {
    if (error.code === '23505') {
      return { error: 'One or more of these colour/size combinations already exist.' };
    }
    return { error: error.message };
  }

  const { data: prod } = await supabase.from('products').select('slug').eq('id', productId).single();
  await revalidateProductPaths(prod?.slug, productId);

  return {
    added: (inserted ?? []).map((v) => ({
      id: v.id,
      colour: v.colour,
      size: String(v.size_value || v.size),
      size_system: v.size_system || sizeSystem,
      size_value: String(v.size_value || v.size),
      stock: v.stock,
    })),
    skippedCount,
  };
}

export async function removeProductVariant(
  variantId: string,
): Promise<{ success: true } | { error: string }> {
  const user = await getAuthUser();
  if (!user?.isAdmin) return { error: "Unauthorized." };

  const supabase = await getSupabaseServer();

  const { data: v } = await supabase
    .from('product_variants')
    .select('product_id')
    .eq('id', variantId)
    .single();

  const { error } = await supabase.from('product_variants').delete().eq('id', variantId);
  if (error) {
    if (error.code === '23503') {
      return {
        error:
          'This size variant is referenced by past customer orders and cannot be deleted. Set its stock to 0 instead.',
      };
    }
    return { error: error.message };
  }

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
  const user = await getAuthUser();
  if (!user?.isAdmin) return { error: "Unauthorized." };

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
  brand_name?: string;
  contact_address?: string;
  contact_phone?: string;
  contact_email?: string;
  whatsapp_number?: string;
  sale_section_title?: string;
  sale_section_subtitle?: string;
  new_arrivals_title?: string;
  new_arrivals_subtitle?: string;
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

  if (input.brand_name !== undefined) {
    upsertPayload.brand_name = input.brand_name.trim() || 'PROEDGE';
  }

  if (input.contact_address !== undefined) {
    upsertPayload.contact_address = input.contact_address.trim() || null;
  }

  if (input.contact_phone !== undefined) {
    upsertPayload.contact_phone = input.contact_phone.trim() || null;
  }

    if (input.contact_email !== undefined) {
    upsertPayload.contact_email = input.contact_email.trim() || null;
  }
  if (input.whatsapp_number !== undefined) {
    upsertPayload.whatsapp_number = input.whatsapp_number.trim() || null;
  }
  if (input.sale_section_title !== undefined) {
    upsertPayload.sale_section_title = input.sale_section_title.trim() || null;
  }
  if (input.sale_section_subtitle !== undefined) {
    upsertPayload.sale_section_subtitle = input.sale_section_subtitle.trim() || null;
  }
  if (input.new_arrivals_title !== undefined) {
    upsertPayload.new_arrivals_title = input.new_arrivals_title.trim() || null;
  }
  if (input.new_arrivals_subtitle !== undefined) {
    upsertPayload.new_arrivals_subtitle = input.new_arrivals_subtitle.trim() || null;
  }


  let { error } = await supabase.from('store_settings').upsert(upsertPayload);

  // If newly added columns do not exist yet in Supabase, retry progressively so settings still save
  if (
    error &&
    (error.code === '42703' ||
      error.message?.includes('sale_') ||
      error.message?.includes('new_arrivals_') ||
      error.message?.includes('whatsapp_') ||
      error.message?.includes('hero_product_slug') ||
      error.message?.includes('brand_name') ||
      error.message?.includes('contact_'))
  ) {
    delete upsertPayload.sale_enabled;
    delete upsertPayload.sale_discount_percent;
    delete upsertPayload.hero_product_slug;
    delete upsertPayload.brand_name;
    delete upsertPayload.contact_address;
    delete upsertPayload.contact_phone;
    delete upsertPayload.contact_email;
    delete upsertPayload.whatsapp_number;
    delete upsertPayload.sale_section_title;
    delete upsertPayload.sale_section_subtitle;
    delete upsertPayload.new_arrivals_title;
    delete upsertPayload.new_arrivals_subtitle;
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
  revalidatePath('/policies');
  revalidatePath('/privacy');
  revalidatePath('/admin/settings');
  return { success: true };
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export async function createCategory(data: {
  name: string;
  slug: string;
  description?: string;
    parent_id?: string;
    image_url?: string;
    subtitle?: string;
    tagline?: string;
}): Promise<{ success: true; id: string } | { error: string }> {
  const user = await getAuthUser();
  if (!user?.isAdmin) return { error: 'Unauthorized.' };

  const supabase = await getSupabaseServer();
  
  const query = supabase.from('categories').select('sort_order').order('sort_order', { ascending: false }).limit(1);
  if (data.parent_id) {
    query.eq('parent_id', data.parent_id);
  } else {
    query.is('parent_id', null);
  }
  
  const { data: maxSort } = await query;
  const sort_order = (maxSort?.[0]?.sort_order ?? 0) + 10;

  const { data: catData, error } = await supabase
    .from('categories')
    .insert({
      name: data.name,
      slug: data.slug,
      description: data.description || null,
        image_url: data.image_url || null,
        subtitle: data.subtitle || null,
        tagline: data.tagline || null,
        parent_id: data.parent_id || null,
      sort_order,
    })
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') return { error: 'A category with this slug already exists.' };
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  revalidatePath('/shop', 'page');
  revalidatePath('/admin/categories');
  return { success: true, id: catData.id };
}
export async function updateAdminProfile(data: { email?: string; password?: string }) {
  const user = await getAuthUser();
  if (!user?.isAdmin) return { error: 'Unauthorized.' };

  const supabase = await getSupabaseServer();
  const updates: Record<string, string> = {};
  if (data.email) updates.email = data.email;
  if (data.password) updates.password = data.password;

  if (Object.keys(updates).length === 0) return { success: true };

  const { error } = await supabase.auth.updateUser(updates);
  if (error) return { error: error.message };

  return { success: true };
}

export async function updateCategory(
  id: string,
  data: {
    name: string;
    slug: string;
    description?: string;
    parent_id?: string;
    image_url?: string;
    subtitle?: string;
    tagline?: string;
  }
): Promise<{ success: true } | { error: string }> {
  const user = await getAuthUser();
  if (!user?.isAdmin) return { error: 'Unauthorized.' };

  const supabase = await getSupabaseServer();

  // Keep the tree to two levels (main category -> subcategory) and never loop.
  if (data.parent_id) {
    if (data.parent_id === id) {
      return { error: 'A category cannot be its own parent.' };
    }

    const { data: parent } = await supabase
      .from('categories')
      .select('id, parent_id')
      .eq('id', data.parent_id)
      .maybeSingle();
    if (!parent) return { error: 'The selected parent category no longer exists.' };
    if (parent.parent_id) {
      return { error: 'Subcategories can only be placed under a main category.' };
    }

    const { count: childCount } = await supabase
      .from('categories')
      .select('id', { count: 'exact', head: true })
      .eq('parent_id', id);
    if ((childCount ?? 0) > 0) {
      return {
        error:
          'This category has subcategories, so it must stay a main category. Move or delete its subcategories first.',
      };
    }
  }

  const { error } = await supabase
    .from('categories')
    .update({
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      image_url: data.image_url || null,
      subtitle: data.subtitle || null,
      tagline: data.tagline || null,
      parent_id: data.parent_id || null,
    })
    .eq('id', id);

  if (error) {
    if (error.code === '23505') {
      return { error: 'A category with this slug already exists.' };
    }
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  revalidatePath('/shop', 'page');
  revalidatePath('/admin/categories');
  return { success: true };
}

export async function deleteCategory(
  id: string,
): Promise<{ success: true } | { error: string }> {
  const user = await getAuthUser();
  if (!user?.isAdmin) return { error: 'Unauthorized.' };

  const supabase = await getSupabaseServer();

  const [{ count: productCount }, { count: childCount }] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('category_id', id),
    supabase.from('categories').select('id', { count: 'exact', head: true }).eq('parent_id', id),
  ]);

  if ((productCount ?? 0) > 0) {
    return {
      error: `This category still has ${productCount} product${productCount === 1 ? '' : 's'}. Move or delete them first.`,
    };
  }
  if ((childCount ?? 0) > 0) {
    return {
      error: `This category still has ${childCount} subcategor${childCount === 1 ? 'y' : 'ies'}. Delete or move them first.`,
    };
  }

  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/', 'layout');
  revalidatePath('/shop', 'page');
  revalidatePath('/admin/categories');
  return { success: true };
}

/**
 * Moves a category one position up/down among its siblings (same parent).
 * The order is what the homepage, header menu and footer use.
 */
export async function moveCategory(
  id: string,
  direction: 'up' | 'down',
): Promise<{ success: true } | { error: string }> {
  const user = await getAuthUser();
  if (!user?.isAdmin) return { error: 'Unauthorized.' };

  const supabase = await getSupabaseServer();

  const { data: current } = await supabase
    .from('categories')
    .select('id, parent_id')
    .eq('id', id)
    .maybeSingle();
  if (!current) return { error: 'Category not found.' };

  const siblingsQuery = supabase
    .from('categories')
    .select('id')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  const { data: siblings, error: listError } = current.parent_id
    ? await siblingsQuery.eq('parent_id', current.parent_id)
    : await siblingsQuery.is('parent_id', null);
  if (listError || !siblings) return { error: listError?.message ?? 'Could not load categories.' };

  const ids = siblings.map((s) => s.id);
  const index = ids.indexOf(id);
  const target = direction === 'up' ? index - 1 : index + 1;
  if (index === -1 || target < 0 || target >= ids.length) return { success: true };

  [ids[index], ids[target]] = [ids[target], ids[index]];

  // Re-number all siblings so ties/gaps can never make the order ambiguous.
  for (let i = 0; i < ids.length; i++) {
    const { error } = await supabase
      .from('categories')
      .update({ sort_order: (i + 1) * 10 })
      .eq('id', ids[i]);
    if (error) return { error: error.message };
  }

  revalidatePath('/', 'layout');
  revalidatePath('/shop', 'page');
  revalidatePath('/admin/categories');
  return { success: true };
}

// ---------------------------------------------------------------------------
// Orders Management
// ---------------------------------------------------------------------------

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  restoreStockOnCancel: boolean = true
): Promise<{ success: true } | { error: string }> {
  const user = await getAuthUser();
  if (!user?.isAdmin) return { error: 'Unauthorized.' };

  if (!VALID_ORDER_STATUSES.includes(newStatus)) {
    return { error: 'Invalid order status.' };
  }

  const supabase = await getSupabaseServer();

  // Get current order status
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('id, status')
    .eq('id', orderId)
    .single();

  if (orderErr || !order) return { error: 'Order not found.' };

  const wasActive = order.status !== 'pending' && order.status !== 'cancelled';
  const willBeActive = newStatus !== 'pending' && newStatus !== 'cancelled';

  // If transitioning from a confirmed/active status back to 'cancelled' or 'pending', return stock
  if (wasActive && !willBeActive && restoreStockOnCancel) {
    const { data: items } = await supabase
      .from('order_items')
      .select('variant_id, quantity')
      .eq('order_id', orderId);

    if (items && items.length > 0) {
      for (const item of items) {
        if (item.variant_id && item.quantity > 0) {
          const { data: v } = await supabase
            .from('product_variants')
            .select('stock')
            .eq('id', item.variant_id)
            .single();
          if (v) {
            await supabase
              .from('product_variants')
              .update({ stock: v.stock + item.quantity })
              .eq('id', item.variant_id);
          }
        }
      }
    }
  }

  // If transitioning from 'pending' or 'cancelled' directly to an active status, validate & deduct stock
  if (!wasActive && willBeActive) {
    const { data: items } = await supabase
      .from('order_items')
      .select('variant_id, quantity, product_name, colour, size')
      .eq('order_id', orderId);

    if (items && items.length > 0) {
      // Aggregate required quantities per variantId first
      const requiredByVariant = new Map<
        string,
        { qty: number; label: string }
      >();
      for (const item of items) {
        if (item.variant_id && item.quantity > 0) {
          const prev = requiredByVariant.get(item.variant_id);
          requiredByVariant.set(item.variant_id, {
            qty: (prev?.qty ?? 0) + item.quantity,
            label: `${item.product_name} (${item.colour}, Size ${item.size})`,
          });
        }
      }

      // Verify sufficient stock for every variant before deducting
      const stockSnapshot = new Map<string, number>();
      for (const [variantId, req] of requiredByVariant.entries()) {
        const { data: v } = await supabase
          .from('product_variants')
          .select('stock')
          .eq('id', variantId)
          .single();
        if (!v) {
          return { error: `Variant no longer exists for ${req.label}.` };
        }
        if (v.stock < req.qty) {
          return {
            error: `Insufficient stock for ${req.label}: only ${v.stock} in stock, ${req.qty} needed. Use "Complete / Adjust" to modify items.`,
          };
        }
        stockSnapshot.set(variantId, v.stock);
      }

      // Deduct stock
      for (const [variantId, req] of requiredByVariant.entries()) {
        const current = stockSnapshot.get(variantId) ?? 0;
        await supabase
          .from('product_variants')
          .update({ stock: Math.max(0, current - req.qty) })
          .eq('id', variantId);
      }
    }
  }

  const { error: updateErr } = await supabase
    .from('orders')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', orderId);

  if (updateErr) return { error: updateErr.message };

  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath('/admin/products');
  revalidatePath('/admin');
  revalidatePath('/shop', 'page');
  return { success: true };
}

export async function confirmOrderSale(
  orderId: string,
  items: SaleItemInput[],
  deliveryFee: number,
  adminNotes?: string
): Promise<{ success: true; total: number; itemCount: number } | { error: string }> {
  const user = await getAuthUser();
  if (!user?.isAdmin) return { error: 'Unauthorized.' };

  if (!items || items.length === 0) {
    return { error: 'Please select at least one item that was purchased.' };
  }

  // Merge any duplicate variantId entries so stock validation and order_items are clean
  const mergedMap = new Map<string, SaleItemInput>();
  for (const rawItem of items) {
    if (!rawItem.variantId) {
      return { error: `Item "${rawItem.productName}" is missing a valid variant.` };
    }
    const existing = mergedMap.get(rawItem.variantId);
    if (existing) {
      existing.quantity += rawItem.quantity;
    } else {
      mergedMap.set(rawItem.variantId, { ...rawItem });
    }
  }
  const mergedItems = Array.from(mergedMap.values());

  const supabase = await getSupabaseServer();

  // Get current order
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('id, status, notes')
    .eq('id', orderId)
    .single();

  if (orderErr || !order) return { error: 'Order not found.' };

  // If order was already confirmed previously, restore its previously deducted stock before applying new deductions
  if (order.status !== 'pending' && order.status !== 'cancelled') {
    const { data: previousItems } = await supabase
      .from('order_items')
      .select('variant_id, quantity')
      .eq('order_id', orderId);

    if (previousItems && previousItems.length > 0) {
      for (const prev of previousItems) {
        if (prev.variant_id && prev.quantity > 0) {
          const { data: v } = await supabase
            .from('product_variants')
            .select('stock')
            .eq('id', prev.variant_id)
            .single();
          if (v) {
            await supabase
              .from('product_variants')
              .update({ stock: v.stock + prev.quantity })
              .eq('id', prev.variant_id);
          }
        }
      }
    }
  }

  // Check stock availability for all merged items
  const variantStockMap = new Map<string, number>();
  for (const item of mergedItems) {
    const { data: variant, error: vErr } = await supabase
      .from('product_variants')
      .select('stock')
      .eq('id', item.variantId)
      .single();

    if (vErr || !variant) {
      return { error: `Could not verify inventory for "${item.productName}".` };
    }

    if (variant.stock < item.quantity) {
      return {
        error: `Insufficient stock for "${item.productName}" (${item.colour}, Size ${item.size}). Only ${variant.stock} available, but ${item.quantity} selected.`,
      };
    }
    variantStockMap.set(item.variantId, variant.stock);
  }

  // Deduct stock for confirmed items
  for (const item of mergedItems) {
    const currentStock = variantStockMap.get(item.variantId);
    if (currentStock !== undefined) {
      await supabase
        .from('product_variants')
        .update({ stock: Math.max(0, currentStock - item.quantity) })
        .eq('id', item.variantId);
    }
  }

  // Replace order_items with confirmed items
  await supabase.from('order_items').delete().eq('order_id', orderId);

  const orderItemsToInsert = mergedItems.map((it) => ({
    order_id: orderId,
    product_id: it.productId,
    variant_id: it.variantId,
    product_name: it.productName,
    colour: it.colour,
    size: String(it.size),
    size_system: it.sizeSystem || 'EU',
    size_value: it.sizeValue || String(it.size),
    quantity: it.quantity,
    unit_price: Math.round(it.unitPrice),
  }));

  const { error: insertItemsErr } = await supabase
    .from('order_items')
    .insert(orderItemsToInsert);

  if (insertItemsErr) {
    return { error: 'Failed to update order items: ' + insertItemsErr.message };
  }

  const subtotal = mergedItems.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
  const total = subtotal + Math.max(0, deliveryFee);
  const mergedNotes = adminNotes !== undefined ? adminNotes : order.notes;

  const { error: updateOrderErr } = await supabase
    .from('orders')
    .update({
      subtotal,
      delivery_fee: Math.max(0, deliveryFee),
      total,
      status: 'confirmed',
      notes: mergedNotes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  if (updateOrderErr) {
    return { error: 'Failed to update order: ' + updateOrderErr.message };
  }

  // Invalidate caches
  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath('/admin/products');
  revalidatePath('/admin');
  revalidatePath('/shop', 'page');
  revalidatePath('/', 'page');

  try {
    const productIds = Array.from(new Set(mergedItems.map((i) => i.productId)));
    const { data: prods } = await supabase
      .from('products')
      .select('slug')
      .in('id', productIds);
    if (prods) {
      for (const p of prods) {
        if (p.slug) revalidatePath(`/product/${p.slug}`, 'page');
      }
    }
  } catch (e) {
    console.warn('Could not revalidate product slugs:', e);
  }

  const totalQuantity = mergedItems.reduce((sum, it) => sum + it.quantity, 0);
  return { success: true, total, itemCount: totalQuantity };
}

export async function cancelOrderInquiry(
  orderId: string
): Promise<{ success: true } | { error: string }> {
  const user = await getAuthUser();
  if (!user?.isAdmin) return { error: 'Unauthorized.' };

  const supabase = await getSupabaseServer();

  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('id, status')
    .eq('id', orderId)
    .single();

  if (orderErr || !order) return { error: 'Order not found.' };

  // If the order was confirmed/active (not pending), return stock to product_variants
  if (order.status !== 'pending' && order.status !== 'cancelled') {
    const { data: items } = await supabase
      .from('order_items')
      .select('variant_id, quantity')
      .eq('order_id', orderId);

    if (items && items.length > 0) {
      for (const item of items) {
        if (item.variant_id && item.quantity > 0) {
          const { data: v } = await supabase
            .from('product_variants')
            .select('stock')
            .eq('id', item.variant_id)
            .single();
          if (v) {
            await supabase
              .from('product_variants')
              .update({ stock: v.stock + item.quantity })
              .eq('id', item.variant_id);
          }
        }
      }
    }
  }

  const { error: updateErr } = await supabase
    .from('orders')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', orderId);

  if (updateErr) return { error: updateErr.message };

  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath('/admin/products');
  revalidatePath('/admin');
  revalidatePath('/shop', 'page');
  return { success: true };
}

export async function getCatalogProductsWithVariants(): Promise<
  { products: CatalogProductOption[] } | { error: string }
> {
  const user = await getAuthUser();
  if (!user?.isAdmin) return { error: 'Unauthorized.' };

  const supabase = await getSupabaseServer();
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      slug,
      price,
      is_active,
      product_variants (
        id,
        colour,
        size,
        size_system,
        size_value,
        stock
      )
    `)
    .eq('is_active', true)
    .order('name');

  if (error) return { error: error.message };

  const normalized = (products ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    is_active: p.is_active,
    product_variants: (p.product_variants ?? []).map((v) => ({
      id: v.id,
      colour: v.colour,
      size: v.size,
      size_system: v.size_system || 'EU',
      size_value: v.size_value || String(v.size ?? ''),
      stock: v.stock,
    })),
  }));

  return { products: normalized as CatalogProductOption[] };
}

export async function getOrderItemsWithStock(
  orderId: string
): Promise<{ items: OrderItemWithStock[] } | { error: string }> {
  const user = await getAuthUser();
  if (!user?.isAdmin) return { error: 'Unauthorized.' };

  const supabase = await getSupabaseServer();
  const [{ data: order }, { data: items, error }] = await Promise.all([
    supabase.from('orders').select('status').eq('id', orderId).single(),
    supabase
      .from('order_items')
      .select(`
        id,
        order_id,
        product_id,
        variant_id,
        product_name,
        colour,
        size,
        size_system,
        size_value,
        quantity,
        unit_price
      `)
      .eq('order_id', orderId),
  ]);

  if (error) return { error: error.message };

  // If the order is already confirmed/active, its item quantities have already been deducted from product_variants.
  // Add them back to current_stock so the Adjust modal shows the true available quantity for this order.
  const isAlreadyDeducted =
    order?.status && order.status !== 'pending' && order.status !== 'cancelled';

  const variantIds = Array.from(
    new Set(items?.map((it) => it.variant_id).filter(Boolean) as string[])
  );

  const stockMap = new Map<string, number>();
  if (variantIds.length > 0) {
    const { data: variants } = await supabase
      .from('product_variants')
      .select('id, stock')
      .in('id', variantIds);

    for (const v of variants ?? []) {
      stockMap.set(v.id, v.stock);
    }
  }

  const itemsWithStock: OrderItemWithStock[] = (items ?? []).map((it) => {
    const shelfStock = it.variant_id ? stockMap.get(it.variant_id) ?? 0 : 0;
    return {
      ...it,
      current_stock: isAlreadyDeducted ? shelfStock + it.quantity : shelfStock,
    };
  });

  return { items: itemsWithStock };
}

export async function deleteOrder(
  orderId: string
): Promise<{ success: true } | { error: string }> {
  const user = await getAuthUser();
  if (!user?.isAdmin) return { error: 'Unauthorized.' };

  const supabase = await getSupabaseServer();

  // Check if order had deducted stock before deleting
  const { data: order } = await supabase
    .from('orders')
    .select('status')
    .eq('id', orderId)
    .single();

  if (order && order.status !== 'pending' && order.status !== 'cancelled') {
    const { data: items } = await supabase
      .from('order_items')
      .select('variant_id, quantity')
      .eq('order_id', orderId);

    if (items && items.length > 0) {
      for (const item of items) {
        if (item.variant_id && item.quantity > 0) {
          const { data: v } = await supabase
            .from('product_variants')
            .select('stock')
            .eq('id', item.variant_id)
            .single();
          if (v) {
            await supabase
              .from('product_variants')
              .update({ stock: v.stock + item.quantity })
              .eq('id', item.variant_id);
          }
        }
      }
    }
  }

  const { error } = await supabase.from('orders').delete().eq('id', orderId);
  if (error) return { error: error.message };

  revalidatePath('/admin/orders');
  revalidatePath('/admin/products');
  revalidatePath('/admin');
  revalidatePath('/shop', 'page');
  return { success: true };
}

export async function createManualOrder(input: {
  customerName: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
  deliveryFee: number;
  status: 'confirmed' | 'pending';
  items: SaleItemInput[];
}): Promise<{ success: true; orderId: string; orderNumber: string } | { error: string }> {
  const user = await getAuthUser();
  if (!user?.isAdmin) return { error: 'Unauthorized.' };

  const customerName = input.customerName.trim();
  const phone = input.phone.trim();
  const address = input.address.trim() || 'Direct / Walk-in';
  const city = input.city.trim() || 'Colombo';

  if (!customerName) return { error: 'Customer name is required.' };
  if (!phone) return { error: 'Phone number is required.' };
  if (!input.items || input.items.length === 0) {
    return { error: 'Please add at least one item to the order.' };
  }

  // Merge duplicate variants
  const mergedMap = new Map<string, SaleItemInput>();
  for (const rawItem of input.items) {
    if (!rawItem.variantId) {
      return { error: `Item "${rawItem.productName}" is missing a valid variant.` };
    }
    const existing = mergedMap.get(rawItem.variantId);
    if (existing) {
      existing.quantity += rawItem.quantity;
    } else {
      mergedMap.set(rawItem.variantId, { ...rawItem });
    }
  }
  const mergedItems = Array.from(mergedMap.values());

  const supabase = await getSupabaseServer();

  // If creating as confirmed, verify and deduct stock
  if (input.status === 'confirmed') {
    const stockMap = new Map<string, number>();
    for (const item of mergedItems) {
      const { data: v, error: vErr } = await supabase
        .from('product_variants')
        .select('stock')
        .eq('id', item.variantId)
        .single();
      if (vErr || !v) {
        return { error: `Could not verify stock for "${item.productName}".` };
      }
      if (v.stock < item.quantity) {
        return {
          error: `Insufficient stock for "${item.productName}" (${item.colour}, Size ${item.size}). Only ${v.stock} available.`,
        };
      }
      stockMap.set(item.variantId, v.stock);
    }

    for (const item of mergedItems) {
      const current = stockMap.get(item.variantId) ?? 0;
      await supabase
        .from('product_variants')
        .update({ stock: Math.max(0, current - item.quantity) })
        .eq('id', item.variantId);
    }
  }

  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const rand = String(Math.floor(10000 + Math.random() * 90000));
  const orderNumber = `PROE-${yy}${mm}${dd}-${rand}`;

  const subtotal = mergedItems.reduce((sum, it) => sum + it.quantity * Math.round(it.unitPrice), 0);
  const deliveryFee = Math.max(0, Math.round(input.deliveryFee || 0));
  const total = subtotal + deliveryFee;

  const { data: newOrder, error: orderErr } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      customer_name: customerName,
      phone,
      address,
      city,
      delivery_fee: deliveryFee,
      subtotal,
      total,
      status: input.status,
      notes: input.notes?.trim() || null,
    })
    .select('id, order_number')
    .single();

  if (orderErr || !newOrder) {
    return { error: orderErr?.message || 'Failed to create order.' };
  }

  const orderItemsPayload = mergedItems.map((it) => ({
    order_id: newOrder.id,
    product_id: it.productId,
    variant_id: it.variantId,
    product_name: it.productName,
    colour: it.colour,
    size: String(it.size),
    size_system: it.sizeSystem || 'EU',
    size_value: it.sizeValue || String(it.size),
    quantity: it.quantity,
    unit_price: Math.round(it.unitPrice),
  }));

  const { error: itemsErr } = await supabase.from('order_items').insert(orderItemsPayload);
  if (itemsErr) {
    return { error: 'Order created, but failed to save items: ' + itemsErr.message };
  }

  revalidatePath('/admin/orders');
  revalidatePath('/admin/products');
  revalidatePath('/admin');
  revalidatePath('/shop', 'page');
  revalidatePath('/', 'page');

  return { success: true, orderId: newOrder.id, orderNumber: newOrder.order_number };
}


