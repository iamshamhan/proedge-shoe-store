import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTs } from './load-ts.mjs';

const customer = { fullName: 'Test Customer', phone: '0771234567', whatsapp: '0777654321',
  address: 'Test address', city: 'Colombo', requestId: '11111111-1111-4111-8111-111111111111' };
const item = { productId: '22222222-2222-4222-8222-222222222222', variantId: '33333333-3333-4333-8333-333333333333', quantity: 2 };
function setup(result = { data: { order_number: 'TEST', total: 2500 }, error: null }) {
  const calls = [];
  const sb = {
    rpc: async (name, args) => { calls.push({ name, args }); return result; },
    from: () => { throw new Error('Checkout must not query products after saving'); },
  };
  const actions = loadTs('src/app/checkout/actions.ts', {
    'next/cache': { revalidatePath() { throw new Error('Checkout must not invalidate inventory'); } },
    '@/lib/checkout-security': { saveVerifiedInquiry: async (customer, items) => sb.rpc('place_order', { p_customer: customer, p_items: items }) },
  });
  return { ...actions, calls };
}
test('checkout strips supplied prices and carries request ID and WhatsApp to database', async () => {
  const { placeOrder, calls } = setup();
  const result = await placeOrder(customer, [{ ...item, price: 1, total: 1, name: 'Fake' }]);
  assert.equal(result.success, true);
  assert.equal(result.order.total, 2500);
  assert.deepEqual(calls[0].args.p_items, [item]);
  assert.equal(calls[0].args.p_customer.whatsapp, customer.whatsapp);
  assert.equal(calls[0].args.p_customer.requestId, customer.requestId);
});
for (const quantity of [0, -1, 0.5, 100, '2', NaN, Infinity]) {
  test(`invalid quantity ${quantity} cannot reach database`, async () => {
    const { placeOrder, calls } = setup();
    assert.equal((await placeOrder(customer, [{ ...item, quantity }])).success, false);
    assert.equal(calls.length, 0);
  });
}
test('missing city and malformed customer fields are rejected before database access', async () => {
  const { placeOrder, calls } = setup();
  for (const invalid of [null, { ...customer, city: '' }, { ...customer, fullName: 12 },
    { ...customer, notes: 'x'.repeat(4001) }, { ...customer, requestId: 'bad' }]) {
    assert.equal((await placeOrder(invalid, [item])).success, false);
  }
  assert.equal(calls.length, 0);
});
test('unexpected database errors are not exposed to customers', async () => {
  const { placeOrder } = setup({ data: null, error: { message: 'private database detail' } });
  const result = await placeOrder(customer, [item]);
  assert.equal(result.success, false);
  assert.doesNotMatch(result.error, /private database/);
});
test('database throttling produces an actionable message', async () => {
  const { placeOrder } = setup({ data: null, error: { message: 'ERR_RATE_LIMIT' } });
  assert.match((await placeOrder(customer, [item])).error, /wait an hour/);
});

test('malformed item fields are rejected before the RPC', async () => {
  const { placeOrder, calls } = setup();
  for (const changes of [
    { productId: {} }, { productId: 'bad' }, { variantId: [] }, { variantId: '' },
    { size: {} }, { size: null }, { size: Infinity }, { size: 'x'.repeat(101) },
    { sizeSystem: {} }, { sizeSystem: 'invalid' }, { sizeValue: [] },
    { sizeValue: 'x'.repeat(101) }, { color: {} }, { color: 'x'.repeat(201) },
    { variantId: null },
  ]) {
    assert.equal((await placeOrder(customer, [{ ...item, ...changes }])).success, false);
  }
  assert.equal(calls.length, 0);
});

test('legacy numeric, fractional and custom sizes still reach the RPC', async () => {
  for (const size of [42, 42.5, 'One Size', 'M (UK 6-8)']) {
    const { placeOrder, calls } = setup();
    assert.equal((await placeOrder(customer, [{ productId: item.productId, size,
      sizeSystem: typeof size === 'number' ? 'EU' : 'Custom', color: 'Black', quantity: 1 }])).success, true);
    assert.equal(calls[0].args.p_items[0].sizeValue, String(size));
  }
});

test('legacy explicit sizeValue works without numeric size', async () => {
  const { placeOrder, calls } = setup();
  assert.equal((await placeOrder(customer, [{ productId: item.productId,
    sizeValue: 'XL', sizeSystem: 'Custom', color: 'Blue', quantity: 1 }])).success, true);
  assert.equal(calls[0].args.p_items[0].sizeValue, 'XL');
});

test('checkout passes the challenge to the guarded writer and surfaces rejection', async () => {
  let seen;
  const { placeOrder } = loadTs('src/app/checkout/actions.ts', {
    '@/lib/checkout-security': { saveVerifiedInquiry: async (_customer, _items, token) => {
      seen = token;
      return { data: null, error: { message: 'ERR_BOT_VERIFICATION' } };
    } },
  });
  const result = await placeOrder(customer, [item], 'challenge-token');
  assert.equal(seen, 'challenge-token');
  assert.equal(result.success, false);
  assert.match(result.error, /security check/);
});
