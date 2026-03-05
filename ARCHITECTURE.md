# MEI 360 OS — Architecture Documentation

> Last updated: Sprint 1 refactor  
> Stack: Next.js 16 · React 19 · TypeScript 5 · Supabase · Stripe · Pluggy · OpenAI

---

## Directory Structure

```
src/
├── app/
│   ├── page.tsx                  → Landing page (/)
│   ├── login/page.tsx            → Auth (login + signup)
│   ├── assinar/page.tsx          → Stripe checkout (7-day trial)
│   ├── onboarding/page.tsx       → 3-step onboarding
│   └── app/
│       ├── page.tsx              → Dashboard entry point (DashboardProvider)
│       ├── DashboardLayout.tsx   → Shell: sidebar + topbar + confirm modal
│       ├── tabs/                 → One file per tab (lazy-loaded)
│       │   ├── CockpitTab.tsx
│       │   ├── FinanceiroTab.tsx
│       │   ├── LancamentosTab.tsx
│       │   ├── ClientesTab.tsx
│       │   ├── OrcamentosTab.tsx
│       │   ├── IATab.tsx
│       │   ├── RelatoriosTab.tsx
│       │   ├── SimuladoresTab.tsx
│       │   ├── IntegracoesTab.tsx
│       │   └── ConfiguracoesTab.tsx
│       └── components/
│           └── ui.tsx            → Shared UI primitives
│
├── context/
│   └── DashboardContext.tsx      → Global state + all data actions
│
├── styles/
│   └── dashboard.css             → Design system CSS
│
├── lib/
│   └── supabase.ts               → Supabase browser client
│
└── middleware.ts                 → Server-side auth guard
```

---

## State Architecture

### Before (Sprint 0 — God Component)
```
app.app.page.tsx  (~2500 lines)
└── 40+ useState hooks
└── All business logic inlined
└── No code splitting
└── Client-side auth guards only
```

### After (Sprint 1)
```
DashboardContext  (single source of truth)
├── User / profile
├── Transactions, Clients, Receivables
├── DAS History, Quotes
├── Stats (computed), ChartData
├── Integrations
├── AI messages
└── All CRUD actions

DashboardLayout   (shell, navigation)
└── 10× Tab components (lazy-loaded via Suspense)
    └── Each tab reads from context, zero prop-drilling
```

---

## Database Schema

### `profiles`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Matches `auth.users.id` |
| plano_ativo | boolean | Subscription active |
| onboarding_done | boolean | Completed setup |
| plano | text | 'trial' \| 'completo' |
| stripe_customer_id | text | Stripe Customer ID |
| created_at | timestamptz | |

### `transactions`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | |
| user_id | uuid (FK → profiles) | |
| description | text | |
| value | numeric | Always positive |
| type | text | 'in' \| 'out' |
| category | text | Serviço, Fixo, Imposto… |
| date | date | |
| created_at | timestamptz | |

### `clients`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | |
| user_id | uuid (FK) | |
| name | text | |
| phone | text | |
| email | text | |
| total_revenue | numeric | Lifetime value |
| created_at | timestamptz | |

### `receivables`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | |
| user_id | uuid (FK) | |
| client_name | text | |
| description | text | |
| value | numeric | |
| due_date | date | |
| status | text | 'pending' \| 'received' \| 'overdue' |
| created_at | timestamptz | |

### `das_history`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | |
| user_id | uuid (FK) | |
| reference_month | text | Ex: "Jan/2025" |
| value | numeric | |
| paid_date | date | |
| receipt_number | text | Optional |
| created_at | timestamptz | |

### `quotes`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | |
| user_id | uuid (FK) | |
| client_name | text | |
| description | text | |
| items | jsonb | Array of `{desc, value}` |
| total | numeric | Computed sum |
| valid_until | date | |
| status | text | 'draft' \| 'sent' \| 'approved' \| 'rejected' |
| notes | text | |
| created_at | timestamptz | |

### `integrations`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | |
| user_id | uuid (FK) | |
| provider | text | 'banco', 'mercadopago', 'notafiscal' |
| provider_name | text | 'nubank', 'inter', etc |
| status | text | 'connected' \| 'disconnected' |
| access_token | text | ⚠️ Sprint 2: encrypt with AES-256 |
| metadata | jsonb | Display name, icon, etc |
| connected_at | timestamptz | |

