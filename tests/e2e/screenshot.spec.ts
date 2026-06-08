import { test } from '@playwright/test';

test('homepage', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'test-results/homepage.png', fullPage: true });
});

test('products page', async ({ page }) => {
  await page.goto('/products', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'test-results/products.png', fullPage: true });
});

test('login page', async ({ page }) => {
  await page.goto('/login', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'test-results/login.png', fullPage: true });
});

test('cart page', async ({ page }) => {
  await page.goto('/cart', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'test-results/cart.png', fullPage: true });
});

test('404 page', async ({ page }) => {
  await page.goto('/this-page-does-not-exist', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'test-results/404.png', fullPage: true });
});

test('product detail page', async ({ page }) => {
  // Get a real slug from API first
  const res = await page.request.get('http://localhost:5001/api/products?limit=1');
  const json = await res.json();
  const slug = json.data?.[0]?.slug ?? 'vector-x1-pro';
  await page.goto(`/products/${slug}`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'test-results/pdp.png', fullPage: true });
});
