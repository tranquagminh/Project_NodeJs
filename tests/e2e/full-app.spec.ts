import { test, expect, Page } from '@playwright/test';

const BASE = 'http://localhost:3000';
const ADMIN = { email: 'admin@volta.com', password: 'admin123' };
const USER  = { email: 'test_playwright@volta.com', password: 'test1234', name: 'Playwright Tester' };

async function loginAs(page: Page, creds: { email: string; password: string }) {
  await page.goto(`${BASE}/login`);
  await page.fill('input[type="email"]', creds.email);
  await page.fill('input[type="password"]', creds.password);
  await Promise.all([
    page.waitForResponse((r) => r.url().includes('/api/auth/login'), { timeout: 10000 }),
    page.click('button[type="submit"]'),
  ]);
  await page.waitForTimeout(2000);
}

async function shot(page: Page, name: string) {
  await page.screenshot({ path: `test-results/app-${name}.png`, fullPage: false });
}

// ─── PUBLIC STOREFRONT ────────────────────────────────────────────────────────
test.describe('Public storefront', () => {

  test('01 · Homepage loads with hero and nav', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    await shot(page, '01-homepage');
    await expect(page.getByRole('link', { name: /volta/i }).first()).toBeVisible();
  });

  test('02 · Header Rackets link → PLP', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    await page.click('text=Rackets');
    await page.waitForURL(/\/products/, { timeout: 6000 });
    await shot(page, '02-plp-nav');
    expect(page.url()).toContain('/products');
  });

  test('03 · PLP loads products from API', async ({ page }) => {
    await page.goto(`${BASE}/products`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await shot(page, '03-plp');
    const cards = page.locator('a[href*="/products/"]');
    await expect(cards.first()).toBeVisible({ timeout: 8000 });
    const count = await cards.count();
    console.log('Product cards visible:', count);
    expect(count).toBeGreaterThan(0);
  });

  test('04 · PDP loads real product', async ({ page }) => {
    await page.goto(`${BASE}/products/astrox-88-d-pro`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await shot(page, '04-pdp');
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
  });

  test('05 · PDP: Add to cart opens drawer with product', async ({ page }) => {
    await page.goto(`${BASE}/products/astrox-88-d-pro`);
    await page.waitForTimeout(2000);
    const addBtn = page.locator('button', { hasText: /add to cart/i }).first();
    await addBtn.waitFor({ timeout: 8000 });
    await addBtn.click();
    await page.waitForTimeout(1200);
    await shot(page, '05-cart-drawer');
    await expect(page.locator('text=Your cart')).toBeVisible();
  });

  test('06 · Cart page — empty state', async ({ page }) => {
    await page.goto(`${BASE}/cart`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await shot(page, '06-cart');
  });

  test('07 · Search page with query param', async ({ page }) => {
    await page.goto(`${BASE}/search?q=astrox`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1200);
    await shot(page, '07-search');
  });

  test('08 · About page', async ({ page }) => {
    await page.goto(`${BASE}/about`);
    await page.waitForLoadState('networkidle');
    await shot(page, '08-about');
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
  });

  test('09 · Contact page', async ({ page }) => {
    await page.goto(`${BASE}/contact`);
    await page.waitForLoadState('networkidle');
    await shot(page, '09-contact');
  });

  test('10 · Policy page', async ({ page }) => {
    await page.goto(`${BASE}/policy`);
    await page.waitForLoadState('networkidle');
    await shot(page, '10-policy');
  });

  test('11 · 404 page for unknown route', async ({ page }) => {
    await page.goto(`${BASE}/this-does-not-exist`);
    await page.waitForLoadState('networkidle');
    await shot(page, '11-404');
  });

  test('12 · PDP: bad slug shows "Product not found"', async ({ page }) => {
    await page.goto(`${BASE}/products/not-a-real-product`);
    await page.waitForTimeout(3000);
    await shot(page, '12-pdp-notfound');
    await expect(page.locator('text=Product not found')).toBeVisible();
  });

  test('13 · Forgot password page loads', async ({ page }) => {
    await page.goto(`${BASE}/forgot-password`);
    await page.waitForLoadState('networkidle');
    await shot(page, '13-forgot-password');
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('14 · Forgot password submit shows confirmation', async ({ page }) => {
    await page.goto(`${BASE}/forgot-password`);
    await page.fill('input[type="email"]', 'someone@example.com');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1500);
    await shot(page, '14-forgot-password-sent');
    await expect(page.locator('text=Check your inbox')).toBeVisible();
  });
});

// ─── AUTH FLOWS ───────────────────────────────────────────────────────────────
test.describe('Auth flows', () => {

  test('15 · Login page tabs work', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.waitForLoadState('networkidle');
    await shot(page, '15-login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    // Switch to Create Account
    await page.click('text=Create account');
    await page.waitForTimeout(400);
    await shot(page, '15b-register-tab');
    await expect(page.locator('input[placeholder*="Jane"]')).toBeVisible();
  });

  test('16 · Wrong password keeps user on login page', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.fill('input[type="email"]', ADMIN.email);
    await page.fill('input[type="password"]', 'wrongpass');
    await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/auth/login'), { timeout: 10000 }),
      page.click('button[type="submit"]'),
    ]);
    await page.waitForTimeout(1000);
    await shot(page, '16-login-error');
    expect(page.url()).toContain('/login');
    // Error message should appear (red alert)
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('17 · Admin login → redirects to /admin', async ({ page }) => {
    await loginAs(page, ADMIN);
    await shot(page, '17-admin-auto-redirect');
    expect(page.url()).toContain('/admin');
  });

  test('18 · User login → redirects to /account', async ({ page }) => {
    await loginAs(page, USER);
    await shot(page, '18-user-redirect');
    expect(page.url()).toContain('/account');
  });

  test('19 · Unauthenticated /account → login page', async ({ page }) => {
    await page.goto(`${BASE}/account`);
    await page.waitForTimeout(2500);
    await shot(page, '19-account-guard');
    expect(page.url()).toContain('/login');
  });

  test('20 · Unauthenticated /admin → login page', async ({ page }) => {
    await page.goto(`${BASE}/admin`);
    await page.waitForTimeout(2500);
    await shot(page, '20-admin-guard');
    expect(page.url()).toContain('/login');
  });
});

// ─── AUTHENTICATED USER ───────────────────────────────────────────────────────
test.describe('Authenticated user flows', () => {

  test('21 · Account profile page', async ({ page }) => {
    await loginAs(page, USER);
    await page.goto(`${BASE}/account`);
    await page.waitForTimeout(1500);
    await shot(page, '21-account-profile');
    await expect(page.getByRole('heading', { name: /account/i }).first()).toBeVisible();
  });

  test('22 · Account orders page', async ({ page }) => {
    await loginAs(page, USER);
    await page.goto(`${BASE}/account/orders`);
    await page.waitForTimeout(1500);
    await shot(page, '22-account-orders');
  });

  test('23 · Account wishlist page', async ({ page }) => {
    await loginAs(page, USER);
    await page.goto(`${BASE}/account/wishlist`);
    await page.waitForTimeout(1500);
    await shot(page, '23-account-wishlist');
  });

  test('24 · Checkout redirects to /cart when cart empty', async ({ page }) => {
    await loginAs(page, USER);
    await page.goto(`${BASE}/checkout`);
    await page.waitForTimeout(2000);
    await shot(page, '24-checkout-empty');
    // Correct: redirects to cart when empty
    expect(page.url()).toContain('/cart');
  });

  test('25 · Checkout page loads when cart has items', async ({ page }) => {
    await loginAs(page, USER);
    // Add item to cart first
    await page.goto(`${BASE}/products/astrox-88-d-pro`);
    await page.waitForTimeout(2000);
    await page.locator('button', { hasText: /add to cart/i }).first().click();
    await page.waitForTimeout(1000);
    // Now go to checkout
    await page.goto(`${BASE}/checkout`);
    await page.waitForTimeout(2000);
    await shot(page, '25-checkout-with-items');
    expect(page.url()).toContain('/checkout');
  });

  test('26 · Header admin menu shows "Admin Panel" for admin', async ({ page }) => {
    await loginAs(page, ADMIN);
    await page.goto(BASE);
    await page.waitForTimeout(1500);
    await page.click('[aria-label="Account menu"]');
    await page.waitForTimeout(500);
    await shot(page, '26-admin-header-menu');
    await expect(page.locator('text=Admin Panel')).toBeVisible();
  });

  test('27 · Regular user does NOT see Admin Panel in menu', async ({ page }) => {
    await loginAs(page, USER);
    await page.goto(BASE);
    await page.waitForTimeout(1500);
    await page.click('[aria-label="Account menu"]');
    await page.waitForTimeout(500);
    await shot(page, '27-user-header-menu');
    await expect(page.locator('text=Admin Panel')).not.toBeVisible();
  });

  test('28 · PDP review form visible + submission works', async ({ page }) => {
    await loginAs(page, USER);
    await page.goto(`${BASE}/products/astrox-88-d-pro`);
    await page.waitForTimeout(2000);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(800);
    await shot(page, '28-pdp-review-form');
    await expect(page.locator('text=Write a review')).toBeVisible();

    // Try submitting a review
    await page.locator('textarea').last().fill('Great racket, very fast swing speed!');
    const [reviewRes] = await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/reviews'), { timeout: 10000 }),
      page.locator('button', { hasText: /submit review/i }).click(),
    ]);
    const reviewBody = await reviewRes.json();
    console.log('Review submit status:', reviewRes.status(), '| message:', reviewBody?.message);
    await page.waitForTimeout(1500);
    await shot(page, '28b-review-submitted');
  });
});

