import { test, expect } from '@playwright/test';

// A local cart fixture exercises the UI without creating production orders.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('proedge_cart_v1', JSON.stringify([{
      productId: '11111111-1111-4111-8111-111111111111',
      variantId: '22222222-2222-4222-8222-222222222222',
      name: 'Checkout fixture', slug: 'checkout-fixture', image: '/product-placeholder.svg',
      price: 1000, size: '42', sizeSystem: 'EU', color: 'Black', quantity: 1,
    }]));
  });
  // Every checkout POST is intercepted; these UI tests cannot write to the database.
  await page.route('**/checkout', async route => {
    if (route.request().method() === 'POST') await route.abort('failed');
    else await route.continue();
  });
  await page.goto('/checkout');
  await page.getByRole('textbox', { name: /Full Name/i }).fill('Test Customer');
  await page.getByRole('textbox', { name: /Phone/i }).first().fill('0771234567');
  await page.getByRole('textbox', { name: /Address/i }).first().fill('Test address');
});

test('missing city stops checkout before a server request', async ({ page }) => {
  let requests = 0;
  page.on('request', request => {
    if (request.method() === 'POST') requests++;
  });
  await page.getByRole('button', { name: /Place Order/i }).click();
  await expect(page.getByText('City is required.', { exact: true })).toBeVisible();
  expect(requests).toBe(0);
});

test('network failure preserves cart and allows retry with the same request ID', async ({ page }) => {
  const bodies: string[] = [];
  page.on('request', request => {
    if (request.method() === 'POST') bodies.push(request.postData() ?? '');
  });
  await page.getByRole('textbox', { name: /^City/i }).fill('Colombo');
  const submit = page.getByRole('button', { name: /Place Order/i });
  await submit.click();
  await expect(page.getByText(/connection was interrupted/i)).toBeVisible();
  await expect(submit).toBeEnabled();
  await submit.click();
  await expect.poll(() => bodies.length).toBe(2);
  await expect(submit).toBeEnabled();
  const requestId = (body: string) => body.match(/"requestId":"([a-f0-9-]+)"/)?.[1];
  expect(requestId(bodies[0])).toMatch(/^[a-f0-9-]{36}$/);
  expect(requestId(bodies[1])).toBe(requestId(bodies[0]));
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('proedge_cart_v1') ?? '[]').length)).toBe(1);
});
