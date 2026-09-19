
import { test, expect } from "@playwright/test";

test.describe("Authorization & Security", () => {
  test("Anonymous user cannot access admin dashboard", async ({ page }) => {
    await page.goto("/admin");
    // Should redirect to login or show unauthorized
    await expect(page).toHaveURL(/.*\/admin\/login/);
  });

  test("Anonymous user cannot access admin products", async ({ page }) => {
    await page.goto("/admin/products");
    await expect(page).toHaveURL(/.*\/admin\/login/);
  });
});

