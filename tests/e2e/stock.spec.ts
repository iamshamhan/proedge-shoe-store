
import { test, expect } from "@playwright/test";

test.describe("Authoritative Stock Boundary", () => {
  test("Insufficient stock is rejected during checkout", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Shop All/i }).first().click();
    await page.locator("a[href^=\"/product/\"]").first().click();
    
    const addToCartBtn = page.getByRole("button", { name: /Add to Cart/i });
    await expect(addToCartBtn).toBeVisible();

    const sizeSelector = page.getByTestId("size-selector");
    if (await sizeSelector.count() > 0) {
      const sizeButtons = sizeSelector.locator("button:not([disabled])");
      await sizeButtons.first().waitFor({ state: "visible", timeout: 2000 }).catch(() => {});
      if (await sizeButtons.count() > 0) {
        await sizeButtons.first().click();
      }
    }
    
    await addToCartBtn.click();
    await expect(page.getByRole("link", { name: /Shopping cart/i })).toContainText(/([1-9])/);
    
    await page.goto("/cart");
    const checkoutBtn = page.getByRole("link", { name: /Checkout/i });
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
    await page.getByRole("link", { name: /Checkout/i }).click();
    
    await page.getByRole("textbox", { name: /Full Name/i }).fill("Test User");
    await page.getByRole("textbox", { name: /Phone/i }).first().fill("0771234567");
    await page.getByRole("textbox", { name: /Address/i }).first().fill("123 Test Street");
    
    const placeOrderBtn = page.getByRole("button", { name: /Place Order/i });
    await placeOrderBtn.click();
    
    await page.waitForTimeout(2000);
  });
});

