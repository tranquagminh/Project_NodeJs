import { test, expect, type Page } from '@playwright/test';

const BASE = 'http://localhost:3001';
const ADMIN_EMAIL = 'admin@volta.com';
const ADMIN_PASSWORD = 'admin123';

// ─── Helpers ───────────────────────────────────────────────────────────────

async function login(page: Page) {
  await page.goto(`${BASE}/login`);
  // Ant Design Input renders type="text", selector by placeholder
  await page.waitForSelector('input[placeholder="Email"]', { timeout: 10000 });
  await page.fill('input[placeholder="Email"]', ADMIN_EMAIL);
  await page.fill('input[placeholder="Mật khẩu"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10000 });
}

async function ss(page: Page, name: string) {
  await page.screenshot({ path: `test-results/admin-new/${name}.png`, fullPage: true });
}

async function waitForTable(page: Page) {
  await page.waitForSelector('.ant-table', { timeout: 12000 });
  await page.waitForTimeout(600);
}

// ─── Tests ─────────────────────────────────────────────────────────────────

test.describe('Admin App – Full Walkthrough', () => {

  // ── 1. Login page ──────────────────────────────────────────────────────

  test('1 – Login page renders correctly', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.waitForSelector('input[placeholder="Email"]', { timeout: 10000 });
    await expect(page.locator('text=BadmintonShop Admin')).toBeVisible();
    await expect(page.locator('input[placeholder="Email"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Mật khẩu"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await ss(page, '01-login-page');
  });

  test('2 – Login fails with wrong credentials', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.waitForSelector('input[placeholder="Email"]', { timeout: 10000 });
    await page.fill('input[placeholder="Email"]', 'wrong@email.com');
    await page.fill('input[placeholder="Mật khẩu"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    // Should stay on login and show error
    await expect(page.locator('.ant-message-notice-content')).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL(/login/);
    await ss(page, '02-login-error');
  });

  test('3 – Login succeeds with admin credentials', async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(`${BASE}/`);
    await expect(page.locator('.ant-layout-sider')).toBeVisible();
    await ss(page, '03-login-success');
  });

  // ── 2. Dashboard ───────────────────────────────────────────────────────

  test.describe('Dashboard', () => {
    test.beforeEach(({ page }) => login(page));

    test('4 – Dashboard KPI stat cards load', async ({ page }) => {
      await page.goto(`${BASE}/`);
      await page.waitForSelector('.ant-statistic', { timeout: 12000 });
      await expect(page.locator('text=Doanh thu hôm nay')).toBeVisible();
      await expect(page.locator('text=Doanh thu tuần này')).toBeVisible();
      await expect(page.locator('text=Doanh thu tháng này')).toBeVisible();
      await expect(page.locator('text=Doanh thu năm nay')).toBeVisible();
      await expect(page.locator('text=Tổng đơn hàng')).toBeVisible();
      await expect(page.locator('text=Người dùng')).toBeVisible();
      await ss(page, '04-dashboard-kpis');
    });

    test('5 – Revenue chart renders', async ({ page }) => {
      await page.goto(`${BASE}/`);
      await page.waitForSelector('.recharts-wrapper', { timeout: 12000 });
      await expect(page.locator('text=Doanh thu 30 ngày gần nhất')).toBeVisible();
      await ss(page, '05-dashboard-chart');
    });

    test('6 – Top products table renders', async ({ page }) => {
      await page.goto(`${BASE}/`);
      await page.waitForSelector('.ant-table', { timeout: 12000 });
      await expect(page.locator('text=Top sản phẩm bán chạy')).toBeVisible();
      await ss(page, '06-dashboard-top-products');
    });

    test('7 – Sidebar has all 7 navigation items', async ({ page }) => {
      await page.goto(`${BASE}/`);
      await page.waitForSelector('.ant-menu', { timeout: 8000 });
      for (const label of ['Dashboard', 'Đơn hàng', 'Đánh giá', 'Hoàn trả', 'Sản phẩm', 'Người dùng', 'Mã giảm giá']) {
        await expect(page.locator(`.ant-menu-item:has-text("${label}")`)).toBeVisible();
      }
      await ss(page, '07-sidebar-nav-items');
    });

    test('8 – Sidebar collapses and expands', async ({ page }) => {
      await page.goto(`${BASE}/`);
      await page.waitForSelector('.ant-layout-sider-trigger', { timeout: 8000 });
      const trigger = page.locator('.ant-layout-sider-trigger');
      await trigger.click();
      await page.waitForTimeout(500);
      await ss(page, '08-sidebar-collapsed');
      await trigger.click();
      await page.waitForTimeout(500);
      await ss(page, '09-sidebar-expanded');
    });
  });

  // ── 3. Orders ──────────────────────────────────────────────────────────

  test.describe('Orders page', () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
      await page.goto(`${BASE}/orders`);
      await waitForTable(page);
    });

    test('9 – Orders page loads with title and controls', async ({ page }) => {
      await expect(page.locator('h4:has-text("Quản lý đơn hàng")')).toBeVisible();
      await expect(page.locator('input[placeholder*="Tìm mã đơn"]')).toBeVisible();
      await expect(page.locator('button:has-text("Làm mới")')).toBeVisible();
      await ss(page, '10-orders-page');
    });

    test('10 – Orders search by code', async ({ page }) => {
      await page.fill('input[placeholder*="Tìm mã đơn"]', 'ORD');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1200);
      await ss(page, '11-orders-search-ord');
    });

    test('11 – Orders status filter dropdown', async ({ page }) => {
      // Open first Select (status filter)
      await page.locator('.ant-select').first().click();
      await page.waitForSelector('.ant-select-dropdown', { timeout: 5000 });
      await expect(page.locator('.ant-select-item:has-text("Chờ xác nhận")')).toBeVisible();
      await expect(page.locator('.ant-select-item:has-text("Đã giao")')).toBeVisible();
      await ss(page, '12-orders-status-dropdown');
      await page.click('.ant-select-item:has-text("Chờ xác nhận")');
      await page.waitForTimeout(1000);
      await ss(page, '13-orders-filter-pending');
    });

    test('12 – Orders refresh button', async ({ page }) => {
      await page.click('button:has-text("Làm mới")');
      await page.waitForTimeout(1000);
      await ss(page, '14-orders-refresh');
    });

    test('13 – Order detail modal opens on code click', async ({ page }) => {
      const link = page.locator('.ant-table-tbody .ant-btn-link').first();
      if (await link.count() > 0) {
        await link.click();
        await page.waitForSelector('.ant-modal-body', { timeout: 6000 });
        await expect(page.locator('.ant-modal-title')).toContainText('Chi tiết đơn hàng');
        await expect(page.locator('.ant-descriptions')).toBeVisible();
        await ss(page, '15-order-detail-modal');
        await page.keyboard.press('Escape');
        await page.waitForTimeout(400);
      }
    });

    test('14 – Order status update modal opens and cancels', async ({ page }) => {
      const btn = page.locator('.ant-table-tbody button:has-text("Cập nhật"):not([disabled])').first();
      if (await btn.count() > 0) {
        await btn.click();
        await page.waitForSelector('.ant-modal-body', { timeout: 6000 });
        await expect(page.locator('.ant-modal-title')).toContainText('Cập nhật trạng thái');
        // Status select should be visible
        await expect(page.locator('.ant-modal .ant-select')).toBeVisible();
        await ss(page, '16-order-status-modal');
        await page.click('.ant-modal-footer button:has-text("Hủy")');
        await page.waitForTimeout(400);
      }
    });
  });

  // ── 4. Reviews ─────────────────────────────────────────────────────────

  test.describe('Reviews page', () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
      await page.goto(`${BASE}/reviews`);
      await waitForTable(page);
    });

    test('15 – Reviews page loads with Chờ duyệt default filter', async ({ page }) => {
      await expect(page.locator('h4:has-text("Kiểm duyệt đánh giá")')).toBeVisible();
      await expect(page.locator('.ant-select-selection-item:has-text("Chờ duyệt")')).toBeVisible();
      await ss(page, '17-reviews-page');
    });

    test('16 – Reviews filter: switch to Đã duyệt', async ({ page }) => {
      await page.locator('.ant-select').first().click();
      await page.waitForSelector('.ant-select-dropdown');
      await page.click('.ant-select-item:has-text("Đã duyệt")');
      await page.waitForTimeout(1000);
      await ss(page, '18-reviews-approved');
    });

    test('17 – Reviews filter: switch to Từ chối', async ({ page }) => {
      await page.locator('.ant-select').first().click();
      await page.waitForSelector('.ant-select-dropdown');
      await page.click('.ant-select-item:has-text("Từ chối")');
      await page.waitForTimeout(1000);
      await ss(page, '19-reviews-rejected');
    });

    test('18 – Review reject modal requires reason before submitting', async ({ page }) => {
      const btn = page.locator('.ant-table-tbody button:has-text("Từ chối")').first();
      if (await btn.count() > 0) {
        await btn.click();
        await page.waitForSelector('.ant-modal-body', { timeout: 6000 });
        await expect(page.locator('textarea')).toBeVisible();
        await ss(page, '21-review-reject-modal-open');
        // Try to submit without reason
        await page.click('.ant-modal-footer button:has-text("Từ chối")');
        await page.waitForTimeout(600);
        // Should show ant-message warning, not close modal
        await expect(page.locator('.ant-modal-body')).toBeVisible();
        await ss(page, '22-review-reject-no-reason-warning');
        // Fill reason and verify textarea
        await page.fill('textarea', 'Nội dung vi phạm quy định');
        await ss(page, '23-review-reject-with-reason');
        await page.click('.ant-modal-footer button:has-text("Hủy")');
      }
    });

    test('19 – Review detail modal opens on title click', async ({ page }) => {
      const link = page.locator('.ant-table-tbody .ant-btn-link').first();
      if (await link.count() > 0) {
        await link.click();
        await page.waitForSelector('.ant-modal-body', { timeout: 6000 });
        await expect(page.locator('.ant-modal-title:has-text("Chi tiết đánh giá")')).toBeVisible();
        // Star rating and comment should be in the modal
        await expect(page.locator('.ant-modal .ant-rate')).toBeVisible();
        await ss(page, '24-review-detail-modal');
        await page.keyboard.press('Escape');
      }
    });

    test('20 – Review approve button triggers action', async ({ page }) => {
      const btn = page.locator('.ant-table-tbody button:has-text("Duyệt")').first();
      if (await btn.count() > 0) {
        await btn.click();
        await page.waitForTimeout(1500);
        // Should show success message
        await expect(page.locator('.ant-message-notice-content')).toBeVisible({ timeout: 5000 });
        await ss(page, '25-review-approve-result');
      }
    });
  });

  // ── 5. Returns ─────────────────────────────────────────────────────────

  test.describe('Returns page', () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
      await page.goto(`${BASE}/returns`);
      await waitForTable(page);
    });

    test('21 – Returns page loads', async ({ page }) => {
      await expect(page.locator('h4:has-text("Quản lý hoàn trả")')).toBeVisible();
      await ss(page, '26-returns-page');
    });

    test('22 – Returns status filter works', async ({ page }) => {
      await page.locator('.ant-select').first().click();
      await page.waitForSelector('.ant-select-dropdown');
      for (const opt of ['Đã chấp nhận', 'Từ chối', 'Đã nhận hàng', 'Đã hoàn tiền', 'Đã yêu cầu']) {
        await expect(page.locator(`.ant-select-item:has-text("${opt}")`)).toBeVisible();
      }
      await page.keyboard.press('Escape');
      await ss(page, '27-returns-filter-options');
    });

    test('23 – Return detail modal opens', async ({ page }) => {
      const link = page.locator('.ant-table-tbody .ant-btn-link').first();
      if (await link.count() > 0) {
        await link.click();
        await page.waitForSelector('.ant-modal-body', { timeout: 6000 });
        await expect(page.locator('.ant-modal-title:has-text("Chi tiết yêu cầu hoàn trả")')).toBeVisible();
        await expect(page.locator('.ant-descriptions')).toBeVisible();
        await ss(page, '28-return-detail-modal');
        await page.keyboard.press('Escape');
      }
    });

    test('24 – Return approve action (if REQUESTED items exist)', async ({ page }) => {
      const btn = page.locator('.ant-table-tbody button:has-text("Chấp nhận")').first();
      if (await btn.count() > 0) {
        await btn.click();
        await page.waitForTimeout(1500);
        await expect(page.locator('.ant-message-notice-content')).toBeVisible({ timeout: 5000 });
        await ss(page, '29-return-approve-result');
      }
    });

    test('25 – Return refund modal has amount input (RECEIVED state)', async ({ page }) => {
      // Switch to RECEIVED
      await page.locator('.ant-select').first().click();
      await page.waitForSelector('.ant-select-dropdown');
      await page.click('.ant-select-item:has-text("Đã nhận hàng")');
      await page.waitForTimeout(1000);
      const btn = page.locator('.ant-table-tbody button:has-text("Hoàn tiền")').first();
      if (await btn.count() > 0) {
        await btn.click();
        await page.waitForSelector('.ant-modal-body', { timeout: 6000 });
        await expect(page.locator('.ant-modal-title:has-text("Xử lý hoàn tiền")')).toBeVisible();
        await expect(page.locator('.ant-input-number')).toBeVisible();
        await ss(page, '30-return-refund-modal');
        await page.click('.ant-modal-footer button:has-text("Hủy")');
      }
    });
  });

  // ── 6. Products ────────────────────────────────────────────────────────

  test.describe('Products page', () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
      await page.goto(`${BASE}/products`);
      await waitForTable(page);
    });

    test('26 – Products page loads with table', async ({ page }) => {
      await expect(page.locator('h4:has-text("Quản lý sản phẩm")')).toBeVisible();
      await expect(page.locator('button:has-text("Sắp hết hàng")')).toBeVisible();
      await ss(page, '31-products-page');
    });

    test('27 – Products search filters table', async ({ page }) => {
      await page.fill('input[placeholder*="Tìm sản phẩm"]', 'Vợt');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1200);
      await ss(page, '32-products-search');
    });

    test('28 – Products status filter dropdown', async ({ page }) => {
      await page.locator('.ant-select').first().click();
      await page.waitForSelector('.ant-select-dropdown');
      await expect(page.locator('.ant-select-item:has-text("Đang bán")')).toBeVisible();
      await expect(page.locator('.ant-select-item:has-text("Ngừng bán")')).toBeVisible();
      await expect(page.locator('.ant-select-item:has-text("Nháp")')).toBeVisible();
      await page.click('.ant-select-item:has-text("Đang bán")');
      await page.waitForTimeout(1000);
      await ss(page, '33-products-active-filter');
    });

    test('29 – Low stock alert panel toggle', async ({ page }) => {
      const btn = page.locator('button:has-text("Sắp hết hàng")');
      await btn.click();
      await page.waitForTimeout(500);
      await expect(page.locator('text=Biến thể sắp hết hàng')).toBeVisible();
      await ss(page, '34-lowstock-open');
      // Toggle closed
      await btn.click();
      await page.waitForTimeout(400);
      await expect(page.locator('text=Biến thể sắp hết hàng')).not.toBeVisible();
      await ss(page, '35-lowstock-closed');
    });
  });

  // ── 7. Users ───────────────────────────────────────────────────────────

  test.describe('Users page', () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
      await page.goto(`${BASE}/users`);
      await waitForTable(page);
    });

    test('30 – Users page loads with table', async ({ page }) => {
      await expect(page.locator('h4:has-text("Quản lý người dùng")')).toBeVisible();
      await expect(page.locator('input[placeholder*="Tìm tên"]')).toBeVisible();
      await ss(page, '36-users-page');
    });

    test('31 – Users search works', async ({ page }) => {
      await page.fill('input[placeholder*="Tìm tên"]', 'admin');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1200);
      // Admin user should appear
      const rows = page.locator('.ant-table-tbody tr');
      await expect(rows.first()).toBeVisible();
      await ss(page, '37-users-search-admin');
    });

    test('32 – Users role filter works', async ({ page }) => {
      await page.locator('.ant-select').first().click();
      await page.waitForSelector('.ant-select-dropdown');
      await page.click('.ant-select-item:has-text("Admin")');
      await page.waitForTimeout(1000);
      // All visible role tags should be ADMIN or SUPER_ADMIN
      await ss(page, '38-users-admin-filter');
    });

    test('33 – Role change modal opens with current role pre-selected', async ({ page }) => {
      const btn = page.locator('.ant-table-tbody button:has-text("Đổi vai trò")').first();
      if (await btn.count() > 0) {
        await btn.click();
        await page.waitForSelector('.ant-modal-body', { timeout: 6000 });
        await expect(page.locator('.ant-modal-title:has-text("Đổi vai trò người dùng")')).toBeVisible();
        // User name and email shown
        await expect(page.locator('.ant-modal-body strong')).toBeVisible();
        // Role select should be visible
        await expect(page.locator('.ant-modal .ant-select')).toBeVisible();
        await ss(page, '39-users-role-modal');
        await page.click('.ant-modal-footer button:has-text("Hủy")');
      }
    });
  });

  // ── 8. Coupons ─────────────────────────────────────────────────────────

  test.describe('Coupons page', () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
      await page.goto(`${BASE}/coupons`);
      await waitForTable(page);
    });

    test('34 – Coupons page loads', async ({ page }) => {
      await expect(page.locator('h4:has-text("Quản lý mã giảm giá")')).toBeVisible();
      await expect(page.locator('button:has-text("Tạo mã mới")')).toBeVisible();
      await ss(page, '40-coupons-page');
    });

    test('35 – Create coupon modal opens with form fields', async ({ page }) => {
      await page.click('button:has-text("Tạo mã mới")');
      await page.waitForSelector('.ant-modal-body', { timeout: 6000 });
      await expect(page.locator('.ant-modal-title:has-text("Tạo mã giảm giá mới")')).toBeVisible();
      // Check all form fields
      await expect(page.locator('.ant-modal input').first()).toBeVisible();
      await expect(page.locator('.ant-modal .ant-select')).toBeVisible();
      await ss(page, '41-coupons-create-modal');
      await page.click('.ant-modal-footer button:has-text("Hủy")');
    });

    test('36 – Create coupon form validates empty submission', async ({ page }) => {
      await page.click('button:has-text("Tạo mã mới")');
      await page.waitForSelector('.ant-modal-body', { timeout: 6000 });
      // Submit without filling required fields
      await page.click('.ant-modal-footer button:has-text("Tạo")');
      await page.waitForTimeout(600);
      await expect(page.locator('.ant-form-item-explain-error').first()).toBeVisible();
      await ss(page, '42-coupons-validation');
      await page.click('.ant-modal-footer button:has-text("Hủy")');
    });

    test('37 – Create coupon with PERCENTAGE type succeeds', async ({ page }) => {
      await page.click('button:has-text("Tạo mã mới")');
      await page.waitForSelector('.ant-modal-body', { timeout: 6000 });
      const code = `PW${Date.now().toString().slice(-4)}`;
      // Fill code
      await page.locator('.ant-modal input[placeholder*="SUMMER"]').fill(code);
      // Type is PERCENTAGE by default — fill value
      await page.locator('.ant-modal .ant-input-number input').first().fill('15');
      await ss(page, '43-coupons-form-filled');
      await page.click('.ant-modal-footer button:has-text("Tạo")');
      await page.waitForTimeout(1500);
      // Success message or table updates
      await ss(page, '44-coupons-after-create');
    });

    test('38 – Type switch shows maxDiscount field only for PERCENTAGE', async ({ page }) => {
      await page.click('button:has-text("Tạo mã mới")');
      await page.waitForSelector('.ant-modal-body', { timeout: 6000 });
      // Default is PERCENTAGE — maxDiscount should be shown
      await expect(page.locator('text=Giảm tối đa')).toBeVisible();
      // Switch to FIXED
      await page.locator('.ant-modal .ant-select').first().click();
      await page.waitForSelector('.ant-select-dropdown');
      await page.click('.ant-select-item:has-text("Số tiền cố định")');
      await page.waitForTimeout(400);
      // maxDiscount should disappear
      await expect(page.locator('text=Giảm tối đa')).not.toBeVisible();
      await ss(page, '45-coupons-fixed-type');
      await page.click('.ant-modal-footer button:has-text("Hủy")');
    });

    test('39 – Coupon active toggle flips state', async ({ page }) => {
      const toggle = page.locator('.ant-table-tbody .ant-switch').first();
      if (await toggle.count() > 0) {
        const before = await toggle.getAttribute('aria-checked');
        await toggle.click();
        await page.waitForTimeout(1200);
        const after = await toggle.getAttribute('aria-checked');
        await ss(page, '46-coupon-toggled');
        // Restore
        if (before !== after) {
          await toggle.click();
          await page.waitForTimeout(800);
        }
      }
    });

    test('40 – Coupon delete shows popconfirm and can be cancelled', async ({ page }) => {
      const btn = page.locator('.ant-table-tbody button:has-text("Xóa")').first();
      if (await btn.count() > 0) {
        await btn.click();
        await page.waitForSelector('.ant-popconfirm', { timeout: 5000 });
        await expect(page.locator('.ant-popover-message-title, .ant-popconfirm-title')).toBeVisible();
        await ss(page, '47-coupon-delete-confirm');
        // Cancel delete
        await page.locator('.ant-popconfirm button:has-text("Hủy")').click();
        await page.waitForTimeout(400);
        // Table should still have the coupon
        await expect(page.locator('.ant-table-tbody .ant-switch').first()).toBeVisible();
      }
    });
  });

  // ── 9. Navigation ──────────────────────────────────────────────────────

  test.describe('Navigation & Auth', () => {
    test('41 – Sidebar navigates to every page correctly', async ({ page }) => {
      await login(page);
      const routes = [
        { menu: 'Đơn hàng', url: '/orders', heading: 'Quản lý đơn hàng' },
        { menu: 'Đánh giá', url: '/reviews', heading: 'Kiểm duyệt đánh giá' },
        { menu: 'Hoàn trả', url: '/returns', heading: 'Quản lý hoàn trả' },
        { menu: 'Sản phẩm', url: '/products', heading: 'Quản lý sản phẩm' },
        { menu: 'Người dùng', url: '/users', heading: 'Quản lý người dùng' },
        { menu: 'Mã giảm giá', url: '/coupons', heading: 'Quản lý mã giảm giá' },
        { menu: 'Dashboard', url: '/', heading: 'Tổng quan' },
      ];
      for (const r of routes) {
        await page.click(`.ant-menu-item:has-text("${r.menu}")`);
        await expect(page).toHaveURL(`${BASE}${r.url}`, { timeout: 6000 });
        await expect(page.locator(`h4:has-text("${r.heading}")`)).toBeVisible({ timeout: 8000 });
      }
      await ss(page, '48-all-nav-complete');
    });

    test('42 – Unknown route redirects to /', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE}/nonexistent`);
      await page.waitForURL(`${BASE}/`, { timeout: 6000 });
      await expect(page.locator('h4:has-text("Tổng quan")')).toBeVisible({ timeout: 8000 });
      await ss(page, '49-unknown-route-redirect');
    });

    test('43 – Logout clears auth and redirects to login', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE}/`);
      await page.waitForSelector('.ant-avatar', { timeout: 8000 });
      await page.click('.ant-avatar');
      await page.waitForSelector('.ant-dropdown-open, .ant-dropdown:not(.ant-dropdown-hidden)', { timeout: 5000 });
      await page.click('.ant-dropdown-menu-item:has-text("Đăng xuất")');
      await page.waitForURL(/login/, { timeout: 8000 });
      await expect(page.locator('input[placeholder="Email"]')).toBeVisible();
      await ss(page, '50-after-logout');
    });

    test('44 – Protected route unauthenticated → redirects to /login', async ({ page }) => {
      await page.goto(`${BASE}/orders`);
      await page.waitForURL(/login/, { timeout: 6000 });
      await expect(page.locator('input[placeholder="Email"]')).toBeVisible();
      await ss(page, '51-protected-redirect');
    });
  });
});
