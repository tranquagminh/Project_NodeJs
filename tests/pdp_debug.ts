import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors: string[] = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push('[console.error] ' + msg.text()); });
  page.on('pageerror', err => errors.push('[pageerror] ' + err.message));

  // ── Test 1: bad slug ──────────────────────────────────────────────────────
  console.log('\n=== /products/aerosensa-50 (bad slug) ===');
  const resp1 = await page.goto('http://localhost:3000/products/aerosensa-50');
  await page.waitForLoadState('networkidle');
  console.log('HTTP status:', resp1?.status());
  const title1 = await page.title();
  console.log('Page title:', title1);
  const body1 = (await page.locator('body').textContent())?.replace(/\s+/g, ' ').trim().slice(0, 500);
  console.log('Body text:', body1);
  console.log('JS errors:', errors.length ? errors : 'none');

  // ── Test 2: correct slug ──────────────────────────────────────────────────
  errors.length = 0;
  console.log('\n=== /products/aerosena-50-12pk (correct slug) ===');
  const resp2 = await page.goto('http://localhost:3000/products/aerosena-50-12pk');
  await page.waitForLoadState('networkidle');
  console.log('HTTP status:', resp2?.status());

  const h1 = await page.locator('h1').first().textContent().catch(() => null);
  console.log('H1 (product name):', h1?.trim());

  // Price
  const prices = await page.locator('text=/\\$\\d+/').allTextContents();
  console.log('Prices found:', prices.slice(0, 5));

  // Images
  const imgCount = await page.locator('img').count();
  let brokenImgs = 0;
  for (let i = 0; i < imgCount; i++) {
    const natural = await page.locator('img').nth(i).evaluate((el: any) => el.naturalWidth);
    if (natural === 0) brokenImgs++;
  }
  console.log(`Images: ${imgCount} total, ${brokenImgs} broken`);

  // Add to Cart button
  const addBtn = await page.getByRole('button', { name: /add to cart/i }).count();
  console.log('Add-to-Cart buttons:', addBtn);

  // Variant selectors (string/grip/tension)
  const bodyText = (await page.locator('body').textContent()) ?? '';
  const hasString = /BG\d+|string/i.test(bodyText);
  const hasGrip = /G[345]|grip/i.test(bodyText);
  const hasTension = /lbs|tension/i.test(bodyText);
  console.log('Has string selector:', hasString, '| Has grip:', hasGrip, '| Has tension:', hasTension);

  // Breadcrumb
  const homeLink = await page.locator('main a[href="/"]').first().textContent().catch(() => null);
  console.log('Breadcrumb home link:', homeLink?.trim());

  // Spec section
  const hasSpec = /spec|flex|shaft|weight|feather|nylon/i.test(bodyText);
  console.log('Has spec section:', hasSpec);

  // Related products
  const relatedLinks = await page.locator('a[href*="/products/"]').count();
  console.log('Product links on page (incl nav):', relatedLinks);

  // Cart add test
  await page.evaluate(() => localStorage.removeItem('volta_cart'));
  await page.reload();
  await page.waitForLoadState('networkidle');
  const btn = page.getByRole('button', { name: /add to cart/i });
  if (await btn.count() > 0) {
    await btn.click();
    await page.waitForTimeout(700);
    const cart = await page.evaluate(() => localStorage.getItem('volta_cart'));
    const items = cart ? JSON.parse(cart) : [];
    console.log('After Add to Cart — localStorage items:', items.length, items[0] ? `name="${items[0].name}" price=${items[0].price}` : '');
    const subtotal = await page.locator('text=/subtotal/i').count();
    console.log('Drawer opened (subtotal visible):', subtotal > 0);
    const badge = await page.locator('header').getByText('1').count();
    console.log('Header badge shows "1":', badge > 0);
  }

  console.log('\nJS errors during correct-slug visit:', errors.length ? errors : 'none');

  await browser.close();
})();
