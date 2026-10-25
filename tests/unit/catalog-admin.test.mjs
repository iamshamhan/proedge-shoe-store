import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTs } from './load-ts.mjs';

function setup(responses = [], isAdmin = true, rpcError = null) {
  const calls = [];
  const db = {
    rpc: async (...args) => { calls.push(['rpc', ...args]); return { data: { id: 'copy', slug: 'copy-slug' }, error: rpcError }; },
    storage: { from() { throw new Error('Shared storage objects must not be deleted'); } },
    from(table) {
      calls.push(['from', table]);
      const response = responses.shift();
      assert.ok(response, 'Unexpected database query for ' + table);
      const chain = { then(resolve, reject) { return Promise.resolve(response).then(resolve, reject); } };
      for (const name of ['select', 'eq', 'delete', 'insert', 'update', 'upsert', 'single', 'maybeSingle']) {
        chain[name] = (...args) => { calls.push([name, ...args]); return chain; };
      }
      return chain;
    },
  };
  const actions = loadTs('src/app/admin/actions.ts', {
    'next/navigation': { redirect() { throw new Error('Unexpected redirect'); } },
    'next/cache': { revalidatePath() {} },
    '@/lib/auth/admin': { getAuthUser: async () => ({ isAdmin }) },
    '@/lib/supabase/server': { getSupabaseServer: async () => db },
    '@/types/order': loadTs('src/types/order.ts'),
    '@/lib/supabase/read-all': loadTs('src/lib/supabase/read-all.ts'),
  });
  return { ...actions, calls };
}
const ok = data => ({ data, error: null });
test('duplication uses one atomic RPC and propagates a failed copy', async () => {
  const action = setup();
  assert.deepEqual(await action.duplicateProduct('original'), { id: 'copy', slug: 'copy-slug' });
  assert.deepEqual(action.calls, [['rpc', 'admin_duplicate_product', { p_source_id: 'original' }]]);
  assert.equal((await setup([], true, { message: 'Copy failed' }).duplicateProduct('original')).error, 'Copy failed');
  assert.equal((await setup([], false).duplicateProduct('original')).error, 'Unauthorized.');
});
test('removing a copied image or product retains shared storage objects', async () => {
  assert.deepEqual(await setup([ok({ product_id: 'p' }), ok(null), ok({ slug: 'p' })]).removeProductImage('image'), { success: true });
  assert.deepEqual(await setup([ok({ slug: 'p' }), ok(null)]).deleteProduct('p'), { success: true });
});
test('stale stock edits reject instead of overwriting a sale', async () => {
  const action = setup([ok({ product_id: 'p' }), ok(null)]);
  assert.match((await action.updateVariantStock('v', 20, 7)).error, /Stock changed/);
  assert.ok(action.calls.some(c => c[0] === 'eq' && c[1] === 'stock' && c[2] === 7));
  for (const value of [NaN, Infinity, -1, 1.5]) {
    assert.match((await setup().updateVariantStock('v', value, 7)).error, /integer/);
  }
});
test('bulk sizes distinguish UK and US for the same colour and size', async () => {
  const action = setup([ok([{ colour: 'Black', size: 8, size_system: 'UK', size_value: '8' }]), ok([{ id: 'v', colour: 'Black', size: 8, size_system: 'US', size_value: '8', stock: 1 }]), ok({ slug: 'p' })]);
  const result = await action.addProductVariantsBulk('p', 'Black', ['8'], 1, 'US');
  assert.equal(result.added.length, 1);
  assert.equal(result.skippedCount, 0);
});
test('settings schema errors cannot silently discard fields and report success', async () => {
  const action = setup([{ data: null, error: { code: 'PGRST204', message: 'Missing field' } }]);
  const input = { free_delivery_enabled: true, free_delivery_threshold: 30000, default_delivery_fee: 600, brand_name: 'New brand' };
  assert.match((await action.updateStoreSettings(input)).error, /schema is out of date/);
  assert.equal(action.calls.filter(c => c[0] === 'upsert').length, 1);
  assert.match((await setup().updateStoreSettings({ ...input, default_delivery_fee: NaN })).error, /number/);
});

test('unavailable store settings fail explicitly instead of substituting delivery charges', async () => {
  const oldUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const oldKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.invalid';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'fixture';
  try {
    const chain = { select() { return this; }, eq() { return this; }, maybeSingle: async () => ({ data: null, error: { message: 'offline' } }) };
    const settings = loadTs('src/lib/settings.ts', { react: { cache: fn => fn }, '@supabase/supabase-js': { createClient: () => ({ from: () => chain }) } });
    await assert.rejects(settings.getStoreSettings(), /unavailable/);
  } finally {
    if (oldUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL; else process.env.NEXT_PUBLIC_SUPABASE_URL = oldUrl;
    if (oldKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = oldKey;
  }
});

test('cleared settings are written without fallback defaults', async () => {
  const action = setup([ok(null)]);
  const input = { free_delivery_enabled: true, free_delivery_threshold: 30000, default_delivery_fee: 600,
    hero_product_slug: '', contact_phone: '', contact_email: '', whatsapp_number: '' };
  assert.deepEqual(await action.updateStoreSettings(input), { success: true });
  const payload = action.calls.find(c => c[0] === 'upsert')[1];
  for (const key of ['hero_product_slug', 'contact_phone', 'contact_email', 'whatsapp_number']) assert.equal(payload[key], '');
});

test('image reordering uses one RPC, rejects duplicates and surfaces transaction failure', async () => {
  const action = setup([ok({ slug: 'p' })]);
  assert.deepEqual(await action.reorderProductImages('p', ['a', 'b']), { success: true });
  assert.deepEqual(action.calls[0], ['rpc', 'admin_reorder_product_images', { p_product_id: 'p', p_image_ids: ['a', 'b'] }]);
  assert.equal(action.calls.filter(c => c[0] === 'update').length, 0);
  assert.match((await setup().reorderProductImages('p', ['a', 'a'])).error, /Invalid/);
  assert.equal((await setup([], false).reorderProductImages('p', ['a'])).error, 'Unauthorized.');
  assert.equal((await setup([], true, { message: 'Gallery changed' }).reorderProductImages('p', ['a'])).error, 'Gallery changed');
});

test('reading cleared settings preserves empty values after reload', async () => {
  const oldUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const oldKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.invalid';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'fixture';
  try {
    for (const empty of ['', null]) {
      const row = { free_delivery_enabled: true, free_delivery_threshold: 30000, default_delivery_fee: 600,
        hero_product_slug: empty, contact_phone: empty, contact_email: empty, whatsapp_number: empty };
      const chain = { select() { return this; }, eq() { return this; }, maybeSingle: async () => ({ data: row }) };
      const { getStoreSettings } = loadTs('src/lib/settings.ts', { react: { cache: fn => fn }, '@supabase/supabase-js': { createClient: () => ({ from: () => chain }) } });
      const settings = await getStoreSettings();
      for (const key of ['heroProductSlug', 'contactPhone', 'contactEmail', 'whatsappNumber']) assert.equal(settings[key], '');
    }
  } finally {
    if (oldUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL; else process.env.NEXT_PUBLIC_SUPABASE_URL = oldUrl;
    if (oldKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = oldKey;
  }
});
