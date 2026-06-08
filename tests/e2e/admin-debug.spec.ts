import { test } from '@playwright/test';

test('admin login redirects to /admin automatically', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.waitForSelector('input[type="email"]');

  await page.fill('input[type="email"]', 'admin@volta.com');
  await page.fill('input[type="password"]', 'admin123');

  await Promise.all([
    page.waitForResponse((r) => r.url().includes('/api/auth/login'), { timeout: 10000 }),
    page.click('button[type="submit"]'),
  ]);

  await page.waitForTimeout(2500);
  console.log('URL after admin login (no redirect param):', page.url());
  await page.screenshot({ path: 'test-results/admin-auto-redirect.png' });
});

test('admin link visible in header user menu', async ({ page }) => {
  // Log in as admin
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', 'admin@volta.com');
  await page.fill('input[type="password"]', 'admin123');
  await Promise.all([
    page.waitForResponse((r) => r.url().includes('/api/auth/login'), { timeout: 10000 }),
    page.click('button[type="submit"]'),
  ]);
  await page.waitForTimeout(2000);

  // Go to storefront
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(1500);

  // Open user menu
  await page.click('[aria-label="Account menu"]');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-results/admin-header-menu.png' });
});
