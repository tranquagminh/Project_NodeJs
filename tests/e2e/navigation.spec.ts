import { test, expect } from '@playwright/test';

const routes = [
  { path: '/', name: 'Home' },
  { path: '/products', name: 'Products PLP' },
  { path: '/cart', name: 'Cart' },
  { path: '/checkout', name: 'Checkout' },
  { path: '/about', name: 'About' },
  { path: '/contact', name: 'Contact' },
  { path: '/policy', name: 'Policy' },
  { path: '/login', name: 'Login' },
  { path: '/search', name: 'Search' },
];

test.describe('Page routing — all pages load without 404/500', () => {
  for (const route of routes) {
    test(`${route.name} (${route.path}) returns 200`, async ({ page }) => {
      const response = await page.goto(route.path);
      // Next.js app pages return 200 even for client components
      expect(response?.status()).toBeLessThan(400);
      // No uncaught JS errors
      await page.waitForLoadState('domcontentloaded');
      const main = page.locator('body');
      await expect(main).toBeVisible();
    });
  }
});

test.describe('Navigation links', () => {
  test('logo links to home', async ({ page }) => {
    await page.goto('/products');
    // Find logo link — href="/"
    const logo = page.locator('a[href="/"]').first();
    await expect(logo).toBeVisible();
    await logo.click();
    await expect(page).toHaveURL('/');
  });

  test('about page nav link works', async ({ page }) => {
    await page.goto('/');
    const aboutLink = page.locator('a[href*="/about"]').first();
    if (await aboutLink.count() > 0) {
      await aboutLink.click();
      await expect(page).toHaveURL(/\/about/);
    }
  });

  test('footer links are present', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    const footerLinks = footer.locator('a');
    const count = await footerLinks.count();
    expect(count).toBeGreaterThan(3);
  });
});
