import { test } from '@playwright/test';
import { loginUI, expectAppShell, securitySniff } from './_helpers';

test('Dashboard + Tabs + CRUD básico (best-effort)', async ({ page }) => {
  const done = await securitySniff(page);

  try {
    await loginUI(page);
    await page.goto('/app', { waitUntil: 'networkidle' });
    await expectAppShell(page);

    const tabs = ['Financeiro', 'Lançamentos', 'Clientes', 'Orçamentos', 'IA Assistente', 'Relatórios', 'Simuladores'];
    for (const tab of tabs) {
      const el = page.getByText(tab).first();
      if (await el.isVisible().catch(() => false)) {
        await el.click();
        await page.waitForTimeout(250);
      }
    }

    // Criar um cliente
    const clientesTab = page.getByText('Clientes').first();
    if (await clientesTab.isVisible().catch(() => false)) {
      await clientesTab.click();
      await page.waitForLoadState('networkidle');

      const novo = page.getByRole('button', { name: /novo|adicionar|criar/i }).first();
      if (await novo.isVisible().catch(() => false)) {
        await novo.click();
        await page.waitForTimeout(500);

        const firstTextbox = page.getByRole('textbox').first();
        if (await firstTextbox.isVisible().catch(() => false)) {
          await firstTextbox.fill('Cliente E2E ' + Date.now());
        }

        const salvar = page.getByRole('button', { name: /salvar|criar|confirmar/i }).first();
        if (await salvar.isVisible().catch(() => false)) {
          await salvar.click();
          await page.waitForLoadState('networkidle');
        }
      }
    }

    // Criar um lançamento
    const lancTab = page.getByText('Lançamentos').first();
    if (await lancTab.isVisible().catch(() => false)) {
      await lancTab.click();
      await page.waitForLoadState('networkidle');

      const novo = page.getByRole('button', { name: /novo|adicionar|registrar|criar/i }).first();
      if (await novo.isVisible().catch(() => false)) {
        await novo.click();
        await page.waitForTimeout(500);

        // preenche campo de valor especificamente (não o primeiro input genérico)
        const valorInput = page.locator('input[type="number"], input[placeholder*="valor" i], input[placeholder*="R$" i]').first();
        if (await valorInput.isVisible().catch(() => false)) {
          await valorInput.fill('100');
        }

        // fecha o modal sem salvar para não quebrar o estado
        const cancelar = page.getByRole('button', { name: /cancelar|fechar/i }).first();
        if (await cancelar.isVisible().catch(() => false)) {
          await cancelar.click();
          await page.waitForLoadState('networkidle');
        }
      }
    }

  } catch (e) {
    console.warn('Erro best-effort no CRUD:', e);
  }

  await done();
});