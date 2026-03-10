# ARCHITECTURE.md — Kore System

> Documento vivo. Atualizar sempre que uma decisão arquitetural for tomada.
> Última atualização: Sprint 12

---

## 1. Visão Geral

Kore System é um SaaS de gestão financeira para MEI (Microempreendedor Individual) brasileiro.
Permite controle de receitas, despesas, clientes, contas a receber, histórico DAS, cotações e integrações com plataformas de pagamento (ex: Kirvano).

```
Browser → Next.js (App Router) → Supabase (Postgres + Auth + Realtime)
                               → Stripe (billing / planos)
                               → Kirvano (webhook de pagamentos)
```

---

## 2. Stack

| Camada | Tecnologia | Notas |
|--------|-----------|-------|
| Framework | Next.js 14+ (App Router) | `src/app/` |
| Linguagem | TypeScript | strict mode |
| Estilização | CSS Variables + Tailwind utilitários | `globals.css` é a fonte da verdade |
| Fontes | Sora (display) + DM Mono (números) | via `next/font/google` |
| Backend | Supabase (Postgres + Auth + Storage) | `@supabase/ssr` |
| Billing | Stripe | customer_id e subscription_id em `profiles` |
| Testes | Playwright (E2E) | `/tests` |
| Deploy | Vercel (inferido) | |

---

## 3. Estrutura de Pastas

```
/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # RootLayout — fontes, metadata
│   │   ├── globals.css             # Design tokens (CSS variables)
│   │   ├── page.tsx                # Landing / redirect
│   │   ├── login/
│   │   ├── assinar/                # Página de planos / checkout
│   │   ├── onboarding/
│   │   │   ├── page.tsx
│   │   │   └── OnboardingContent.tsx
│   │   └── app/                    # Área autenticada (requer plano_ativo)
│   │       ├── layout.tsx          # Shell: sidebar + topbar
│   │       ├── page.tsx            # Dashboard
│   │       ├── transacoes/
│   │       ├── clientes/
│   │       ├── receber/
│   │       ├── cotacoes/
│   │       ├── das/
│   │       ├── integracoes/
│   │       └── relatorios/
│   ├── lib/
│   │   ├── supabase.ts             # createBrowserClient (@supabase/ssr)
│   │   ├── notifications.ts        # Push notifications (Web Push API)
│   │   └── pdf.ts                  # Geração de PDF (jsPDF)
│   └── components/
│       ├── NotificationBell.tsx    # Sino de notificações no topbar
│       └── ...
├── middleware.ts                   # Auth guard + onboarding redirect
├── ARCHITECTURE.md                 # Este arquivo
├── tests/                          # Playwright E2E
└── public/
    └── kore-logo.png
```

---

## 4. Design System

Todas as cores, tipografia e espaçamentos vivem em `src/app/globals.css` como CSS variables.
**Nunca use valores hardcoded** — sempre use as variáveis.

### Tokens principais

```css
/* Backgrounds */
--bg: #060a12          /* página */
--bg2: #0d1220         /* sidebar */
--card: rgba(255,255,255,0.04)

/* Primária — azul */
--primary: #3b82f6
--primary2: #2563eb
--primary-dim: rgba(59,130,246,0.15)
--primary-border: rgba(59,130,246,0.25)

/* Semânticas */
--green: #10b981       /* lucro / positivo */
--red: #ef4444         /* despesa / negativo */
--amber: #f59e0b       /* alerta */

/* Texto */
--text: #f1f5f9
--text2: rgba(255,255,255,0.55)
--text3: rgba(255,255,255,0.3)

/* Tipografia */
--sans: 'Sora', sans-serif
--mono: 'DM Mono', monospace   /* sempre em valores numéricos */
```

### Regras de uso

- Valores monetários → `font-family: var(--mono)` sempre
- Receita → `color: var(--green)`
- Despesa → `color: var(--red)`
- Destaque / CTA → `var(--primary)`
- Cards → classe `.card` + variantes `.card-green`, `.card-blue`, `.card-red`, `.card-amber`

---

## 5. Autenticação e Autorização

### Fluxo de acesso

```
Request → middleware.ts
  ├── Rota pública (/login, /assinar, /onboarding, /api) → passa direto
  ├── Sem sessão → redirect /login
  ├── plano_ativo = false → redirect /assinar
  ├── onboarding_done = false → redirect /onboarding
  └── OK → acessa /app/*
```

### Padrão Supabase SSR (crítico)

