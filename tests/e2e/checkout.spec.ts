import { test, expect } from '@playwright/test';

const fixture = {
  productId: '11111111-1111-4111-8111-111111111111',
  variantId: '22222222-2222-4222-8222-222222222222',
  name: 'Checkout fixture', slug: 'checkout-fixture', image: '/product-placeholder.svg',
  price: 1000, size: '42', sizeSystem: 'EU', color: 'Black', quantity: 1,
};
const customer = { fullName: 'Test Customer', phone: '0771234567', address: 'Test address', city: 'Colombo' };

// No POST leaves the browser: availability and saves are simulated independently.
// Turnstile is mocked only in Playwright, never in application/server code.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(item => {
    localStorage.setItem('proedge_cart_v1', JSON.stringify([item]));
    window.open = () => null;
  }, fixture);
  await page.route('https://challenges.cloudflare.com/**', route => route.fulfill({
    contentType: 'application/javascript', body: `
      const widgets = new Map();
      let sequence = 0;
      window.turnstile = {
        render(element, options) {
          const pass = document.createElement('button');
          pass.type = 'button'; pass.textContent = 'Complete test challenge';
          pass.onclick = () => options.callback('fixture-token');
          const expire = document.createElement('button');
          expire.type = 'button'; expire.textContent = 'Expire test challenge';
          expire.onclick = () => options['expired-callback']();
          element.append(pass, expire);
          const id = String(++sequence); widgets.set(id, [pass, expire]); return id;
        },
        remove(id) { widgets.get(id)?.forEach(button => button.remove()); widgets.delete(id); }
      };
    `,
  }));
  await page.route('**/*', async route => {
    if (route.request().method() !== 'POST') return route.fallback();
    const args = route.request().postDataJSON();
    if (Array.isArray(args) && args.length === 1 && Array.isArray(args[0])) {
      return route.fulfill({ contentType: 'text/x-component',
        body: '0:{"a":"$@1","b":"test","f":[]}\n1:' + JSON.stringify({ items: args[0] }) + '\n' });
    }
    return route.abort('failed');
  });
  await page.goto('/checkout');
  await page.getByRole('textbox', { name: /Full Name/i }).fill(customer.fullName);
  await page.getByRole('textbox', { name: /Phone/i }).first().fill(customer.phone);
  await page.getByRole('textbox', { name: /Address/i }).first().fill(customer.address);
});

test('challenge is required and expiry disables submission', async ({ page }) => {
  const submit = page.getByRole('button', { name: /Place Order/i });
  await expect(submit).toBeDisabled();
  await page.getByRole('button', { name: 'Complete test challenge' }).click();
  await expect(submit).toBeEnabled();
  await page.getByRole('button', { name: 'Expire test challenge' }).click();
  await expect(submit).toBeDisabled();
});

test('missing city stops checkout before a server request', async ({ page }) => {
  await page.getByRole('button', { name: 'Complete test challenge' }).click();
  const submit = page.getByRole('button', { name: /Place Order/i });
  await expect(submit).toBeEnabled();
  let requests = 0;
  page.on('request', request => { if (request.method() === 'POST') requests++; });
  await submit.click();
  await expect(page.getByText('City is required.', { exact: true })).toBeVisible();
  expect(requests).toBe(0);
});

test('network failure preserves cart and request ID but requires a fresh challenge', async ({ page }) => {
  const bodies: string[] = [];
  page.on('request', request => {
    if (request.method() === 'POST' && request.postData()?.includes('requestId')) bodies.push(request.postData()!);
  });
  await page.getByRole('textbox', { name: /^City/i }).fill(customer.city);
  const submit = page.getByRole('button', { name: /Place Order/i });
  for (let attempt = 0; attempt < 2; attempt++) {
    await page.getByRole('button', { name: 'Complete test challenge' }).click();
    await submit.click();
    await expect(page.getByText(/connection was interrupted/i)).toBeVisible();
    await expect(submit).toBeDisabled();
  }
  expect(bodies).toHaveLength(2);
  const first = JSON.parse(bodies[0]); const second = JSON.parse(bodies[1]);
  expect(first[0].requestId).toMatch(/^[a-f0-9-]{36}$/);
  expect(second[0].requestId).toBe(first[0].requestId);
  expect(first[2]).toBe('fixture-token');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('proedge_cart_v1') ?? '[]').length)).toBe(1);
});

test('saved receipt uses server totals and clears the cart without opening WhatsApp', async ({ page }) => {
  await page.route('**/checkout', async route => {
    if (route.request().method() !== 'POST') return route.fallback();
    const args = route.request().postDataJSON();
    if (!args[0]?.requestId) return route.fallback();
    const order = { order_number: 'TEST-RECEIPT', customer, subtotal: 2300, delivery_fee: 500, total: 2800,
      items: [{ name: 'Server-validated shoe', size: '42', size_value: '42', size_system: 'EU',
        colour: 'Black', quantity: 1, unit_price: 2300, line_total: 2300 }] };
    return route.fulfill({ contentType: 'text/x-component',
      body: '0:{"a":"$@1","b":"test","f":[]}\n1:' + JSON.stringify({ success: true, order }) + '\n' });
  });
  await page.getByRole('textbox', { name: /^City/i }).fill(customer.city);
  await page.getByRole('button', { name: 'Complete test challenge' }).click();
  await page.getByRole('button', { name: /Place Order/i }).click();
  await expect(page.getByRole('heading', { name: 'Order ready for WhatsApp.' })).toBeVisible();
  const link = page.locator('main a[href*="wa.me"]');
  await expect(link).toHaveCount(1);
  const text = new URL((await link.getAttribute('href'))!).searchParams.get('text');
  expect(text).toContain('TEST-RECEIPT');
  expect(text).toContain('Server-validated shoe');
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('proedge_cart_v1') ?? '[]').length)).toBe(0);
});
