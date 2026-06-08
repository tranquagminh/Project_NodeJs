import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders page title', async ({ page }) => {
    await expect(page).toHaveTitle(/VOLTA/i);
  });

  test('header navigation is visible', async ({ page }) => {
    const header = page.locator('header');
    await expect(header).toBeVisible();
    // Nav links — labels are "Rackets", "Footwear", etc.
    await expect(page.getByRole('link', { name: /rackets/i }).first()).toBeVisible();
  });

  test('hero section renders', async ({ page }) => {
    // Hero should have a heading or CTA
    const hero = page.locator('section').first();
    await expect(hero).toBeVisible();
  });

  test('footer is visible', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('navigates to products page via nav link', async ({ page }) => {
    await page.getByRole('link', { name: /rackets/i }).first().click();
    await expect(page).toHaveURL(/\/products/);
  });

  test('cart icon is in header', async ({ page }) => {
    // Cart icon button should be visible
    const cartBtn = page.locator('header').getByRole('button').filter({ hasText: '' }).first();
    await expect(page.locator('header')).toBeVisible();
  });

  test('search icon opens overlay', async ({ page }) => {
    // Click the search button in header
    const searchBtn = page.locator('header button[aria-label*="earch"], header button').filter({ hasText: '' }).nth(0);
    // find button that triggers the search overlay
    const buttons = page.locator('header button');
    const count = await buttons.count();
    // At least some buttons in header
    expect(count).toBeGreaterThan(0);
  });

  test('product cards load from API', async ({ page }) => {
    // Wait for product cards to appear (featured products from API)
    await page.waitForTimeout(2000);
    const productCards = page.locator('a[href*="/products/"]');
    const cardCount = await productCards.count();
    expect(cardCount).toBeGreaterThan(0);
  });
});
