import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTs } from './load-ts.mjs';

const jsx = (type, props) => ({ type, props });
const base = {
  'react/jsx-runtime': { jsx, jsxs: jsx }, 'next/link': { default: 'a' }, 'lucide-react': {},
  'next/navigation': { redirect() { throw new Error('Unexpected redirect'); } },
  '@/lib/auth/admin': { getAuthUser: async () => ({ isAdmin: true }) },
};
function nodes(tree) {
  if (!tree || typeof tree !== 'object') return [];
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  return [tree, ...nodes(tree.props?.children)];
}

test('stock-filtered catalog sends page and category filters to the database and retains its total', async () => {
  const calls = [];
  const db = { rpc: async (name, args) => {
    calls.push([name, args]); return { data: { products: [{ id: 'last' }], count: 26 }, error: null };
  } };
  const { default: Page } = loadTs('src/app/admin/products/page.tsx', { ...base,
    '@/lib/supabase/server': { getSupabaseServer: async () => db },
    '@/components/admin/product-table': { ProductTable: 'products' },
    '@/components/admin/pagination': { AdminPagination: 'pagination' },
    '@/lib/admin-pagination': loadTs('src/lib/admin-pagination.ts'),
    '@/lib/supabase/read-all': { readAllRows: async () => [{ id: 'parent', slug: 'shoes' }, { id: 'child', parent_id: 'parent' }] },
  });
  const tree = await Page({ searchParams: Promise.resolve({ page: '2', category: 'shoes', filter: 'low-stock', q: 'Running' }) });
  assert.deepEqual(calls[0], ['admin_get_product_page', {
    p_page: 2, p_page_size: 25, p_query: 'Running', p_category_ids: ['parent', 'child'], p_filter: 'low-stock',
  }]);
  assert.equal(nodes(tree).find(n => n.type === 'pagination').props.total, 26);
  assert.deepEqual(nodes(tree).find(n => n.type === 'products').props.products, [{ id: 'last' }]);
  await Page({ searchParams: Promise.resolve({ category: 'missing' }) });
  assert.deepEqual(calls[1][1].p_category_ids, []);
  db.rpc = async () => ({ error: { message: 'Database offline' } });
  await assert.rejects(Page({ searchParams: Promise.resolve({}) }), /Unable to load products/);
});

function dashboard(failedQuery = -1) {
  let query = 0;
  const rows = [
    { count: 50 }, { count: 40 }, { data: [] }, { count: 80 }, { count: 12 }, { data: [] },
    { data: { total: 123456, count: 33 } }, { data: [], count: 142 },
  ];
  const response = () => {
    const i = query++;
    return i === failedQuery ? { error: { message: 'Internal failure' } } : { ...rows[i], error: null };
  };
  const db = {
    rpc(name) { assert.equal(name, 'admin_get_revenue_summary'); return Promise.resolve(response()); },
    from() {
      const result = response();
      const chain = { then(resolve, reject) { return Promise.resolve(result).then(resolve, reject); } };
      for (const method of ['select', 'eq', 'order', 'limit', 'lte']) chain[method] = () => chain;
      return chain;
    },
  };
  return loadTs('src/app/admin/page.tsx', { ...base,
    '@/lib/supabase/server': { getSupabaseServer: async () => db }, './actions': { signOut() {} },
    '@/lib/currency': { formatLKR: value => `LKR ${value}` },
    '@/components/admin/order-status-badge': { OrderStatusBadge: 'status' },
  }).default;
}

test('dashboard shows database revenue and the full low-stock count, not the eight-row preview', async () => {
  const text = JSON.stringify(await dashboard()());
  assert.match(text, /LKR 123456/);
  assert.match(text, /33 confirmed orders/);
  assert.match(text, /142/);
});

test('dashboard rejects every failed query instead of presenting false zero totals', async () => {
  for (let i = 0; i < 8; i++) await assert.rejects(dashboard(i)(), /Unable to load dashboard/);
});
