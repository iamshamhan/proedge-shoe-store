'use server';

import { getSupabaseServer } from '@/lib/supabase/server';
import type { ValidatedOrder } from '@/types/order';

export type CheckoutItemInput = {
  productId: string;
  variantId?: string | null;
  size?: number;
  color?: string;
  quantity: number;
};

export type CheckoutCustomerInput = {
  fullName: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address: string;
  city: string;
  postalCode?: string;
  notes?: string;
};

const PHONE_RE = /^0[0-9]{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_QTY = 99;
const MAX_ITEMS = 30;

function mapOrderError(message: string): string {
  if (message.includes('ERR_INSUFFICIENT_STOCK')) {
    return 'Sorry, one or more items no longer have enough stock. Please adjust your order and try again.';
  }
  if (message.includes('ERR_VARIANT_UNAVAILABLE')) {
    return 'One of the selected colour/size combinations is no longer available.';
  }
  if (message.includes('ERR_PRODUCT_UNAVAILABLE')) {
    return 'One of the products is no longer available for purchase.';
  }
  if (message.includes('ERR_INVALID_QTY')) {
    return 'Your order contains an invalid quantity.';
  }
  if (message.includes('ERR_CUSTOMER_INVALID')) {
    return 'Please complete all required delivery fields.';
  }
  return 'We could not place your order right now. Please try again.';
}

export async function placeOrder(
  customer: CheckoutCustomerInput,
  items: CheckoutItemInput[],
): Promise<{ success: true; order: ValidatedOrder } | { success: false; error: string }> {
  // ---- Server-side validation (the client is never trusted) ----
  const fullName = (customer?.fullName ?? '').trim();
  const phone = (customer?.phone ?? '').trim();
  const whatsapp = (customer?.whatsapp ?? '').trim() || undefined;
  const email = (customer?.email ?? '').trim() || undefined;
  const address = (customer?.address ?? '').trim();
  const city = (customer?.city ?? '').trim();
  const postalCode = (customer?.postalCode ?? '').trim() || undefined;
  const notes = (customer?.notes ?? '').trim() || undefined;

  if (!fullName) return { success: false, error: 'Full name is required.' };
  if (!PHONE_RE.test(phone)) {
    return { success: false, error: 'Enter a valid Sri Lankan phone number (e.g. 0771234567).' };
  }
  if (whatsapp && !PHONE_RE.test(whatsapp)) {
    return { success: false, error: 'Enter a valid Sri Lankan WhatsApp number.' };
  }
  if (email && !EMAIL_RE.test(email)) {
    return { success: false, error: 'Enter a valid email address.' };
  }
  if (!address) return { success: false, error: 'Delivery address is required.' };
  if (!city) return { success: false, error: 'City is required.' };

  if (!Array.isArray(items) || items.length === 0 || items.length > MAX_ITEMS) {
    return { success: false, error: 'Your cart is empty or contains too many items.' };
  }

  const cleanItems: { productId: string; variantId: string | null; size: number; color: string; quantity: number }[] =
    items.map((it) => {
      const qty = Math.trunc(Number(it.quantity));
      return {
        productId: String(it.productId ?? ''),
        variantId: it.variantId ? String(it.variantId) : null,
        size: Number(it.size),
        color: String(it.color ?? ''),
        quantity: Number.isFinite(qty) && qty >= 1 && qty <= MAX_QTY ? qty : 0,
      };
    });

  if (cleanItems.some((it) => !it.productId || it.quantity <= 0)) {
    return { success: false, error: 'Your cart contains an invalid item.' };
  }

  // The database does all pricing/stock/availability work. Prices, product
  // names, subtotals and totals are intentionally NOT sent from the client —
  // any such fields in a crafted request are ignored.
  const rpcItems = cleanItems.map((it) =>
    it.variantId
      ? { productId: it.productId, variantId: it.variantId, quantity: it.quantity }
      : {
          productId: it.productId,
          size: it.size,
          color: it.color,
          quantity: it.quantity,
        },
  );

  const rpcCustomer = {
    fullName,
    phone,
    whatsapp: whatsapp ?? null,
    email: email ?? null,
    address,
    city,
    postalCode: postalCode ?? null,
    notes: notes ?? null,
  };

  let supabase;
  try {
    supabase = await getSupabaseServer();
  } catch {
    return { success: false, error: 'We could not connect to place your order. Please try again.' };
  }

  const { data, error } = await supabase.rpc('place_order', {
    p_customer: rpcCustomer,
    p_items: rpcItems,
  });

  if (error) {
    return { success: false, error: mapOrderError(error.message) };
  }
  if (!data || typeof data !== 'object') {
    return { success: false, error: 'We received an unexpected response from the server.' };
  }

  return { success: true, order: data as unknown as ValidatedOrder };
}