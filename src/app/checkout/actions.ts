'use server';

import { saveVerifiedInquiry } from '@/lib/checkout-security';
import type { ValidatedOrder } from '@/types/order';

export type CheckoutItemInput = {
  productId: string;
  variantId?: string | null;
  size?: number | string;
  sizeSystem?: string;
  sizeValue?: string;
  color?: string;
  quantity: number;
};

export type CheckoutCustomerInput = {
  requestId?: string;
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
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SIZE_SYSTEMS = ['EU', 'UK', 'US', 'Custom'];

function mapOrderError(message: string): string {
  if (message.includes('ERR_BOT_VERIFICATION')) return 'Please complete the security check again and retry.';
  if (message.includes('ERR_RATE_LIMIT')) return 'Too many order inquiries. Please wait an hour or contact us on WhatsApp.';
  if (message.includes('ERR_REQUEST_CHANGED')) return 'This request changed. Refresh checkout before trying again.';
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
  turnstileToken?: string,
): Promise<{ success: true; order: ValidatedOrder } | { success: false; error: string }> {
  // ---- Server-side validation (the client is never trusted) ----
  if (!customer || typeof customer !== 'object') return { success: false, error: 'Invalid customer details.' };
  const limits = { fullName: 200, phone: 20, whatsapp: 20, email: 254, address: 1000, city: 100, postalCode: 20, notes: 4000 };
  for (const [key, limit] of Object.entries(limits)) {
    const value = customer[key as keyof CheckoutCustomerInput];
    if (value !== undefined && (typeof value !== 'string' || value.length > limit)) {
      return { success: false, error: 'Please check the delivery details and field lengths.' };
    }
  }
  if (customer.requestId !== undefined && (typeof customer.requestId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(customer.requestId))) {
    return { success: false, error: 'Invalid checkout request. Please refresh the page.' };
  }
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
  if (items.some(it => !it || typeof it !== 'object' || !Number.isInteger(it.quantity))) {
    return { success: false, error: 'Your cart contains an invalid quantity.' };
  }

  for (const it of items) {
    if (!it || typeof it !== 'object' || Array.isArray(it) || typeof it.productId !== 'string' || !UUID_RE.test(it.productId)
      || (it.variantId != null && (typeof it.variantId !== 'string' || !UUID_RE.test(it.variantId)))
      || it.quantity < 1 || it.quantity > MAX_QTY) {
      return { success: false, error: 'Your cart contains an invalid item.' };
    }
    if (it.size !== undefined && !(
      (typeof it.size === 'string' && it.size.length <= 100)
      || (typeof it.size === 'number' && Number.isFinite(it.size) && it.size > 0)
    )) {
      return { success: false, error: 'Your cart contains an invalid size.' };
    }
    if ((it.sizeSystem !== undefined && !SIZE_SYSTEMS.includes(it.sizeSystem))
      || (it.sizeValue !== undefined && (typeof it.sizeValue !== 'string' || it.sizeValue.length > 100))
      || (it.color !== undefined && (typeof it.color !== 'string' || it.color.length > 200))) {
      return { success: false, error: 'Your cart contains invalid size or colour details.' };
    }
    if (!it.variantId && (!(it.sizeValue?.trim() || String(it.size ?? '').trim()) || !it.color?.trim())) {
      return { success: false, error: 'Please select a size and colour for each item.' };
    }
  }

  const cleanItems = items.map((it) => ({
    productId: it.productId,
    variantId: it.variantId ?? null,
    size: String(it.size ?? '').trim(),
    sizeSystem: it.sizeSystem ?? 'EU',
    sizeValue: it.sizeValue?.trim() || String(it.size ?? '').trim(),
    color: it.color?.trim() ?? '',
    quantity: it.quantity,
  }));

  // The database does all pricing/stock/availability work. Prices, product
  // names, subtotals and totals are intentionally NOT sent from the client —
  // any such fields in a crafted request are ignored.
  const rpcItems = cleanItems.map((it) =>
    it.variantId
      ? { productId: it.productId, variantId: it.variantId, quantity: it.quantity }
      : {
          productId: it.productId,
          size: it.size,
          sizeSystem: it.sizeSystem,
          sizeValue: it.sizeValue,
          color: it.color,
          quantity: it.quantity,
        },
  );

  const rpcCustomer = {
    requestId: customer.requestId ?? null,
    fullName,
    phone,
    whatsapp: whatsapp ?? null,
    email: email ?? null,
    address,
    city,
    postalCode: postalCode ?? null,
    notes: notes ?? null,
  };

  const { data, error } = await saveVerifiedInquiry(rpcCustomer, rpcItems, turnstileToken);

  if (error) {
    return { success: false, error: mapOrderError(error.message) };
  }
  if (!data || typeof data !== 'object') {
    return { success: false, error: 'We received an unexpected response from the server.' };
  }

  // Inquiries do not change inventory. Return the saved receipt directly;
  // a later catalog/cache failure must not turn a successful save into a failure.
  return { success: true, order: data as unknown as ValidatedOrder };
}
