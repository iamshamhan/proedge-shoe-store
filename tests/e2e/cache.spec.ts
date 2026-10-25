import { test, expect } from '@playwright/test';

test('admin edit refreshes a dedicated test product on the storefront', async ({ page }) => {
  test.skip(process.env.E2E_MUTATIONS_ALLOWED !== 'true' || !process.env.ADMIN_EMAIL
    || !process.env.ADMIN_PASSWORD || !process.env.E2E_PRODUCT_ID || !process.env.E2E_PRODUCT_SLUG,
    'Requires explicit mutation opt-in, admin credentials and a dedicated fixture product.');
  const editPath = '/admin/products/' + process.env.E2E_PRODUCT_ID;
  const storefrontPath = '/product/' + process.env.E2E_PRODUCT_SLUG;
  await page.goto(storefrontPath);
  await expect(page.locator('h1')).toBeVisible();
  await page.goto('/admin/login');
  await page.locator('input[type="email"]').fill(process.env.ADMIN_EMAIL!);
  await page.locator('input[type="password"]').fill(process.env.ADMIN_PASSWORD!);
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto(editPath);
  const name = page.getByLabel(/^Name/);
  const original = await name.inputValue();
  const changed = original + ' E2E-' + Date.now();
  try {
    await name.fill(changed);
    await page.getByRole('button', { name: /Save Product Info/i }).click();
    await expect(page).toHaveURL(/\/admin\/products$/);
    await page.goto(storefrontPath);
    await expect(page.getByRole('heading', { name: changed, exact: true })).toBeVisible();
  } finally {
    await page.goto(editPath);
    await page.getByLabel(/^Name/).fill(original);
    await page.getByRole('button', { name: /Save Product Info/i }).click();
    await expect(page).toHaveURL(/\/admin\/products$/);
  }
});
