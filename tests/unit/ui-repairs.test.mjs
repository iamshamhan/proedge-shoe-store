import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTs } from './load-ts.mjs';

function harness() {
  const state = []; let cursor = 0;
  const jsx = (type, props) => ({ type, props });
  const react = { useState(initial) { const i = cursor++; if (!(i in state)) state[i] = typeof initial === 'function' ? initial() : initial;
    return [state[i], next => { state[i] = typeof next === 'function' ? next(state[i]) : next; }]; }, useMemo: fn => fn(), useCallback: fn => fn };
  return { state, render: (component, props) => { cursor = 0; return component(props); }, mocks: {
    react: { ...react, default: react }, 'react/jsx-runtime': { jsx, jsxs: jsx },
    'next/link': { default: 'a' }, 'next/image': { default: 'img' }, 'lucide-react': {},
    'next/navigation': { useRouter: () => ({ push() {}, refresh() {} }) },
  } };
}
function nodes(tree) {
  if (!tree || typeof tree !== 'object') return [];
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  return [tree, ...nodes(tree.props?.children)];
}

test('Quick Buy uses the exact labelled fractional UK/US variant and never falls back after it disappears', () => {
  const h = harness(); const added = [];
  const { ProductCard } = loadTs('src/components/ui/product-card.tsx', { ...h.mocks,
    '@/lib/product-variants': loadTs('src/lib/product-variants.ts'), '@/data/products': { formatLKR: String },
    '@/context/cart-context': { useCart: () => ({ addItem: item => added.push(item), setIsCartDrawerOpen() {} }) },
    '@/context/wishlist-context': { useWishlist: () => ({ isWishlisted: () => false, toggleWishlist() {} }) },
  });
  const product = { id: 'p', name: 'Shoe', slug: 'shoe', price: 100, images: ['/shoe.webp'], category: 'shoes', stock: 4,
    sizes: ['8.5'], sizeSystem: 'UK', variants: [
      { id: 'uk', colour: 'Black', size: 8, sizeValue: '8.5', sizeSystem: 'UK', stock: 2 },
      { id: 'us', colour: 'Black', size: 8, sizeValue: '8.5', sizeSystem: 'US', stock: 2 },
    ] };
  const event = { preventDefault() {}, stopPropagation() {} };
  let tree = h.render(ProductCard, { product });
  nodes(tree).find(n => n.props?.title === 'Select size US 8.5 Black').props.onClick(event);
  tree = h.render(ProductCard, { product });
  const buy = () => nodes(tree).find(n => n.type === 'button' && n.props?.className?.startsWith('px-2.5 py-1.5'));
  globalThis.window = { setTimeout() {} };
  try {
    buy().props.onClick(event);
    assert.equal(added[0].variantId, 'us'); assert.equal(added[0].size, '8.5'); assert.equal(added[0].sizeSystem, 'US');
    tree = h.render(ProductCard, { product: { ...product, variants: [product.variants[0]] } });
    assert.equal(buy().props.disabled, true);
    buy().props.onClick(event);
    assert.equal(added.length, 1);
  } finally { delete globalThis.window; }
});

test('admin product save clears loading and displays error after a rejected network call', async () => {
  const h = harness();
  const { ProductForm } = loadTs('src/components/admin/product-form.tsx', { ...h.mocks,
    '@/app/admin/actions': { updateProduct: async () => { throw new Error('offline'); } },
    './image-manager': { ImageManager: 'images' }, './variant-manager': { VariantManager: 'variants' },
  });
  const props = { categories: [{ id: 'c', slug: 'shoes', name: 'Shoes' }], product: {
    id: 'p', name: 'Shoe', slug: 'shoe', description: '', category_id: 'c', price: 100, compare_at_price: null,
    featured: false, is_new_arrival: false, is_on_sale: false, is_active: true, product_images: [], product_variants: [],
  } };
  const tree = h.render(ProductForm, props);
  await nodes(tree).find(n => n.type === 'form').props.onSubmit({ preventDefault() {} });
  const after = h.render(ProductForm, props);
  assert.ok(h.state.some(value => typeof value === 'string' && value.includes('could not be completed')));
  assert.equal(nodes(after).find(n => n.type === 'button' && n.props?.type === 'submit').props.disabled, false);
});
