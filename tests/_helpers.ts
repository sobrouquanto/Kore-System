import { expect, Page } from '@playwright/test';

const SECRET_PATTERNS: Array<{ name: string; re: RegExp }> = [
  { name: 'Stripe LIVE secret', re: /\bsk_live_[0-9a-zA-Z]{10,}\b/g },
  { name: 'Stripe TEST secret', re: /\bsk_test_[0-9a-zA-Z]{10,}\b/g },
  { name: 'Stripe webhook secret', re: /\bwhsec_[0-9a-zA-Z]{10,}\b/g },
  // tokens tipo JWT (inclui service_role real se vazar)
  { name: 'JWT-like token', re: /\beyJ[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+\b/g },
  // palavras perigosas (só pra sinalizar, mas não falha sozinha)
  { name: 'Suspicious keyword', re: /\b(SUPABASE_SERVICE_ROLE_KEY|service_role|OPENAI_API_KEY|STRIPE_SECRET_KEY)\b/gi },
];

function normalize(s: string) {
  return (s ?? '').toString().slice(0, 200_000);
}

function findSecrets(text: string) {
  const t = normalize(text);
  const out: Array<{ type: string; value: string }> = [];
  for (const p of SECRET_PATTERNS) {
    const matches = t.match(p.re) ?? [];
    for (const m of matches.slice(0, 10)) out.push({ type: p.name, value: m });
  }
  return out;
}

export async function loginUI(page: Page) {
  const email = process.env.E2E_EMAIL || '';
  const password = process.env.E2E_PASSWORD || '';
  if (!email || !password) {
    throw new Error('Defina E2E_EMAIL e E2E_PASSWORD no .env.e2e');
  }

  await page.goto('/login');
  await page.waitForSelector('input[placeholder="seu@email.com"]', { state: 'visible' });
  await page.locator('input[placeholder="seu@email.com"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('button', { name: 'Entrar no sistema' }).click();
  await page.waitForURL('**/app**', { timeout: 15000 });

// espera o app carregar primeiro
await page.waitForLoadState('networkidle');

// Fecha modal de DAS se aparecer (após app carregar)
try {
  await page.waitForLoadState('networkidle');
  const modal = page.locator('text=O DAS deste mês já foi registrado');
  await modal.waitFor({ state: 'visible', timeout: 4000 });
  await page.locator('text=Cancelar').click();
  await page.waitForLoadState('networkidle');
} catch {
  // modal não apareceu, tudo bem
}

  // confirma que saiu do login (se ficou, falha com print)
  if (/\/login/i.test(page.url())) {
    await page.screenshot({ path: 'playwright-login-failed.png', fullPage: true });
    throw new Error(
      'Login não saiu de /login. Veja playwright-login-failed.png. ' +
      'Confirme E2E_EMAIL/E2E_PASSWORD e se a conta existe no Supabase Auth.'
    );
  }
}

export async function expectAppShell(page: Page) {
  await expect(page).toHaveURL(/\/app/i, { timeout: 150000 });

  const sidebar = page.locator('aside, nav').first();
  await expect(sidebar).toBeVisible({ timeout: 150000 });

  const menuAny = page
    .getByText(/Financeiro|Lançamentos|Clientes|Orçamentos|IA Assistente|Relatórios|Simuladores/i)
    .first();

  await expect(menuAny).toBeVisible({ timeout: 150000 });
}

// Captura Console + (Network só /api) + HTML e falha se achar token de verdade
export async function securitySniff(page: Page) {
  const consoleLogs: string[] = [];
  const apiBodies: string[] = [];
  const pageErrors: string[] = [];

  page.on('console', (msg) => consoleLogs.push(msg.text()));
  page.on('pageerror', (err) => pageErrors.push(err.message));

  page.on('response', async (res) => {
    const url = res.url();
    if (!url.includes('/api/')) return;

    const ct = res.headers()['content-type'] || '';
    if (!/(application\/json|text\/|application\/javascript)/i.test(ct)) return;

    try {
      const body = await res.text();
      apiBodies.push(normalize(body).slice(0, 50_000));
    } catch {}
  });

  return async function finalize() {
    if (pageErrors.length) {
      throw new Error('Erros JS (pageerror):\n' + pageErrors.join('\n'));
    }

    const html = await page.content();

    const findings = [
      ...findSecrets(html),
      ...findSecrets(consoleLogs.join('\n')),
      ...findSecrets(apiBodies.join('\n')),
    ];

    // Regra: falha apenas se achar coisas realmente perigosas (sk_/whsec_/JWT)
    const dangerous = findings.filter(f =>
      ['Stripe LIVE secret', 'Stripe TEST secret', 'Stripe webhook secret', 'JWT-like token'].includes(f.type)
    );

    if (dangerous.length) {
      throw new Error('Possível vazamento de segredo:\n' + JSON.stringify(dangerous, null, 2));
    }
  };
}