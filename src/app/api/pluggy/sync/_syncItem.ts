import type { SupabaseClient } from '@supabase/supabase-js'

// ─── Tipos Pluggy ─────────────────────────────────────────────────────────────

type PluggyAccount = {
  id: string
  name: string
  type: string   // CHECKING | SAVINGS | CREDIT | INVESTMENT
  balance: number
}

type PluggyTransaction = {
  id: string
  description: string
  descriptionRaw?: string
  amount: number       // positivo = crédito, negativo = débito
  amountInAccountCurrency?: number
  date: string         // ISO
  type: string         // CREDIT | DEBIT
}

// ─── Categorização automática ─────────────────────────────────────────────────
// Mapeia palavras-chave da descrição para as categorias já usadas no sistema

type CategoryRule = {
  keywords: string[]
  category: string
  dir?: 'in' | 'out'   // restringe a crédito ou débito
}

const RULES: CategoryRule[] = [
  // Impostos / obrigações
  { keywords: ['das ', 'pgmei', 'simples nacional', 'receita federal', 'guia das'], category: 'Imposto', dir: 'out' },
  { keywords: ['inss', 'previdência social', 'prev social'], category: 'Imposto', dir: 'out' },

  // Receita de serviço (créditos no PJ)
  { keywords: ['pix recebido', 'transferência recebida', 'ted recebido', 'doc recebido'], category: 'Serviço', dir: 'in' },
  { keywords: ['pagamento recebido', 'crédito em conta', 'depósito'], category: 'Serviço', dir: 'in' },

  // Plataformas de pagamento
  { keywords: ['mercado pago', 'pagseguro', 'stone ', 'cielo', 'getnet', 'sumup', 'rede '], category: 'Serviço', dir: 'in' },
  { keywords: ['ifood', 'rappi', '99food', 'aiqfome'], category: 'Serviço', dir: 'in' },

  // Custos fixos
  { keywords: ['aluguel', 'condomínio', 'iptu', 'energia elétrica', 'celesc', 'copel', 'cemig', 'sabesp', 'água '], category: 'Fixo', dir: 'out' },
  { keywords: ['internet', 'vivo ', 'claro ', 'tim ', 'oi ', 'net cabo', 'telecom'], category: 'Fixo', dir: 'out' },
  { keywords: ['seguro ', 'porto seguro', 'bradesco saúde', 'sulamerica'], category: 'Fixo', dir: 'out' },
  { keywords: ['mensalidade', 'assinatura', 'netflix', 'spotify', 'adobe ', 'microsoft', 'google workspace', 'dropbox'], category: 'Fixo', dir: 'out' },

  // Fornecedores / materiais
  { keywords: ['nota fiscal', 'nfe', 'fornecedor', 'atacado', 'distribuidor', 'material'], category: 'Fornecedor', dir: 'out' },
  { keywords: ['mercado livre', 'shopee', 'amazon', 'magalu', 'americanas'], category: 'Fornecedor', dir: 'out' },

  // Alimentação (pode ser pessoal)
  { keywords: ['restaurante', 'lanchonete', 'padaria', 'supermercado', 'pão de açúcar', 'carrefour', 'extra ', 'assai', 'ifood pagamento'], category: 'Alimentação' },

  // Transporte (pessoal)
  { keywords: ['uber', 'cabify', '99taxi', 'taxi ', 'estacionamento', 'pedágio', 'combustível', 'posto ', 'gasolina', 'etanol'], category: 'Transporte' },

  // Saque / retirada pessoal
  { keywords: ['saque ', 'retirada', 'pix enviado', 'ted enviado', 'doc enviado', 'transferência enviada'], category: 'Pessoal', dir: 'out' },

  // Tarifas
  { keywords: ['tarifa', 'taxa bancária', 'anuidade', 'manutenção de conta', 'cobrança banco'], category: 'Tarifa Bancária', dir: 'out' },
]

const PERSONAL_CATEGORIES = new Set(['Alimentação', 'Transporte', 'Pessoal'])

function autoCategoria(description: string, amount: number): { category: string; is_personal: boolean } {
  const lower = description.toLowerCase()

  for (const rule of RULES) {
    const hit = rule.keywords.some(kw => lower.includes(kw))
    if (!hit) continue
    if (rule.dir === 'in'  && amount < 0) continue
    if (rule.dir === 'out' && amount > 0) continue
    return { category: rule.category, is_personal: PERSONAL_CATEGORIES.has(rule.category) }
  }

  // Fallback pelo sinal do valor
  return amount > 0
    ? { category: 'Serviço',  is_personal: false }
    : { category: 'Outros',   is_personal: false }
}

// ─── Auth Pluggy ──────────────────────────────────────────────────────────────

async function pluggyApiKey(): Promise<string> {
  const res = await fetch('https://api.pluggy.ai/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientId:     process.env.PLUGGY_CLIENT_ID,
      clientSecret: process.env.PLUGGY_CLIENT_SECRET,
    }),
  })
  if (!res.ok) throw new Error(`Pluggy auth: ${res.status} ${await res.text().then(t => t.slice(0, 100))}`)
  const { apiKey } = await res.json()
  if (!apiKey) throw new Error('Pluggy não retornou apiKey')
  return apiKey
}

// ─── Contas do item ───────────────────────────────────────────────────────────

