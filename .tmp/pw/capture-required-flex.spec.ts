import { mkdir } from 'node:fs/promises';
import { expect, test } from 'playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const OUT_DIR = process.env.OUT_DIR ?? 'artifacts/screenshots/flex';

test.use({
  browserName: 'chromium',
  channel: 'chrome',
  viewport: { width: 1512, height: 982 },
  ignoreHTTPSErrors: true,
});

test.setTimeout(300_000);

async function settle(page: import('playwright').Page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2200);
  const preloader = page.getByText('Preparing your stay experience...');
  if ((await preloader.count()) > 0) {
    await preloader.first().waitFor({ state: 'hidden', timeout: 18000 }).catch(() => undefined);
  }
  await page.waitForTimeout(900);
}

async function loginVendor(page: import('playwright').Page) {
  await page.goto(`${BASE}/login?role=vendor&next=/vendor`, {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });
  await settle(page);

  const email = page.locator('input[type="email"]').first();
  const password = page.locator('input[type="password"]').first();
  await email.fill('vendor01@demo.com');
  await password.fill('Password123!');

  await page.getByRole('button', { name: /sign in|login/i }).first().click();
  await page.waitForURL(/\/vendor(\?|$)/, { timeout: 45000 }).catch(() => undefined);
  await settle(page);
}

async function findPropertyCard(page: import('playwright').Page) {
  const preferred = page.locator('article.premium-card').first();
  if ((await preferred.count()) > 0) return preferred;

  const genericArticle = page.locator('main article').first();
  if ((await genericArticle.count()) > 0) return genericArticle;

  const gridItem = page.locator('main a[href^="/properties/"]').first();
  return gridItem;
}

test('capture required theme screenshots (flex)', async ({ page }) => {
  await mkdir(OUT_DIR, { recursive: true });

  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await settle(page);
  await page.screenshot({ path: `${OUT_DIR}/01-home-hero.png` });

  await page.goto(`${BASE}/properties`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await settle(page);

  const firstCard = await findPropertyCard(page);
  await expect(firstCard).toBeVisible({ timeout: 35000 });

  await firstCard.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);

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
