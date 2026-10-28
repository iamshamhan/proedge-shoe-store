'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getSupabaseServer } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/auth/admin';
import { readAllRows } from '@/lib/supabase/read-all';
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

  const { data: prod } = await supabase.from('products').select('slug').eq('id', id).single();

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

  // Image objects can be shared by duplicate products. Retain them for offline orphan cleanup.

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

  const { data, error } = await supabase.rpc('admin_duplicate_product', { p_source_id: sourceId });
  if (error) return { error: error.message };
  if (!data?.id || !data?.slug) return { error: 'Failed to duplicate product.' };
  await revalidateProductPaths(data.slug, data.id);
  return { id: data.id, slug: data.slug };
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

  if (!Array.isArray(orderedImageIds) || new Set(orderedImageIds).size !== orderedImageIds.length) {
    return { error: 'Invalid image order.' };
  }
  const { error } = await supabase.rpc('admin_reorder_product_images', {
    p_product_id: productId, p_image_ids: orderedImageIds,
  });
  if (error) return { error: error.code === 'PGRST202'
    ? 'Image reordering requires the pending database migration.' : error.message };

  const { data: prod } = await supabase.from('products').select('slug').eq('id', productId).single();
  await revalidateProductPaths(prod?.slug, productId);

  return { success: true };
}