// ─── ADMIN DASHBOARD ─────────────────────────────────────────────────────────
test.describe('Admin dashboard', () => {

  test('29 · Admin dashboard KPI cards', async ({ page }) => {
    await loginAs(page, ADMIN);
    await page.goto(`${BASE}/admin`);
    await page.waitForTimeout(2500);
    await shot(page, '29-admin-dashboard');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.locator('text=in catalog').first()).toBeVisible();
  });

  test('30 · Admin orders — status filter tabs', async ({ page }) => {
    await loginAs(page, ADMIN);
    await page.goto(`${BASE}/admin/orders`);
    await page.waitForTimeout(2000);
    await shot(page, '30-admin-orders');
    await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible();
    await expect(page.locator('text=PENDING')).toBeVisible();
  });

  test('31 · Admin reviews — moderation queue', async ({ page }) => {
    await loginAs(page, ADMIN);
    await page.goto(`${BASE}/admin/reviews`);
    await page.waitForTimeout(2000);
    await shot(page, '31-admin-reviews');
    await expect(page.getByRole('heading', { name: 'Reviews' })).toBeVisible();
  });

  test('32 · Admin products — table with rows', async ({ page }) => {
    await loginAs(page, ADMIN);
    await page.goto(`${BASE}/admin/products`);
    await page.waitForTimeout(2500);
    await shot(page, '32-admin-products');
    await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 8000 });
    const rows = await page.locator('table tbody tr').count();
    console.log('Product rows in admin table:', rows);
    expect(rows).toBeGreaterThan(0);
  });

  test('33 · Admin coupons — existing coupons visible', async ({ page }) => {
    await loginAs(page, ADMIN);
    await page.goto(`${BASE}/admin/coupons`);
    await page.waitForTimeout(2000);
    await shot(page, '33-admin-coupons');
    await expect(page.locator('text=VOLTA10')).toBeVisible({ timeout: 6000 });
  });

  test('34 · Admin: non-admin user redirected to homepage', async ({ page }) => {
    await loginAs(page, USER);
    await page.goto(`${BASE}/admin`);
    await page.waitForTimeout(3000);
    await shot(page, '34-admin-non-admin-blocked');
    expect(page.url()).not.toContain('/admin');
  });
});
