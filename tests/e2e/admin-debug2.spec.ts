import { test, expect } from '@playwright/test';

test('debug login API response', async ({ page }) => {
  // Intercept the login request
  const responsePromise = page.waitForResponse('**/auth/login', { timeout: 15000 });
  
  await page.goto('http://localhost:3001/login');
  await page.waitForSelector('input[placeholder="Email"]', { timeout: 10000 });
  await page.fill('input[placeholder="Email"]', 'admin@volta.com');
  await page.fill('input[placeholder="Mật khẩu"]', 'admin123');
  await page.click('button[type="submit"]');
  
  const response = await responsePromise;
  const status = response.status();
  const body = await response.json().catch(() => 'parse error');
  
  console.log('STATUS:', status);
  console.log('BODY:', JSON.stringify(body, null, 2));
  
  expect(status).toBe(200);
});