export async function removeProductImage(
  imageId: string,
): Promise<{ success: true } | { error: string }> {
  const user = await getAuthUser();
  if (!user?.isAdmin) return { error: "Unauthorized." };

  const supabase = await getSupabaseServer();

  const { data: img } = await supabase
    .from('product_images')
    .select('product_id')
    .eq('id', imageId)
    .single();

  // Remove this reference only; another product may use the same storage object.
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
  if (!Number.isSafeInteger(stock) || stock < 0) return { error: 'Stock must be a non-negative integer.' };

  const parsedInt = parseInt(sizeValueStr, 10);
  const numericSize = !isNaN(parsedInt) ? parsedInt : 0;

  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
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
  if (!Number.isSafeInteger(stock) || stock < 0) return { error: 'Stock must be a non-negative integer.' };

  const supabase = await getSupabaseServer();

  // Check existing variants for this product to skip duplicates gracefully
  const { data: existing, error: existingError } = await supabase
    .from('product_variants')
    .select('colour, size, size_system, size_value')
    .eq('product_id', productId);

  if (existingError) return { error: existingError.message };

  const existingKeys = new Set(
    (existing ?? []).map(
      (v) => `${v.colour.toLowerCase()}::${v.size_system}::${String(v.size_value || v.size).toLowerCase()}`,
    ),
  );

  const toInsert = uniqueSizes.filter(
    (sz) => !existingKeys.has(`${cleanColour.toLowerCase()}::${sizeSystem}::${sz.toLowerCase()}`),
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
  expectedStock: number,
): Promise<{ success: true } | { error: string }> {
  const user = await getAuthUser();
  if (!user?.isAdmin) return { error: "Unauthorized." };

  if (!Number.isSafeInteger(stock) || stock < 0) return { error: 'Stock must be a non-negative integer.' };
  if (!Number.isSafeInteger(expectedStock) || expectedStock < 0) return { error: 'Refresh the product before editing stock.' };
  const supabase = await getSupabaseServer();

  const { data: v } = await supabase
    .from('product_variants')
    .select('product_id')
    .eq('id', variantId)
    .single();

  const { data: changed, error } = await supabase.from('product_variants').update({ stock })
    .eq('id', variantId).eq('stock', expectedStock).select('id').maybeSingle();
  if (error) return { error: error.message };
  if (!changed) return { error: 'Stock changed since you opened this product. Refresh and try again.' };

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
  logo_horizontal_url?: string;
  logo_stacked_url?: string;
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

  if (!Number.isFinite(input.free_delivery_threshold) || input.free_delivery_threshold < 0) {
    return { error: 'Free delivery threshold must be a positive number.' };
  }

  if (!Number.isFinite(input.default_delivery_fee) || input.default_delivery_fee < 0) {
    return { error: 'Default delivery fee must be a positive number.' };
  }

  if (
    input.sale_discount_percent !== undefined &&
    (!Number.isFinite(input.sale_discount_percent) ||
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
    upsertPayload.hero_product_slug = input.hero_product_slug.trim();
  }

  if (input.sale_enabled !== undefined) {
    upsertPayload.sale_enabled = Boolean(input.sale_enabled);
  }

  if (input.sale_discount_percent !== undefined) {
    upsertPayload.sale_discount_percent = Math.round(input.sale_discount_percent);
  }

  for (const field of ['logo_horizontal_url', 'logo_stacked_url'] as const) {
    const value = input[field];
    if (value === undefined) continue;
    if (typeof value !== 'string' || value.length > 2048) return { error: 'Invalid logo URL.' };
    const logo = value.trim();
    const local = ['/images/branding/logo-horizontal.jpeg', '/images/branding/logo-stacked.jpeg'];
    if (logo && !local.includes(logo)) {
      try {
        const parsed = new URL(logo);
        const project = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || '');
        if (parsed.origin !== project.origin || !parsed.pathname.startsWith('/storage/v1/object/public/product-images/branding/')) {
          return { error: 'Please upload a logo using the logo picker.' };
        }
      } catch { return { error: 'Invalid logo URL.' }; }
    }
    upsertPayload[field] = logo || null;
  }

  if (input.brand_name !== undefined) {
    upsertPayload.brand_name = input.brand_name.trim() || 'PROEDGE';
  }

  if (input.contact_address !== undefined) {
    upsertPayload.contact_address = input.contact_address.trim() || null;
  }

  if (input.contact_phone !== undefined) {
    upsertPayload.contact_phone = input.contact_phone.trim();
  }

    if (input.contact_email !== undefined) {
    upsertPayload.contact_email = input.contact_email.trim();
  }
  if (input.whatsapp_number !== undefined) {
    upsertPayload.whatsapp_number = input.whatsapp_number.trim();
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


  const { error } = await supabase.from('store_settings').upsert(upsertPayload);

  if (error) {
    if (['42P01', '42703', 'PGRST204'].includes(error.code)) {
      return {
        error:
          'Store settings schema is out of date. Apply the outstanding database migrations before saving.',
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
  
  const { data: maxSort, error: sortError } = await query;
  if (sortError) return { error: sortError.message };
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

    const { data: parent, error: parentError } = await supabase
      .from('categories')
      .select('id, parent_id')
      .eq('id', data.parent_id)
      .maybeSingle();
    if (parentError) return { error: parentError.message };
    if (!parent) return { error: 'The selected parent category no longer exists.' };
    if (parent.parent_id) {
      return { error: 'Subcategories can only be placed under a main category.' };
    }

    const { count: childCount, error: childError } = await supabase
      .from('categories')
      .select('id', { count: 'exact', head: true })
      .eq('parent_id', id);
    if (childError) return { error: childError.message };
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

  const [{ count: productCount, error: productError }, { count: childCount, error: childError }] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('category_id', id),
    supabase.from('categories').select('id', { count: 'exact', head: true }).eq('parent_id', id),
  ]);

  if (productError || childError) return { error: (productError || childError)!.message };
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

  let siblings: { id: string }[];
  try {
    siblings = await readAllRows((from, to) => {
      const query = supabase.from('categories').select('id').order('sort_order').order('created_at').order('id').range(from, to);
      return current.parent_id ? query.eq('parent_id', current.parent_id) : query.is('parent_id', null);
    });
  } catch { return { error: 'Could not load categories.' }; }

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

function orderMutationError(message: string): string {
  if (message.includes('ERR_ORDER_CHANGED')) return 'Another administrator changed this order. Refresh the page and reopen it before trying again.';
  if (message.includes('ERR_INSUFFICIENT_STOCK')) return 'Insufficient stock. Reload the order and adjust its quantities.';
  if (message.includes('ERR_ORDER_FULFILLED')) return 'Shipped or delivered orders cannot be edited or restocked here. Record any physical return separately.';
  if (message.includes('ERR_CANCEL_BEFORE_DELETE')) return 'Cancel this unfulfilled order before deleting it to release its reserved stock.';
  if (message.includes('ERR_ORDER_NOT_FOUND')) return 'Order no longer exists. Refresh the order list.';
  if (message.includes('ERR_VARIANT_UNAVAILABLE')) return 'A selected variant no longer exists.';
  if (message.includes('ERR_')) return 'Check the order details, quantities and prices, then try again.';
  return 'The order could not be saved. No changes were applied. Please try again.';
}

function revalidateOrderViews(orderId?: string) {
  revalidatePath('/', 'layout');
  if (orderId) revalidatePath(`/admin/orders/${orderId}`);
}

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus, revision: number): Promise<{ success: true } | { error: string }> {
  const user = await getAuthUser();
  if (!user?.isAdmin) return { error: 'Unauthorized.' };
  if (!VALID_ORDER_STATUSES.includes(newStatus)) return { error: 'Invalid order status.' };
  const supabase = await getSupabaseServer();
  const { error } = await supabase.rpc('admin_change_order_status_checked', { p_order_id: orderId, p_status: newStatus, p_revision: revision });
  if (error) return { error: orderMutationError(error.message) };
  revalidateOrderViews(orderId);
  return { success: true };
}

export async function confirmOrderSale(orderId: string, items: SaleItemInput[], deliveryFee: number, adminNotes: string | undefined, revision: number): Promise<{ success: true; total: number; itemCount: number } | { error: string }> {
  const user = await getAuthUser();
  if (!user?.isAdmin) return { error: 'Unauthorized.' };
  if (!Array.isArray(items) || !items.length || !Number.isInteger(deliveryFee) || deliveryFee < 0) return { error: 'Check the items and delivery fee.' };
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase.rpc('admin_save_order_checked', {
    p_order_id: orderId, p_items: items, p_delivery_fee: deliveryFee,
    p_notes: adminNotes ?? null, p_revision: revision,
  });
  if (error) return { error: orderMutationError(error.message) };
  revalidateOrderViews(orderId);
  return { success: true, total: data.total, itemCount: data.item_count };
}

export async function cancelOrderInquiry(orderId: string, revision: number): Promise<{ success: true } | { error: string }> {
  return updateOrderStatus(orderId, 'cancelled', revision);
}

export async function getCatalogProductsWithVariants(): Promise<
  { products: CatalogProductOption[] } | { error: string }
> {
  const user = await getAuthUser();
  if (!user?.isAdmin) return { error: 'Unauthorized.' };

  const supabase = await getSupabaseServer();
  try {
    const products = await readAllRows((from, to) => supabase
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
      .order('name').order('id').range(from, to));

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
  } catch {
    return { error: 'The catalog could not be loaded. Please try again.' };
  }
}

export async function getOrderItemsWithStock(
  orderId: string
): Promise<{ items: OrderItemWithStock[]; revision: number; deliveryFee: number; notes: string | null } | { error: string }> {
  const user = await getAuthUser();
  if (!user?.isAdmin) return { error: 'Unauthorized.' };
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase.rpc('admin_get_order_snapshot', { p_order_id: orderId });
  if (error) return { error: orderMutationError(error.message) };
  if (!data || !Array.isArray(data.items) || !Number.isInteger(data.revision)) {
    return { error: 'The order could not be loaded. Refresh the page and try again.' };
  }
  return { items: data.items, revision: data.revision, deliveryFee: data.deliveryFee, notes: data.notes };
}

export async function deleteOrder(orderId: string, revision: number): Promise<{ success: true } | { error: string }> {
  const user = await getAuthUser();
  if (!user?.isAdmin) return { error: 'Unauthorized.' };
  const supabase = await getSupabaseServer();
  const { error } = await supabase.rpc('admin_delete_order_checked', { p_order_id: orderId, p_revision: revision });
  if (error) return { error: orderMutationError(error.message) };
  revalidateOrderViews();
  return { success: true };
}

export async function createManualOrder(input: {
  customerName: string; phone: string; address: string; city: string; notes?: string;
  deliveryFee: number; status: 'confirmed' | 'pending'; items: SaleItemInput[];
}): Promise<{ success: true; orderId: string; orderNumber: string } | { error: string }> {
  const user = await getAuthUser();
  if (!user?.isAdmin) return { error: 'Unauthorized.' };
  if (!input || typeof input.customerName !== 'string' || typeof input.phone !== 'string'
    || !input.customerName.trim() || !input.phone.trim() || !Array.isArray(input.items)
    || !input.items.length || !Number.isInteger(input.deliveryFee) || input.deliveryFee < 0) {
    return { error: 'Check the customer details, items and delivery fee.' };
  }
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase.rpc('admin_save_order', {
    p_order_id: null, p_items: input.items, p_delivery_fee: input.deliveryFee,
    p_notes: input.notes ?? null, p_status: input.status,
    p_customer: { name: input.customerName.trim(), phone: input.phone.trim(),
      address: typeof input.address === 'string' && input.address.trim() ? input.address.trim() : 'Direct / Walk-in',
      city: typeof input.city === 'string' && input.city.trim() ? input.city.trim() : 'Colombo' },
  });
  if (error) return { error: orderMutationError(error.message) };
  revalidateOrderViews();
  return { success: true, orderId: data.order_id, orderNumber: data.order_number };
}

