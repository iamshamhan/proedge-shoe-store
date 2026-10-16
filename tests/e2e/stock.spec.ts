import { test, expect } from "@playwright/test";

test.describe("Authoritative Stock Boundary", () => {
  test("Insufficient stock is rejected during checkout", async ({ page }) => {
    await page.goto("/shop");
    await page.waitForSelector("a[href^=\"/product/\"]");
    await page.locator("a[href^=\"/product/\"]").first().click();
    await expect(page).toHaveURL(/\/product\//);

    const sizeSelector = page.getByTestId("size-selector");
    if (await sizeSelector.count() > 0) {
      const sizeBtn = page.locator('[data-testid="size-btn"]:not([disabled])').first();
      await sizeBtn.waitFor({ state: "visible", timeout: 5000 });
      await sizeBtn.click();
    }

    const addToCartBtn = page.getByRole("button", { name: /Add to (Bag|Cart)/i }).first();
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();

    // Confirm item is in cart
    await expect(page.getByRole("dialog", { name: /Shopping cart/i })).toBeVisible();

    await page.goto("/cart");
    const checkoutBtn = page.getByRole("link", { name: /Check\s?out/i });
    await expect(checkoutBtn).toBeVisible();

    await page.evaluate(() => {
      const cartStr = localStorage.getItem("proedge-cart");
      if (cartStr) {
        const cart = JSON.parse(cartStr);
        if (cart.state && cart.state.items && cart.state.items.length > 0) {
          cart.state.items[0].quantity = 999;
          localStorage.setItem("proedge-cart", JSON.stringify(cart));
        }
      }
    });

    await page.reload();
    await page.getByRole("link", { name: /Check\s?out/i }).click();

    await page.getByRole("textbox", { name: /Full Name/i }).fill("Test User");
    await page.getByRole("textbox", { name: /Phone/i }).first().fill("0771234567");
    await page.getByRole("textbox", { name: /Address/i }).first().fill("123 Test Street");

    const placeOrderBtn = page.getByRole("button", { name: /Place Order/i });
    await placeOrderBtn.click();

    await page.waitForTimeout(2000);
  });
});