- **Client components**: `import { supabase } from '@/lib/supabase'` — usa `createBrowserClient`
- **Server components / Route Handlers**: criar `createServerClient` localmente com cookies
- **Middleware**: `createServerClient` com padrão `setAll` (ver `middleware.ts`)
- **NÃO usar** `createClient` de `@supabase/supabase-js` — tokens ficam em localStorage e o middleware não enxerga

---

## 6. Banco de Dados (Supabase)

### Tabelas

| Tabela | Descrição |
|--------|-----------|
| `profiles` | Perfil do MEI — plano, onboarding, CNPJ, segmento |
| `transactions` | Receitas e despesas (type: `income` / `expense`) |
| `clients` | Clientes cadastrados |
| `receivables` | Contas a receber |
| `quotes` | Cotações / orçamentos |
| `das_history` | Histórico de pagamentos DAS |
| `integrations` | Integrações externas (Kirvano, etc.) |
| `pagamentos_kirvano` | Pagamentos recebidos via webhook Kirvano |

### Convenções

- Todas as tabelas têm `user_id uuid` com RLS (Row Level Security)
- Timestamps: `created_at` e `updated_at` como `timestamptz`
- `profiles.id` = `auth.users.id` (criado por trigger no signup)

### RLS (Row Level Security)

Todas as tabelas devem ter RLS ativo com política:
```sql
-- Leitura
CREATE POLICY "user_select" ON tabela
  FOR SELECT USING (auth.uid() = user_id);

-- Escrita
CREATE POLICY "user_insert" ON tabela
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

## 7. Módulos Funcionais

### Transactions
- `type`: `income` | `expense`
- `source`: origem da transação (manual, kirvano, banco)
- `is_personal`: separa gastos pessoais dos empresariais
- `category`: categoria livre

### DAS
- Calculado com base no faturamento mensal acumulado
- Limite MEI 2024: R$ 81.000/ano
- Alerta quando faturamento acumulado ultrapassa 80% do limite

### Cotações (Quotes)
- `items`: `jsonb` — array de `{ description, quantity, unit_price }`
- `status`: `draft` | `sent` | `accepted` | `rejected`
- Pode gerar PDF exportável

### Integrações
- `provider`: identificador único (ex: `kirvano`)
- `status`: `active` | `inactive` | `error`
- `metadata`: configurações específicas do provider em jsonb

---

## 8. Billing (Stripe)

- `profiles.plano`: `free` | `pro` | `enterprise`
- `profiles.plano_ativo`: boolean — controla acesso à área `/app`
- `profiles.stripe_customer_id`: vinculado ao Stripe Customer
- `profiles.stripe_subscription_id`: vinculado à Subscription ativa
- Webhook Stripe atualiza `plano_ativo` via API Route (`/api/webhooks/stripe`)

---

## 9. PDF Export

Geração client-side com `jsPDF` + `jspdf-autotable`.

**Relatórios disponíveis:**
- Extrato mensal (transactions filtradas por mês)
- Relatório de clientes (receita por cliente)
- Histórico DAS
- Cotação / orçamento (quotes)

Ver: `src/lib/pdf.ts` e `src/app/app/relatorios/PDFExport.tsx`

---

## 10. Push Notifications

Implementado via Web Push API (VAPID) + Supabase Realtime como fallback.

**Eventos notificados:**
- DAS vencendo (dia 20 do mês)
- Conta a receber vencendo (3 dias antes)
- Faturamento próximo ao limite MEI (80%)
- Novo pagamento recebido (Kirvano webhook)

Ver: `src/lib/notifications.ts` e `src/components/NotificationBell.tsx`

---

## 11. Decisões Técnicas

| Decisão | Motivo |
|---------|--------|
| `@supabase/ssr` em vez de `@supabase/supabase-js` direto | Tokens em cookies HTTP — middleware consegue ler a sessão |
| App Router (não Pages Router) | Server Components, layouts aninhados, melhor DX |
| CSS Variables em vez de Tailwind puro | Design tokens centralizados, tema consistente sem purge |
| `createBrowserClient` exportado como singleton | Evita múltiplas instâncias no cliente |
| PDF gerado client-side | Sem custo de servidor, funciona offline |
| Playwright para E2E | Testa fluxos reais de auth + Supabase |

---

## 12. Sprints

| Sprint | Entregues |
|--------|-----------|
| 1–11 | Auth, Dashboard, Transactions, Clients, Receivables, Quotes, DAS, Integrations (Kirvano), AI Chat, Sidebar/Topbar shell |
| **12** | Onboarding Wizard, PDF Export, Push Notifications, ARCHITECTURE.md |

---

## 13. Variáveis de Ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # apenas server-side
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_VAPID_PUBLIC_KEY=    # push notifications
VAPID_PRIVATE_KEY=               # push notifications (server only)
```