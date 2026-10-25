import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTs } from './load-ts.mjs';
const { resolveProductVariant } = loadTs('src/lib/product-variants.ts');
const variants = [
  { id: 'uk', colour: 'Black', sizeSystem: 'UK', size: 8, sizeValue: '8.5', stock: 2 },
  { id: 'us', colour: 'Black', sizeSystem: 'US', size: 8, sizeValue: '8.5', stock: 3 },
];
test('mixed size systems resolve to the selected variant without legacy-size fallback', () => {
  assert.equal(resolveProductVariant(variants, 'Black', 'US', '8.5').id, 'us');
  assert.equal(resolveProductVariant(variants, 'Black', 'UK', '8.5').id, 'uk');
  assert.equal(resolveProductVariant(variants, 'Black', 'UK', '8'), null);
  assert.equal(resolveProductVariant(variants, 'White', 'UK', '8.5'), null);
  assert.equal(resolveProductVariant(variants, 'Black', 'EU', '8.5'), null);
});