---

## API Routes

### `POST /api/checkout`
Creates a Stripe Checkout Session with 7-day trial.
```json
// Request
{ "email": "user@example.com", "userId": "uuid" }
// Response
{ "url": "https://checkout.stripe.com/..." }
```

### `POST /api/webhook`
Handles Stripe events: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.deleted`.
Sets `profiles.plano_ativo` accordingly.

### `POST /api/pluggy/token`
Auth: Bearer JWT (Supabase session).  
Returns a Pluggy `connect_token` to open the bank widget.

### `POST /api/pluggy/callback`
Called after user connects bank via Pluggy widget.
```json
// Request
{ "itemId": "...", "bankName": "nubank", "bankDisplayName": "Nubank", "bankIcon": "🟣" }
// Response
{ "success": true }
```
⚠️ **Sprint 2 TODO:** After saving, call Pluggy `/accounts` and `/transactions` to import data.

### `POST /api/ai`
Proxies to OpenAI GPT-4o with financial context injected.
Detects `ACTION:{...}` pattern in response to auto-post transactions.

---

## Authentication Flow

```
User signup
  → Supabase auth.signUp()
  → Redirect /assinar

Stripe checkout (7-day trial)
  → stripe.checkout.sessions.create()
  → Webhook: checkout.session.completed
  → profiles.plano_ativo = true

/onboarding (polls plano_ativo every 2s)
  → 3 steps: business name, CNPJ, segment
  → profiles.onboarding_done = true

/app (protected by middleware.ts)
  → Server-side: checks session + profile
  → Redirects to /login or /assinar if needed
```

---

## Health Score Algorithm (Current — Sprint 1)

```
score = (monthProfit / monthRevenue) × 60
      + ((81000 - yearRevenue) / 81000) × 40

clamped to [0, 100]
```

**Sprint 3 target** — 5 components:
| Component | Weight | Signal |
|-----------|--------|--------|
| Profit margin | 25 pts | monthProfit / monthRevenue |
| Cash flow | 20 pts | Positive months in last 6 |
| Expense control | 20 pts | Expense trend |
| Emergency reserve | 20 pts | Months of runway |
| Tax compliance | 15 pts | DAS paid on time |

---

## Security Checklist

| Item | Status | Sprint |
|------|--------|--------|
| Server-side auth guard (middleware) | ✅ Done | S1 |
| alert()/confirm() replaced with modals | ✅ Done | S1 |
| Dead code removed | ✅ Done | S1 |
| access_token encryption (AES-256) | ⏳ Todo | S2 |
| API rate limiting (10 req/min) | ⏳ Todo | S2 |
| Trial manipulation prevention | ⏳ Todo | S2 |

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PRICE_ID=
STRIPE_WEBHOOK_SECRET=

# Pluggy (Open Finance)
PLUGGY_CLIENT_ID=
PLUGGY_CLIENT_SECRET=

# OpenAI
OPENAI_API_KEY=

# App
NEXT_PUBLIC_APP_URL=
```

---

## Sprint Roadmap

| Sprint | Focus | Status |
|--------|-------|--------|
| **S1** | Refactor + Foundation | ✅ Complete |
| **S2** | Real Bank Sync (Pluggy transactions) | ⏳ Next |
| **S3** | Complete Financial Diagnosis (5-component health score) | ⏳ |
| **S4** | Intelligent Alerts (dynamic, DB-driven) | ⏳ |
| **S5** | Financial Forecasting (3-month trend) | ⏳ |
| **S6** | Public Pages (/calculadora, /score) | ⏳ |

---

## Design System

All styles live in `src/styles/dashboard.css`.  
CSS custom properties (variables) defined on `:root`.  
Font: **Plus Jakarta Sans** (display) + **DM Mono** (numbers).  
Color palette: dark background (`#0a0d12`) with green primary (`#10b981`).

Component classes: `.card`, `.btn-add`, `.badge-*`, `.form-group-sm`, `.grid-*`, `.nav-item`, etc.
