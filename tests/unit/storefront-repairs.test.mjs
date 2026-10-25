import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadTs } from './load-ts.mjs';
const { mergeCartItem, cartFingerprint, checkoutRequest, CHECKOUT_REQUEST_KEY } = loadTs('src/lib/cart.ts');
const item = { id: 'p-UK-8.5-Black', productId: 'p', variantId: 'old', size: '8.5', sizeSystem: 'UK', color: 'Black', price: 100, name: 'Shoe', quantity: 1 };

test('adding an existing cart item refreshes price, variant and stock without losing quantity', () => {
  const [updated] = mergeCartItem([item], { ...item, variantId: 'new', price: 200, maxStock: 3, quantity: 3 });
  assert.equal(updated.price, 200);
  assert.equal(updated.variantId, 'new');
  assert.equal(updated.quantity, 3);
  assert.deepEqual(mergeCartItem([item], { ...item, maxStock: 0 }), []);
});

test('checkout request survives reload and changes only when cart changes or request is cleared', () => {
  const data = new Map();
  const storage = { getItem: key => data.get(key), setItem: (key, value) => data.set(key, value) };
  const fingerprint = cartFingerprint([item]);
  const first = checkoutRequest(storage, fingerprint);
  const reloaded = loadTs('src/lib/cart.ts').checkoutRequest(storage, fingerprint);
  assert.equal(first.id, reloaded.id);
  assert.notEqual(checkoutRequest(storage, cartFingerprint([{ ...item, quantity: 2 }])).id, first.id);
  data.delete(CHECKOUT_REQUEST_KEY);
  assert.notEqual(checkoutRequest(storage, fingerprint).id, first.id);
  data.set(CHECKOUT_REQUEST_KEY, 'invalid');
  assert.ok(checkoutRequest(storage, fingerprint).id);
});

function cartCheck(result) {
  const query = { select() { return this; }, eq() { return this; }, in: async () => result };
  return loadTs('src/app/checkout/cart-actions.ts', { '@/lib/supabase/server': { getSupabaseServer: async () => ({ from: () => query }) } }).checkCart;
}
const variant = { id: 'old', colour: 'Black', size: 8, size_value: '8.5', size_system: 'UK', stock: 5 };
test('checkout flags deleted, mismatched and insufficient-stock variants before saving', async () => {
  for (const variants of [[], [{ ...variant, id: 'replacement' }], [{ ...variant, size_system: 'US' }], [{ ...variant, stock: 0 }]]) {
    assert.match((await cartCheck({ data: [{ id: 'p', price: 200, product_variants: variants }] })([item])).error, /unavailable/);
  }
  assert.match((await cartCheck({ error: { message: 'offline' } })([item])).error, /Could not check/);
  const result = await cartCheck({ data: [{ id: 'p', price: 200, product_variants: [variant] }] })([item]);
  assert.equal(result.items[0].price, 200);
});

test('pagination retains filters and rejects malformed page input', () => {
  const { adminPage, pageHref, ADMIN_PAGE_SIZE } = loadTs('src/lib/admin-pagination.ts');
  for (const input of ['-1', 'no', '1.2', 'Infinity']) assert.equal(adminPage(input), 1);
  assert.equal(adminPage('2'), 2);
  assert.equal(ADMIN_PAGE_SIZE, 25);
  assert.equal(pageHref('/admin/orders', { q: 'John Smith', status: 'pending', page: '9' }, 2), '/admin/orders?q=John+Smith&status=pending&page=2');
});

test('local image mapping uses existing optimized assets and preserves uploaded images', () => {
  const { localImage } = loadTs('src/lib/local-images.ts');
  const path = localImage('https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80');
  assert.ok(fs.existsSync('public' + path));
  assert.match(path, /\.webp$/);
  assert.equal(localImage('https://images.unsplash.com/not-cached'), '/product-placeholder.svg');
  assert.equal(localImage('https://example.supabase.co/storage/upload.webp'), 'https://example.supabase.co/storage/upload.webp');
});

test('canonical URL uses explicit origin, then Vercel production hostname, and rejects paths', () => {
  const keys = ['NEXT_PUBLIC_SITE_URL', 'VERCEL_PROJECT_PRODUCTION_URL'];
  const saved = keys.map(k => process.env[k]);
  try {
    const { getSiteUrl } = loadTs('src/lib/site.ts');
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'store.example.com';
    assert.equal(getSiteUrl(), 'https://store.example.com');
    process.env.NEXT_PUBLIC_SITE_URL = 'https://custom.example.com/';
    assert.equal(getSiteUrl(), 'https://custom.example.com');
    process.env.NEXT_PUBLIC_SITE_URL = 'https://custom.example.com/wrong';
    assert.equal(getSiteUrl(), null);
  } finally { keys.forEach((k, i) => { if (saved[i] === undefined) delete process.env[k]; else process.env[k] = saved[i]; }); }
});