async function fetchAccounts(apiKey: string, itemId: string): Promise<PluggyAccount[]> {
  const res = await fetch(`https://api.pluggy.ai/accounts?itemId=${itemId}`, {
    headers: { 'X-API-KEY': apiKey },
  })
  if (!res.ok) throw new Error(`/accounts: ${res.status}`)
  const data = await res.json()
  const all: PluggyAccount[] = data.results || data || []
  // Apenas corrente e poupança — não investimentos ou cartão de crédito
  return all.filter(a => ['CHECKING', 'SAVINGS', 'BANK'].includes(a.type?.toUpperCase() || ''))
}

// ─── Transações de uma conta ──────────────────────────────────────────────────

async function fetchTransactions(apiKey: string, accountId: string, from: string): Promise<PluggyTransaction[]> {
  const params = new URLSearchParams({ accountId, pageSize: '500', from })
  const res = await fetch(`https://api.pluggy.ai/transactions?${params}`, {
    headers: { 'X-API-KEY': apiKey },
  })
  if (!res.ok) throw new Error(`/transactions: ${res.status}`)
  const data = await res.json()
  let txs: PluggyTransaction[] = data.results || data || []

  // Paginação (máx 10 páginas = 5000 transações)
  const totalPages = data.totalPages || 1
  for (let p = 2; p <= Math.min(totalPages, 10); p++) {
    params.set('page', String(p))
    const pr = await fetch(`https://api.pluggy.ai/transactions?${params}`, { headers: { 'X-API-KEY': apiKey } })
    if (!pr.ok) break
    const pd = await pr.json()
    txs = txs.concat(pd.results || [])
  }
  return txs
}

// ─── Sync de um item bancário ─────────────────────────────────────────────────
// Exportada para ser reutilizada em /api/pluggy/sync-all

export type SyncResult = {
  bankName: string
  accountsFound: number
  imported: number
  skipped: number
  errors: string[]
}

export async function syncItem(
  supabase: SupabaseClient<any>,
  userId: string,
  integration: {
    id: string
    provider_name: string
    access_token: string          // itemId salvo em callback/route.ts
    metadata: Record<string, any> // { display, icon, itemId, last_sync? }
  }
): Promise<SyncResult> {
  const result: SyncResult = {
    bankName: integration.metadata?.display || integration.provider_name,
    accountsFound: 0,
    imported: 0,
    skipped: 0,
    errors: [],
  }

  // itemId pode estar em access_token (conforme callback/route.ts) ou metadata.itemId
  const itemId: string = integration.access_token || integration.metadata?.itemId
  if (!itemId) {
    result.errors.push('itemId não encontrado na integração')
    return result
  }

  // Auth Pluggy
  let apiKey: string
  try {
    apiKey = await pluggyApiKey()
  } catch (e: any) {
    result.errors.push(e.message)
    return result
  }

  // Contas
  let accounts: PluggyAccount[]
  try {
    accounts = await fetchAccounts(apiKey, itemId)
    result.accountsFound = accounts.length
  } catch (e: any) {
    result.errors.push(e.message)
    return result
  }

  if (accounts.length === 0) {
    result.errors.push('Nenhuma conta corrente/poupança encontrada')
    return result
  }

  // Período: desde last_sync ou últimos 90 dias
  const lastSync: string | undefined = integration.metadata?.last_sync
  const fromDate = lastSync
    ? lastSync.split('T')[0]
    : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  console.log(`[sync] ${result.bankName} | ${accounts.length} contas | from=${fromDate}`)

  // Para cada conta, importa transações
  for (const account of accounts) {
    let pluggyTxs: PluggyTransaction[]
    try {
      pluggyTxs = await fetchTransactions(apiKey, account.id, fromDate)
    } catch (e: any) {
      result.errors.push(`Conta ${account.name}: ${e.message}`)
      continue
    }

    for (const ptx of pluggyTxs) {
      // ID externo único — garante idempotência
      const externalId = `pluggy_${itemId}_${account.id}_${ptx.id}`

      // Verifica duplicata
      const { data: existing } = await supabase
        .from('transactions')
        .select('id')
        .eq('user_id', userId)
        .eq('external_id', externalId)
        .maybeSingle()

      if (existing) { result.skipped++; continue }

      // Normaliza valor (Pluggy: negativo = débito, positivo = crédito)
      const raw = ptx.amountInAccountCurrency ?? ptx.amount
      const value = Math.abs(raw)
      const type: 'in' | 'out' = raw > 0 ? 'in' : 'out'
      const description = (ptx.description || ptx.descriptionRaw || 'Transação bancária').slice(0, 200)
      const date = ptx.date.split('T')[0]

      const { category, is_personal } = autoCategoria(description, raw)

      const { error } = await supabase.from('transactions').insert({
        user_id:           userId,
        description,
        value,
        type,
        category,
        date,
        // Colunas novas — adicionadas pela migration
        source:            'bank_sync',
        external_id:       externalId,
        is_personal,
        bank_account_name: account.name,
        bank_name:         integration.provider_name,
      })

      if (error) {
        // Fallback: tenta sem as colunas novas (caso migration ainda não rodou)
        const { error: e2 } = await supabase.from('transactions').insert({
          user_id: userId, description, value, type, category, date,
        })
        if (e2) { result.errors.push(`Insert: ${e2.message}`); continue }
      }

      result.imported++
    }
  }

  // Atualiza last_sync no metadata da integração
  await supabase
    .from('integrations')
    .update({
      metadata: {
        ...integration.metadata,
        last_sync:       new Date().toISOString(),
        last_sync_count: result.imported,
      },
    })
    .eq('id', integration.id)

  console.log(`[sync] ${result.bankName} | imported=${result.imported} skipped=${result.skipped}`)
  return result
}