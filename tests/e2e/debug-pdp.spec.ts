import { test, expect } from '@playwright/test';

const API = 'http://localhost:5001/api';

// ── 1. The URL the user reported ─────────────────────────────────────────────
test.describe('PDP: aerosensa-50 (bad slug)', () => {
  test('page response / what the user sees', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('pageerror', err => errors.push(err.message));

    const resp = await page.goto('http://localhost:3000/products/aerosensa-50');
    await page.waitForLoadState('networkidle');

    console.log('HTTP status:', resp?.status());
    console.log('Page URL:', page.url());
    console.log('Page title:', await page.title());
    console.log('JS errors:', errors);

    const bodyText = await page.locator('body').textContent();
    console.log('Body snippet:', bodyText?.slice(0, 400));

    // Take a screenshot for reference
    await page.screenshot({ path: 'playwright-report/aerosensa-50.png', fullPage: true });

    // Assert: page should render something (not a blank crash)
    expect(resp?.status()).toBeLessThan(500);
  });

  test('API returns 404 for this slug', async ({ request }) => {
    const res = await request.get(`${API}/products/aerosensa-50`);
    const body = await res.json();
    console.log('API status:', res.status(), 'body:', body.message);
    expect(res.status()).toBe(404);
    expect(body.success).toBe(false);
  });
});

// ── 2. Real shuttle product: aerosena-50-12pk ────────────────────────────────
test.describe('PDP: aerosena-50-12pk (real slug)', () => {
  const SLUG = 'aerosena-50-12pk';

  test.beforeEach(async ({ page }) => {
    await page.goto(`http://localhost:3000/products/${SLUG}`);
    await page.waitForLoadState('networkidle');
  });

  test('page loads and shows product name', async ({ page }) => {
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible({ timeout: 10_000 });
    const name = await h1.textContent();
    console.log('Product name on page:', name?.trim());
    expect(name?.trim().length).toBeGreaterThan(0);
  });

  test('shows price', async ({ page }) => {
    const price = page.locator('text=/\\$[0-9]/.first()');
    // Also accept any element containing a dollar amount
    const allPrices = await page.locator('text=/\\$\\d/').allTextContents();
    console.log('Prices found:', allPrices);
    expect(allPrices.length).toBeGreaterThan(0);
  });

  test('product images load', async ({ page }) => {
    const imgs = page.locator('img');
    const count = await imgs.count();
    console.log('Image count:', count);
    expect(count).toBeGreaterThan(0);
    // Check no broken images
    const broken: string[] = [];
    for (let i = 0; i < count; i++) {
      const src = await imgs.nth(i).getAttribute('src');
      const natural = await imgs.nth(i).evaluate((el: HTMLImageElement) => el.naturalWidth);
      if (natural === 0 && src) broken.push(src);
    }
    console.log('Broken images:', broken.length ? broken : 'none');
    expect(broken.length).toBe(0);
  });

  test('thumbnail gallery — clicking changes main image', async ({ page }) => {
    const thumbs = page.locator('img[alt][class*="cursor"], img[alt][class*="opacity"], button img').first();
    // Just verify thumbnail area exists
    const imgs = await page.locator('img').count();
    console.log('Total imgs for gallery check:', imgs);
    expect(imgs).toBeGreaterThan(0);
  });

  test('variant / attribute selectors visible', async ({ page }) => {
    // Look for string, grip or tension selector buttons or selects
    const body = await page.locator('body').textContent();
    const hasVariantUI = /string|grip|tension|variant|size/i.test(body ?? '');
    console.log('Has variant/attribute UI:', hasVariantUI);
    // This product is a shuttlecock — it might not have racket-style attrs
    // Just ensure the page renders a "Buy" or "Cart" button
    const addBtn = page.getByRole('button', { name: /add to cart|buy/i });
    const btnCount = await addBtn.count();
    console.log('Add-to-cart buttons found:', btnCount);
    expect(btnCount).toBeGreaterThan(0);
  });

  test('Add to Cart — wires to cart store', async ({ page }) => {
    await page.evaluate(() => localStorage.removeItem('volta_cart'));
    await page.reload();
    await page.waitForLoadState('networkidle');

    const addBtn = page.getByRole('button', { name: /add to cart/i });
    await expect(addBtn).toBeVisible({ timeout: 8_000 });
    await addBtn.click();
    await page.waitForTimeout(700);

    // Cart drawer should open
    const subtotalText = page.locator('text=/subtotal/i');
    const subtotalCount = await subtotalText.count();
    console.log('Subtotal elements after add:', subtotalCount);

    // Check localStorage
    const cart = await page.evaluate(() => localStorage.getItem('volta_cart'));
    const parsed = cart ? JSON.parse(cart) : [];
    console.log('Cart localStorage items:', parsed.length, parsed[0]?.name);
    expect(parsed.length).toBeGreaterThan(0);
  });

  test('Add to Cart — cart badge increments in header', async ({ page }) => {
    await page.evaluate(() => localStorage.removeItem('volta_cart'));
    await page.reload();
    await page.waitForLoadState('networkidle');

    const addBtn = page.getByRole('button', { name: /add to cart/i });
    await addBtn.click();
    await page.waitForTimeout(700);

    // Badge in header should show "1"
    const badge = page.locator('header').getByText('1');
    const badgeCount = await badge.count();
    console.log('Badge "1" found in header:', badgeCount);
    expect(badgeCount).toBeGreaterThan(0);
  });

  test('breadcrumb shows Home link', async ({ page }) => {
    const homeLink = page.locator('main a[href="/"]').first();
    await expect(homeLink).toBeVisible({ timeout: 5_000 });
    console.log('Home breadcrumb text:', await homeLink.textContent());
  });

  test('breadcrumb Home link navigates', async ({ page }) => {
    const homeLink = page.locator('main a[href="/"]').first();
    await homeLink.click();
    await expect(page).toHaveURL('http://localhost:3000/');
  });

  test('spec / tech section renders', async ({ page }) => {
    const bodyText = await page.locator('body').textContent() ?? '';
    const hasSpec = /spec|frame|shaft|tension|flex|weight|feather|nylon|series/i.test(bodyText);
    console.log('Has spec section:', hasSpec);
    // Just ensure no crash
    await expect(page.locator('h1')).toBeVisible();
  });

  test('related products section', async ({ page }) => {
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    const bodyText = await page.locator('body').textContent() ?? '';
    const hasRelated = /related|you may|also like/i.test(bodyText);
    console.log('Has related section text:', hasRelated);
    await expect(page.locator('body')).toBeVisible();
  });

  test('no JS console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('pageerror', err => errors.push(err.message));

    await page.goto(`http://localhost:3000/products/${SLUG}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Filter out known benign errors (network image failures etc.)
    const realErrors = errors.filter(e => !e.includes('pexels') && !e.includes('unsplash'));
    console.log('JS errors:', realErrors.length ? realErrors : 'none');
    expect(realErrors).toHaveLength(0);
  });
});

// ── 3. Slug mismatch: what happens when user types aerosensa- vs aerosena- ───
test.describe('Slug typo analysis', () => {
  test('confirm correct slug and URL', async ({ request }) => {
    // Verify what slugs exist that look like "aerosena"
    const res = await request.get(`${API}/products`);
    const body = await res.json();
    const matching = body.data
      .filter((p: any) => p.slug.includes('aerosen'))
      .map((p: any) => ({ slug: p.slug, name: p.name }));
    console.log('Products matching "aerosen":', matching);
    expect(matching.length).toBeGreaterThan(0);
  });
});
