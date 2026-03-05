import { test, expect } from '@playwright/test';
import { loginUI, securitySniff } from './_helpers';

const RUN_STRIPE = process.env.RUN_STRIPE_E2E === '1';

test.describe('Stripe checkout (opcional)', () => {
  test.skip(!RUN_STRIPE, 'RUN_STRIPE_E2E=0 (teste de Stripe desativado)');

  test('Faz checkout Stripe com cartão de teste', async ({ page }) => {
    const done = await securitySniff(page);

    await loginUI(page);

    // vai para assinar
    await page.goto('/assinar', { waitUntil: 'networkidle' });

    // clique no botão que inicia o checkout (ajuste o texto se necessário)
    const btn = page.getByRole('button', { name: /iniciar|assinar|7 dias|grátis|checkout/i }).first();
    await expect(btn).toBeVisible({ timeout: 15000 });
    await btn.click();

    // Stripe abre em checkout.stripe.com
    await page.waitForURL(/checkout\.stripe\.com|\/onboarding|\/assinar/i, { timeout: 30000 });

    // Se entrou no Stripe, tenta preencher cartão de teste
    if (/checkout\.stripe\.com/.test(page.url())) {
      // Stripe Checkout costuma ter iframes para cartão
      // Este bloco é best-effort e pode variar. Funciona em muitos casos.

      // Preenche email se pedir (às vezes já vem preenchido)
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible().catch(() => false)) {
        await emailField.fill(process.env.E2E_EMAIL!);
      }

      // Cartão (4242)
      const cardNumber = page.frameLocator('iframe[name*="cardNumber"], iframe[title*="card number"]').locator('input[name="cardnumber"]');
      if (await cardNumber.isVisible().catch(() => false)) {
        await cardNumber.fill('4242424242424242');
      }

      const cardExpiry = page.frameLocator('iframe[name*="cardExpiry"], iframe[title*="expiration"]').locator('input[name="exp-date"]');
      if (await cardExpiry.isVisible().catch(() => false)) {
        await cardExpiry.fill('12/34');
      }

      const cardCvc = page.frameLocator('iframe[name*="cardCvc"], iframe[title*="security code"]').locator('input[name="cvc"]');
      if (await cardCvc.isVisible().catch(() => false)) {
        await cardCvc.fill('123');
      }

      // Confirmar
      const pay = page.getByRole('button', { name: /pagar|iniciar|assinar|começar|confirmar/i }).first();
      await pay.click();

      // voltar pro app / onboarding (depende do seu flow)
      await page.waitForURL(/localhost:3000\/onboarding|localhost:3000\/app|localhost:3000\/assinar/i, { timeout: 60000 });
    }

    await done();
  });
});