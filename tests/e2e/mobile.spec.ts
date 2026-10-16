import { test, expect } from "@playwright/test";

test.describe("Mobile-First Viewport Tests (iPhone 14/15 390x844)", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("No horizontal overflow on homepage and mobile drawer functions smoothly", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // 1. Verify zero horizontal overflow (critical for mobile viewports)
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalOverflow).toBeFalsy();

    // 2. Open Mobile Navigation Drawer using accessible label
    const menuBtn = page.getByRole("button", { name: /Toggle navigation menu/i });
    await expect(menuBtn).toBeVisible();
    await menuBtn.click();

    // Drawer should open and display navigation options
    await expect(page.getByText("Explore All Gear")).toBeVisible();
    await expect(page.getByRole("link", { name: /Special Offers/i }).first()).toBeVisible();

    // Close Mobile Drawer
    const closeBtn = page.getByRole("button", { name: /Close menu/i });
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();
    await expect(page.getByText("Explore All Gear")).toBeHidden();
  });

  test("Mobile shop catalog filters and displays items cleanly", async ({ page }) => {
    await page.goto("/shop");
    await page.waitForLoadState("domcontentloaded");

    // Check no horizontal scroll
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasOverflow).toBeFalsy();

    // Mobile filter toggle should be present
    const filterBtn = page.getByRole("button", { name: /Filters/i });
    await expect(filterBtn).toBeVisible();
    await filterBtn.click();

    // Filter drawer should slide in
    await expect(page.getByRole("heading", { name: /Filter Products/i })).toBeVisible();
    const applyBtn = page.getByRole("button", { name: /Apply/i });
    await expect(applyBtn).toBeVisible();
    await applyBtn.click();
    await expect(page.getByRole("heading", { name: /Filter Products/i })).toBeHidden();
  });

  test("Mobile Product Page has sticky Add-to-Bag bar and opens Cart Drawer", async ({ page }) => {
    await page.goto("/shop");
    await page.waitForSelector("a[href^=\"/product/\"]");
    await page.locator("a[href^=\"/product/\"]").first().click();
    await expect(page).toHaveURL(/\/product\//);

    // Check sticky bottom bar is present
    const stickyBottomBar = page.locator(".fixed.bottom-0");
    await expect(stickyBottomBar).toBeVisible();

    // Select size using data-testid="size-btn"
    const sizeSelector = page.getByTestId("size-selector");
    if (await sizeSelector.count() > 0) {
      const sizeBtn = page.locator('[data-testid="size-btn"]:not([disabled])').first();
      await sizeBtn.waitFor({ state: "visible", timeout: 5000 });
      await sizeBtn.click();
    }

    // Tap sticky add to bag button
    const stickyAddBtn = stickyBottomBar.getByRole("button", { name: /Add to Bag|Added|Select Size/i });
    await expect(stickyAddBtn).toBeVisible();
    await stickyAddBtn.click();

    // Cart drawer should open
    await expect(page.getByRole("dialog", { name: /Shopping cart/i })).toBeVisible();
    const viewBagBtn = page.getByRole("link", { name: /View Bag/i });
    await expect(viewBagBtn).toBeVisible();

    // Close drawer
    const closeCartBtn = page.getByRole("button", { name: /Close cart drawer/i });
    await closeCartBtn.click();
    await expect(page.getByRole("dialog", { name: /Shopping cart/i })).toBeHidden();
  });

  test("Mobile checkout page has no overflow and touch inputs work", async ({ page }) => {
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

    const addBtn = page.getByRole("button", { name: /Add to (Bag|Cart)/i }).first();
    await addBtn.click();

    // Wait for drawer to open
    const drawer = page.getByRole("dialog", { name: /Shopping cart/i });
    await expect(drawer).toBeVisible();

    // Click checkout from the opened cart drawer
    const checkoutLink = drawer.getByRole("link", { name: /Check\s?out/i });
    await expect(checkoutLink).toBeVisible();
    await checkoutLink.click();
    await expect(page).toHaveURL(/\/checkout/);

    // Check no horizontal overflow
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasOverflow).toBeFalsy();

    // Verify touch-friendly inputs
    const fullNameInput = page.getByRole("textbox", { name: /Full Name/i });
    await expect(fullNameInput).toBeVisible();
    await fullNameInput.fill("Mobile User");
    await expect(fullNameInput).toHaveValue("Mobile User");
  });
});
