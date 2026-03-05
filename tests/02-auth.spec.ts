import { test, expect } from '@playwright/test';
import { loginUI, securitySniff } from './_helpers';

test('Rota /app exige login e depois libera', async ({ page }) => {
  const done = await securitySniff(page);

  await page.goto('/app', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/login/i);

  await loginUI(page);

  await page.goto('/app', { waitUntil: 'networkidle' });
  await expect(page).toHaveURL(/\/app/i);

  await done();
});