import { test } from 'playwright/test';

test.use({
  browserName: 'chromium',
  channel: 'chrome',
  viewport: { width: 1512, height: 982 },
});

test('home screenshot smoke', async ({ page }) => {
  await page.goto('http://localhost:3100/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: '/tmp/home-smoke.png', fullPage: false });
});
