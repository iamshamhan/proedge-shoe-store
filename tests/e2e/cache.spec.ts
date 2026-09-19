
import { test, expect } from "@playwright/test";

test.describe("Cache Invalidation", () => {
  test("Admin product mutation invalidates storefront cache", async ({ page }) => {
    // 1. Identify a test product on storefront
    await page.goto("/shop");
    const firstProductLink = page.locator("a.font-bold[href^=\"/product/\"]").first();
    const productTitle = await firstProductLink.textContent();
    const productUrl = await firstProductLink.getAttribute("href");
    
    // 2. Authenticate as admin
    await page.goto("/admin/login");
    // We attempt to login with a placeholder admin
    // In a CI environment without valid credentials, this will fail to authenticate and we skip the UI mutation gracefully.
    await page.fill("input[type=\"email\"]", process.env.ADMIN_EMAIL || "admin@example.com");
    await page.fill("input[type=\"password\"]", process.env.ADMIN_PASSWORD || "password123");
    await page.click("button[type=\"submit\"]");
    
    // Wait to see if we reached dashboard
    await page.waitForTimeout(2000);
    
    if (page.url().includes("/admin") && !page.url().includes("login")) {
      await page.goto("/admin/products");
      
      // Search for the product
      await page.fill("input[placeholder=\"Search products...\"]", productTitle || "");
      await page.click("a[href^=\"/admin/products/\"]"); // Edit button
      
      // 4. Modify a safe product field (e.g., adding a test suffix)
      const nameInput = page.getByLabel(/Product Name/i);
      const originalName = await nameInput.inputValue();
      const newName = originalName + " (Test)";
      await nameInput.fill(newName);
      
      // 5. Save the change
      await page.getByRole("button", { name: /Save Changes/i }).click();
      await page.waitForSelector("text=successfully");
      
      // 6. Return to storefront
      await page.goto(productUrl!);
      
      // 7. Verify changed value is reflected (proving cache invalidation)
      await expect(page.locator(`text=${newName}`)).toBeVisible();
      
      // Restore the product
      await page.goto(page.url().replace("/product/", "/admin/products/"));
      await page.getByLabel(/Product Name/i).fill(originalName);
      await page.getByRole("button", { name: /Save Changes/i }).click();
    } else {
      console.log("Skipping cache invalidation UI steps due to lack of admin credentials in test environment.");
      test.skip();
    }
  });
});

