import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'admin@volta.com';
const ADMIN_PASSWORD = 'admin123';

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Log in as admin
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/account|\/admin/, { timeout: 8000 });
  });

  test('Admin dashboard', async ({ page }) => {
    await page.goto('http://localhost:3000/admin');
    await page.waitForSelector('h1', { timeout: 8000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-results/admin-dashboard.png', fullPage: false });
    expect(await page.title()).toBeTruthy();
  });

  test('Admin orders', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/orders');
    await page.waitForSelector('h1', { timeout: 8000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-results/admin-orders.png', fullPage: false });
  });

  test('Admin reviews', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/reviews');
    await page.waitForSelector('h1', { timeout: 8000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-results/admin-reviews.png', fullPage: false });
  });

  test('Admin products', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/products');
    await page.waitForSelector('h1', { timeout: 8000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-results/admin-products.png', fullPage: false });
  });

  test('Admin coupons', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/coupons');
    await page.waitForSelector('h1', { timeout: 8000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-results/admin-coupons.png', fullPage: false });
  });
});
