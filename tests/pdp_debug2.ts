import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const apiErrors: string[] = [];

  page.on('response', (resp) => {
    if (resp.url().includes('/products/aerosensa-50')) {
      console.log('API response for bad slug:', resp.status(), resp.url());
    }
  });

  // Test bad slug
  await page.goto('http://localhost:3000/products/aerosensa-50');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000); // extra time for React to process error

  // Check specifically in the main content area
  const mainText = await page.locator('main').last().textContent();
  console.log('\n=== MAIN content for aerosensa-50 ===');
  console.log('Main text:', mainText?.replace(/\s+/g, ' ').trim().slice(0, 600));

  // Is "Product not found" present?
  const notFoundVisible = await page.locator('text=/product not found/i').isVisible().catch(() => false);
  const notFoundCount = await page.locator('text=/product not found/i').count();
  console.log('"Product not found" visible:', notFoundVisible);
  console.log('"Product not found" count in DOM:', notFoundCount);

  // Check if loading state persists
  const isLoading = await page.locator('.animate-pulse').isVisible().catch(() => false);
  console.log('Still in loading state:', isLoading);

  // Screenshot
  await page.screenshot({ path: '/tmp/pdp-bad-slug.png', fullPage: false });
  console.log('Screenshot saved to /tmp/pdp-bad-slug.png');

  // Check the React Query error state by checking network requests
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  // Also test correct slug to compare
  console.log('\n=== MAIN content for aerosena-50-12pk ===');
  await page.goto('http://localhost:3000/products/aerosena-50-12pk');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  const mainText2 = await page.locator('main').last().textContent();
  console.log('Main text (first 300):', mainText2?.replace(/\s+/g, ' ').trim().slice(0, 300));

  // Check "Back to collection" link on bad-slug page
  await page.goto('http://localhost:3000/products/aerosensa-50');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const backLink = await page.locator('a[href="/products"]').count();
  console.log('\nBack to collection link count:', backLink);

  // Check React Query retry behavior - wait longer
  await page.waitForTimeout(5000);
  const notFoundAfterWait = await page.locator('text=/product not found/i').count();
  console.log('"Product not found" after 5s wait:', notFoundAfterWait);

  const mainTextFinal = await page.locator('main').last().textContent();
  console.log('Final main text:', mainTextFinal?.replace(/\s+/g, ' ').trim().slice(0, 400));

  await browser.close();
})();
