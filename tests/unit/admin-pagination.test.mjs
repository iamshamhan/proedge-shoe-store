import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTs } from './load-ts.mjs';

const pagination = loadTs('src/lib/admin-pagination.ts');
function setup(fail = false) {
  const calls = [];
  const source = Array.from({ length: 61 }, (_, index) => ({ id: String(index), revision: 1, order_number: String(index), customer_name: 'Customer', phone: '0771234567', status: 'pending', total: 100 }));
  const db = { from(table) {
    const state = { table, filters: [], range: null, head: false };
    const query = {
      select(columns, options) { state.head = options?.head; return this; },
      order() { return this; },
      eq(column, value) { state.filters.push([column, value]); return this; },
      in(column, values) { state.ids = values; return this; },
      or(value) { state.search = value; return this; },
      range(from, to) { state.range = [from, to]; return this; },
      then(resolve, reject) {
        calls.push(state);
        let rows = table === 'orders' ? source : (state.ids ?? []).map(order_id => ({ order_id, quantity: 2 }));
        for (const [key, value] of state.filters) rows = rows.filter(row => row[key] === value);
        const count = rows.length;
        if (state.range) rows = rows.slice(state.range[0], state.range[1] + 1);
        return Promise.resolve(fail ? { error: { message: 'offline' } } : { data: state.head ? null : rows, count }).then(resolve, reject);
      },
    };
    return query;
  } };
  const jsx = (type, props) => ({ type, props });
  const { default: Page } = loadTs('src/app/admin/orders/page.tsx', {
    'react/jsx-runtime': { jsx, jsxs: jsx }, 'next/navigation': { redirect() { throw new Error('Unexpected redirect'); } },
    '@/components/admin/pagination': { AdminPagination: 'pagination' }, '@/lib/admin-pagination': pagination,
    '@/lib/auth/admin': { getAuthUser: async () => ({ isAdmin: true }) }, '@/lib/supabase/server': { getSupabaseServer: async () => db },
    '@/components/admin/orders-table': { OrdersTable: 'orders' }, 'lucide-react': {},
    '@/lib/supabase/read-all': loadTs('src/lib/supabase/read-all.ts'),
  });
  return { Page, calls };
}
function find(tree, type) {
  if (!tree || typeof tree !== 'object') return undefined;
  if (tree.type === type) return tree;
  for (const child of [tree.props?.children].flat(Infinity)) { const match = find(child, type); if (match) return match; }
}

test('admin order pagination fetches the requested 25 rows and only their items', async () => {
  const { Page, calls } = setup();
  const tree = await Page({ searchParams: Promise.resolve({ page: '2', status: 'pending', q: 'Customer' }) });
  const orders = find(tree, 'orders').props.initialOrders;
  assert.equal(orders.length, 25); assert.equal(orders[0].id, '25'); assert.equal(orders[24].id, '49');
  assert.equal(find(tree, 'pagination').props.total, 61);
  assert.deepEqual(calls[0].range, [25, 49]);
  assert.match(calls[0].search, /customer_name.ilike.%Customer%/);
  assert.deepEqual(calls.find(c => c.table === 'order_items').ids, orders.map(o => o.id));
  assert.equal(orders[0].item_count, 2);
  await assert.rejects(setup(true).Page({ searchParams: Promise.resolve({}) }), /offline/);
});
