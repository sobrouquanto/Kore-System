import { test, expect } from '@playwright/test';
import { securitySniff } from './_helpers';

test('Landing carrega', async ({ page }) => {
  const done = await securitySniff(page);

  await page.goto('/', { waitUntil: 'networkidle' });

  // valida algo que sempre existe na landing (ajuste se a landing não tiver isso)
  await expect(page.locator('text=MEI 360 OS').first()).toBeVisible({ timeout: 15000 });

  await done();
});