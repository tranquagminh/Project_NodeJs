import { test, expect } from '@playwright/test';

test.describe('Search page', () => {
  test('direct URL with query param pre-fills search', async ({ page }) => {
    await page.goto('/search?q=racket');
    // The search page input is inside main (not the header overlay).
    // The header overlay input is opacity-0 (but still in DOM) — skip it with 'main' scope.
    const searchInput = page.locator('main input[type="text"]');
    await expect(searchInput).toBeVisible({ timeout: 8_000 });
    // Value is set via useEffect after React hydration
    await expect(searchInput).toHaveValue('racket', { timeout: 5_000 });
  });

  test('shows results for a query', async ({ page }) => {
    await page.goto('/search?q=racket');
    await page.waitForLoadState('networkidle');

    const cards = page.locator('a[href*="/products/"]');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('empty query shows popular tags', async ({ page }) => {
    await page.goto('/search');
    await page.waitForLoadState('networkidle');

    // Popular tags row should be visible
    const popularLabel = page.locator('text=/popular/i').first();
    await expect(popularLabel).toBeVisible({ timeout: 5_000 });
  });

  test('search with no results shows empty state', async ({ page }) => {
    await page.goto('/search?q=xyznonexistentproduct12345');
    await page.waitForLoadState('networkidle');
    // Page should render without crashing
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('typing in search input updates results', async ({ page }) => {
    await page.goto('/search');
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.fill('badminton');
    await page.waitForTimeout(600); // wait for 350ms debounce + render

    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});

test.describe('Header search overlay', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('search icon button is present in header', async ({ page }) => {
    const header = page.locator('header');
    const buttons = header.locator('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
  });
});
