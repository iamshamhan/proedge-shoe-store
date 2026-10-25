import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTs } from './load-ts.mjs';

const { readAllRows } = loadTs('src/lib/supabase/read-all.ts');
test('pagination reads beyond 1,000 rows without loss or duplication', async () => {
  const source = Array.from({ length: 1203 }, (_, id) => ({ id }));
  const ranges = [];
  const rows = await readAllRows(async (from, to) => {
    ranges.push([from, to]);
    return { data: source.slice(from, to + 1), error: null };
  });
  assert.deepEqual(rows, source);
  assert.deepEqual(ranges, [[0, 499], [500, 999], [1000, 1499]]);
});
test('pagination rejects a failed later page instead of returning incomplete data', async () => {
  await assert.rejects(readAllRows(async from => from === 0
    ? { data: Array(500).fill({}), error: null }
    : { data: null, error: { message: 'Connection interrupted' } }), /Connection interrupted/);
});
function catalog(productResult) {
  const sb = { from: table => {
    const result = table === 'categories' ? { data: [], error: null } : productResult;
    const query = { select: () => query, eq: () => query, order: () => query,
      range: () => Promise.resolve(result), maybeSingle: () => Promise.resolve(result) };
    return query;
  } };
  return loadTs('src/lib/supabase/products.ts', {
    react: { cache: fn => fn }, '@supabase/supabase-js': { createClient: () => sb },
    '@/lib/settings': { getStoreSettings: async () => ({}) }, './read-all': { readAllRows },
    '@/data/categories': { getCategorySlugsForQuery: () => [], getParentCategory: () => null },
  });
}
test('missing product returns null; failed lookup throws instead of displaying demo products', async () => {
  const oldUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const oldKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.invalid';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test';
  try {
    assert.equal(await catalog({ data: null, error: null }).getProductBySlug('missing'), null);
    await assert.rejects(catalog({ data: null, error: { message: 'offline' } }).getProductBySlug('missing'), /could not be loaded/);
    assert.deepEqual(await catalog({ data: [], error: null }).getAllProducts(), []);
  } finally {
    if (oldUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = oldUrl;
    if (oldKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = oldKey;
  }
});
