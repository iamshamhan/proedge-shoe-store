'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getSupabaseServer } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/auth/admin';
import { VALID_ORDER_STATUSES, type OrderStatus } from '@/types/order';


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
  const user = await getAuthUser();
  if (!user?.isAdmin) return { error: "Unauthorized." };

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

  // If transitioning to 'cancelled' and was not cancelled before, optionally return stock
  if (newStatus === 'cancelled' && order.status !== 'cancelled' && restoreStockOnCancel) {
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

  // If moving out of 'cancelled' back to an active status, re-reserve stock
  if (order.status === 'cancelled' && newStatus !== 'cancelled') {
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
              .update({ stock: Math.max(0, v.stock - item.quantity) })
              .eq('id', item.variant_id);
          }
        }
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
  revalidatePath('/admin');
  return { success: true };
}

export async function deleteOrder(
  orderId: string
): Promise<{ success: true } | { error: string }> {
  const user = await getAuthUser();
  if (!user?.isAdmin) return { error: 'Unauthorized.' };

  const supabase = await getSupabaseServer();

  const { error } = await supabase.from('orders').delete().eq('id', orderId);
  if (error) return { error: error.message };

  revalidatePath('/admin/orders');
  revalidatePath('/admin');
  return { success: true };
}

