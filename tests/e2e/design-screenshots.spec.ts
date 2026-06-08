import { test } from '@playwright/test';
import path from 'path';

const OUT = '/Users/minhqt1/Desktop/Project_NodeJs/test-results/design-review';

test('homepage screenshot', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500); // let images / fonts settle
  await page.screenshot({ path: path.join(OUT, 'client-home.png'), fullPage: true });
});

test('products page screenshot', async ({ page }) => {
  await page.goto('/products', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUT, 'client-products.png'), fullPage: true });
});

test('product detail page screenshot', async ({ page }) => {
  // Fetch a real slug from the API
  const res = await page.request.get('http://localhost:5001/api/products?limit=1');
  const json = await res.json();
  const slug = json.data?.[0]?.slug ?? 'vector-x1-pro';
  await page.goto(`/products/${slug}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUT, 'client-product-detail.png'), fullPage: true });
});

test('search page screenshot', async ({ page }) => {
  await page.goto('/search?q=shoe', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUT, 'client-search.png'), fullPage: true });
});
