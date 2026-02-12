import { mkdir } from 'node:fs/promises';
import { expect, test } from 'playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const OUT_DIR = process.env.OUT_DIR ?? 'artifacts/screenshots/after';

test.use({
  browserName: 'chromium',
  channel: 'chrome',
  viewport: { width: 1512, height: 982 },
  ignoreHTTPSErrors: true,
});

test.setTimeout(240_000);

async function settle(page: import('playwright').Page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  const preloader = page.getByText('Preparing your stay experience...');
  if ((await preloader.count()) > 0) {
    await preloader.first().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => undefined);
  }

  await page.waitForTimeout(900);
}

async function loginVendor(page: import('playwright').Page) {
  await page.goto(`${BASE}/login?role=vendor&next=/vendor`, {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });
  await settle(page);

  await page.locator('input[placeholder="you@example.com"]').fill('vendor01@demo.com');
  await page.locator('input[placeholder="••••••••"]').fill('Password123!');

  await Promise.all([
    page.waitForURL(/\/vendor(\?|$)/, { timeout: 45000 }),
    page.getByRole('button', { name: 'Sign in' }).click(),
  ]);

  await settle(page);
}

test('capture required theme screenshots', async ({ page }) => {
  await mkdir(OUT_DIR, { recursive: true });

  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await settle(page);
  await page.screenshot({ path: `${OUT_DIR}/01-home-hero.png` });

  await page.goto(`${BASE}/properties`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await settle(page);

  const firstCard = page.locator('article.premium-card').first();
  await expect(firstCard).toBeVisible({ timeout: 30000 });

  await firstCard.scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);

  await page.screenshot({ path: `${OUT_DIR}/02-properties-grid.png` });
  await firstCard.screenshot({ path: `${OUT_DIR}/03-property-card-closeup.png` });

  await page.goto(`${BASE}/login?role=vendor`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await settle(page);
  await page.screenshot({ path: `${OUT_DIR}/04-login.png` });

  await loginVendor(page);
  await page.screenshot({ path: `${OUT_DIR}/05-portal-dashboard-sidebar.png` });

  await page.goto(`${BASE}/vendor/bookings`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await settle(page);
  await page.screenshot({ path: `${OUT_DIR}/06-portal-table-page.png` });
});
