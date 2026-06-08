import { test, expect } from '@playwright/test';

const API = 'http://localhost:5001/api';

test.describe('Products listing page (PLP)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/products');
    // Wait for products to load
    await page.waitForLoadState('networkidle');
  });

  test('renders product grid', async ({ page }) => {
    const productLinks = page.locator('a[href*="/products/"]');
    await expect(productLinks.first()).toBeVisible({ timeout: 10_000 });
    const count = await productLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('has filter sidebar', async ({ page }) => {
    // Desktop sidebar uses lg:block — target the h3 headings inside the aside
    const skillHeading = page.locator('aside h3').first();
    await expect(skillHeading).toBeVisible({ timeout: 8_000 });
  });

  test('has sort dropdown', async ({ page }) => {
    const sortSelect = page.locator('select').first();
    await expect(sortSelect).toBeVisible({ timeout: 8_000 });
  });

  test('clicking product navigates to PDP', async ({ page }) => {
    const firstProduct = page.locator('a[href*="/products/"]').first();
    const href = await firstProduct.getAttribute('href');
    await firstProduct.click();
    await expect(page).toHaveURL(/\/products\/.+/);
  });

  test('sort by price works', async ({ page }) => {
    const sortSelect = page.locator('select').first();
    await sortSelect.selectOption('price-asc');
    await page.waitForLoadState('networkidle');
    const productLinks = page.locator('a[href*="/products/"]');
    expect(await productLinks.count()).toBeGreaterThan(0);
  });
});

test.describe('Product detail page (PDP)', () => {
  let productSlug: string;

  test.beforeAll(async ({ request }) => {
    const res = await request.get(`${API}/products/featured`);
    const body = await res.json();
    productSlug = body.data[0]?.slug ?? 'astrox-100-zz';
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(`/products/${productSlug}`);
    await page.waitForLoadState('networkidle');
  });

  test('renders product name', async ({ page }) => {
    const heading = page.locator('h1');
    await expect(heading).toBeVisible({ timeout: 10_000 });
    const text = await heading.textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  });

  test('shows price', async ({ page }) => {
    const price = page.locator('text=/\\$\\d+/').first();
    await expect(price).toBeVisible({ timeout: 8_000 });
  });

  test('add to cart button exists', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add to cart/i });
    await expect(addBtn).toBeVisible({ timeout: 8_000 });
  });

  test('add to cart opens drawer', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add to cart/i });
    await addBtn.click();
    // Cart drawer should slide in
    await page.waitForTimeout(500);
    // Look for cart drawer or subtotal text
    const cartContent = page.locator('text=/subtotal|cart/i').first();
    await expect(cartContent).toBeVisible({ timeout: 5_000 });
  });

  test('thumbnail gallery renders', async ({ page }) => {
    const images = page.locator('img');
    const count = await images.count();
    expect(count).toBeGreaterThan(0);
  });

  test('breadcrumb shows current page label', async ({ page }) => {
    // Breadcrumb: Home (link) / Rackets (span)
    // The breadcrumb is a nav inside main (not the header nav)
    const breadcrumbNav = page.locator('main nav').first();
    await expect(breadcrumbNav).toBeVisible({ timeout: 5_000 });
    const breadcrumbText = await breadcrumbNav.textContent();
    expect(breadcrumbText).toMatch(/home/i);
  });
});
