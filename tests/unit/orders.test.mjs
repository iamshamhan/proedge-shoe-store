import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTs } from './load-ts.mjs';

function setup(isAdmin = true, error = null) {
  const calls = [], invalidations = [];
  const actions = loadTs('src/app/admin/actions.ts', {
    'next/navigation': { redirect() { throw new Error('Unexpected redirect'); } },
    'next/cache': { revalidatePath: (...args) => invalidations.push(args) },
    '@/lib/auth/admin': { getAuthUser: async () => ({ isAdmin }) },
    '@/lib/supabase/server': { getSupabaseServer: async () => ({
      rpc: async (name, args) => { calls.push({ name, args }); return {
        data: { total: 2500, item_count: 2, order_id: 'order', order_number: 'TEST' }, error,
      }; },
      from() { throw new Error('Order mutations must not use non-atomic table writes'); },
    }) },
    '@/types/order': loadTs('src/types/order.ts'),
    '@/lib/supabase/read-all': loadTs('src/lib/supabase/read-all.ts'),
  });
  return { ...actions, calls, invalidations };
}
const items = [{ variantId: 'variant', quantity: 2, unitPrice: 1000 }];
test('order confirmation uses atomic RPC and invalidates storefront stock', async () => {
  const action = setup();
  assert.deepEqual(await action.confirmOrderSale('order', items, 500, undefined, 3), { success: true, total: 2500, itemCount: 2 });
  assert.equal(action.calls.length, 1);
  assert.equal(action.calls[0].name, 'admin_save_order_checked');
  assert.equal(action.calls[0].args.p_revision, 3);
  assert.ok(action.invalidations.some(([path, type]) => path === '/' && type === 'layout'));
});
test('failed confirmation returns error without invalidating successful views', async () => {
  const action = setup(true, { message: 'ERR_INSUFFICIENT_STOCK' });
  assert.match((await action.confirmOrderSale('order', items, 500, undefined, 3)).error, /stock/i);
  assert.equal(action.invalidations.length, 0);
});
test('cancellation and deletion use database transactions', async () => {
  const action = setup();
  assert.deepEqual(await action.cancelOrderInquiry('order', 3), { success: true });
  assert.deepEqual(await action.deleteOrder('order', 4), { success: true });
  assert.deepEqual(action.calls.map(c => c.name), ['admin_change_order_status_checked', 'admin_delete_order_checked']);
  assert.deepEqual(action.calls.map(c => c.args.p_revision), [3, 4]);
});
test('stale order errors ask the administrator to reload', async () => {
  const action = setup(true, { message: 'ERR_ORDER_CHANGED' });
  assert.match((await action.confirmOrderSale('order', items, 500, undefined, 2)).error, /Another administrator.*Refresh/);
  assert.equal(action.invalidations.length, 0);
});
test('non-admin cannot call any order mutation', async () => {
  const action = setup(false);
  for (const result of await Promise.all([
    action.confirmOrderSale('order', items, 0), action.updateOrderStatus('order', 'confirmed'),
    action.deleteOrder('order'), action.createManualOrder({}),
  ])) assert.equal(result.error, 'Unauthorized.');
  assert.equal(action.calls.length, 0);
});
