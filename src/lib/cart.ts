import type { CartItem } from '@/context/cart-context';

export function mergeCartItem(items: CartItem[], item: CartItem): CartItem[] {
  const existing = items.find(entry => entry.id === item.id);
  const quantity = Math.min((existing?.quantity ?? 0) + item.quantity, item.maxStock ?? 99);
  if (quantity <= 0) return items.filter(entry => entry.id !== item.id);
  const updated = { ...item, quantity };
  return existing ? items.map(entry => entry.id === item.id ? updated : entry) : [...items, updated];
}

export const CHECKOUT_REQUEST_KEY = 'proedge_checkout_request_v1';
export function cartFingerprint(items: CartItem[]): string {
  return JSON.stringify(items.map(({ productId, variantId, sizeSystem, size, color, quantity, price }) =>
    ({ productId, variantId, sizeSystem, size, color, quantity, price })));
}

export function checkoutRequest(storage: Pick<Storage, 'getItem' | 'setItem'>, fingerprint: string) {
  try {
    const saved = JSON.parse(storage.getItem(CHECKOUT_REQUEST_KEY) ?? 'null');
    if (saved?.fingerprint === fingerprint && /^[0-9a-f-]{36}$/i.test(saved.id)) return saved as { id: string; fingerprint: string };
  } catch { /* Replace corrupt session data. */ }
  const request = { fingerprint, id: crypto.randomUUID() };
  storage.setItem(CHECKOUT_REQUEST_KEY, JSON.stringify(request));
  return request;
}
