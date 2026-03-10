'use client'
import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

// ─── Types ───────────────────────────────────────────────────────────────────

export type Transaction = {
  id: string
  description: string
  value: number
  type: 'in' | 'out'
  category: string
  date: string
  created_at: string
  source?: 'manual' | 'bank_sync'
  external_id?: string
  is_personal?: boolean
  bank_account_name?: string
  bank_name?: string
}

export type Client = {
  id: string
  name: string
  phone: string
  email: string
  total_revenue: number
  created_at: string
}

export type Receivable = {
  id: string
  client_name: string
  description: string
  value: number
  due_date: string
  status: 'pending' | 'received' | 'overdue'
  created_at: string
}

export type DasHistory = {
  id: string
  reference_month: string
  value: number
  paid_date: string
  receipt_number: string
  created_at: string
}

export type QuoteItem = { desc: string; value: number }

export type Quote = {
  id: string
  client_name: string
  description: string
  items: QuoteItem[]
  total: number
  valid_until: string
  status: 'draft' | 'sent' | 'approved' | 'rejected'
  notes: string
  created_at: string
}

export type Stats = {
  monthRevenue: number
  monthExpenses: number
  monthProfit: number
  yearRevenue: number
  healthScore: number
  monthRevenueNet: number
  monthExpensesNet: number
  monthProfitNet: number
  bankSyncCount: number
}

export type ChartMonth = {
  month: string
  revenue: number
  expenses: number
}

export type Integration = {
  id: string
  user_id: string
  provider: string
  provider_name: string
  status: string
  access_token: string
  metadata: Record<string, any>
  connected_at: string
}

export type AiMessage = {
  role: 'ai' | 'user'
  text: string
  image?: string
  pendingAction?: { type: 'in' | 'out'; value: number; description: string; category: string }
}

// ─── Toast ───────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export type Toast = {
  id: string
  type: ToastType
  message: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export const pctOf = (a: number, b: number) =>
  b > 0 ? ((a / b) * 100).toFixed(1) : '0.0'

export function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function monthRange() {
  const now = new Date()
  const first = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const last  = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
  return { first, last }
}

export function formatDateBR(iso: string) {
  try { return new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR') } catch { return iso }
}

export function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

// ─── Context type ─────────────────────────────────────────────────────────────

type DashboardContextType = {
  user: any
  userName: string
  userBiz: string
  setUserName: (v: string) => void
  setUserBiz: (v: string) => void
  loading: boolean
  transactions: Transaction[]
  clients: Client[]
  receivables: Receivable[]
  dasHistory: DasHistory[]
  quotes: Quote[]
  stats: Stats
  chartData: ChartMonth[]
  integrations: Record<string, Integration>
  trialDaysLeft: number
  trialExpired: boolean
  planActive: boolean
  setPlanActive: (v: boolean) => void
  aiMessages: AiMessage[]
  setAiMessages: (msgs: AiMessage[] | ((prev: AiMessage[]) => AiMessage[])) => void
  aiTyping: boolean
  setAiTyping: (v: boolean) => void
  chatRef: React.RefObject<HTMLDivElement | null>
  setActiveTab: (tab: string) => void
  registerActiveTabSetter: (fn: (tab: string) => void) => void
  confirmModal: { msg: string; onOk: () => void } | null
  showConfirm: (msg: string, onOk: () => void) => void
  setConfirmModal: (v: { msg: string; onOk: () => void } | null) => void
  // Toast
  toasts: Toast[]
  showToast: (message: string, type?: ToastType) => void
  dismissToast: (id: string) => void
  // Actions
  loadAll: (u: any) => Promise<void>
  loadIntegrations: (userId: string) => Promise<void>
  saveIntegration: (provider: string, providerName: string, token: string, meta?: any) => Promise<boolean>
  disconnectIntegration: (provider: string, providerName: string) => Promise<void>
  addTransaction: (desc: string, val: number, type: 'in' | 'out', cat: string, date: string) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  addClient: (name: string, phone: string, email: string) => Promise<void>
  deleteClient: (id: string) => Promise<void>
  addReceivable: (clientName: string, desc: string, value: number, dueDate: string) => Promise<void>
  markReceivableReceived: (id: string, value: number, desc: string) => Promise<void>
  deleteReceivable: (id: string) => Promise<void>
  addDasHistory: (refMonth: string, value: number, paidDate: string, receipt: string) => Promise<void>
  addQuote: (client: string, desc: string, items: QuoteItem[], validUntil: string, notes: string) => Promise<void>
  updateQuoteStatus: (id: string, status: Quote['status']) => Promise<void>
  deleteQuote: (id: string) => Promise<void>
  saveConfig: (name: string, biz: string) => Promise<void>
  doLogout: () => Promise<void>
}

const DashboardContext = createContext<DashboardContextType | null>(null)

export function useDashboard() {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error('useDashboard must be used inside DashboardProvider')
  return ctx
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function DashboardProvider({ children }: { children: ReactNode }) {
  const router = useRouter()

  const activeTabRef = useRef<(tab: string) => void>(() => {})
  const setActiveTab = (tab: string) => activeTabRef.current(tab)
  const registerActiveTabSetter = (fn: (tab: string) => void) => { activeTabRef.current = fn }

  const [user, setUser]         = useState<any>(null)
  const [userName, setUserName] = useState('')
  const [userBiz, setUserBiz]   = useState('')
  const [loading, setLoading]   = useState(true)

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [clients, setClients]           = useState<Client[]>([])
  const [receivables, setReceivables]   = useState<Receivable[]>([])
  const [dasHistory, setDasHistory]     = useState<DasHistory[]>([])
  const [quotes, setQuotes]             = useState<Quote[]>([])

  const [stats, setStats] = useState<Stats>({
    monthRevenue: 0, monthExpenses: 0, monthProfit: 0,
    yearRevenue: 0, healthScore: 0,
    monthRevenueNet: 0, monthExpensesNet: 0, monthProfitNet: 0,
    bankSyncCount: 0,
  })
  const [chartData, setChartData]       = useState<ChartMonth[]>([])
  const [integrations, setIntegrations] = useState<Record<string, Integration>>({})

  const [trialDaysLeft, setTrialDaysLeft] = useState(7)
  const [trialExpired, setTrialExpired]   = useState(false)
  const [planActive, setPlanActive]       = useState(false)

  const [aiMessages, setAiMessages] = useState<AiMessage[]>([])
  const [aiTyping, setAiTyping]     = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)

  const [confirmModal, setConfirmModal] = useState<{ msg: string; onOk: () => void } | null>(null)
  function showConfirm(msg: string, onOk: () => void) { setConfirmModal({ msg, onOk }) }

  // ── Toast system ─────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState<Toast[]>([])

  function showToast(message: string, type: ToastType = 'success') {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => dismissToast(id), 3500)
  }

  function dismissToast(id: string) {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  // ── Gatilhos de notificação ───────────────────────────────────────────────
async function checkAndNotify(userId: string, dasData: DasHistory[], receivablesData: Receivable[], yearRevenue: number) {
  const today = new Date()
  const day = today.getDate()
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  const notifyKey = `kore_notified_${userId}_${currentMonth}`

  // Evita disparar as mesmas notificações mais de uma vez por mês
  if (typeof window !== 'undefined' && localStorage.getItem(notifyKey)) return
  
  const notifications: { title: string; body: string; event: string }[] = []

  // 1. DAS vencendo (entre dia 15 e 20)
  if (day >= 15 && day <= 20) {
    const dasPago = dasData.some(d => d.reference_month === currentMonth)
    if (!dasPago) {
      notifications.push({
        title: '🏛️ DAS vencendo em breve',
        body: `O DAS de ${today.toLocaleString('pt-BR', { month: 'long' })} vence no dia 20. Não esqueça de pagar!`,
        event: 'das_vencendo',
      })
    }
  }

  // 2. Recebíveis vencendo em até 3 dias
  const em3dias = new Date()
  em3dias.setDate(em3dias.getDate() + 3)
  const vencendo = receivablesData.filter(r => {
    if (r.status !== 'pending') return false
    const due = new Date(r.due_date + 'T12:00:00')
    return due <= em3dias && due >= today
  })
  if (vencendo.length > 0) {
    notifications.push({
      title: `⏰ ${vencendo.length} cobrança${vencendo.length > 1 ? 's' : ''} vencendo`,
      body: vencendo.length === 1
        ? `${vencendo[0].client_name} — vence em ${formatDateBR(vencendo[0].due_date)}`
        : `${vencendo.map(r => r.client_name).join(', ')} vencem nos próximos 3 dias`,
      event: 'receber_vencendo',
    })
  }

  // 3. Limite MEI (80% = R$ 64.800)
  if (yearRevenue >= 64800) {
    notifications.push({
      title: '⚠️ Limite MEI próximo',
      body: `Você atingiu ${((yearRevenue / 81000) * 100).toFixed(0)}% do limite anual. Faturamento: R$ ${yearRevenue.toLocaleString('pt-BR')}.`,
      event: 'limite_mei',
    })
  }

  if (notifications.length === 0) return

  // Salva no banco
  await Promise.all(notifications.map(n =>
    supabase.from('notifications').insert({ user_id: userId, ...n, read: false })
  ))

  // Marca como notificado neste mês
  if (typeof window !== 'undefined') {
    localStorage.setItem(notifyKey, '1')
  }
}

  // ── Session check ─────────────────────────────────────────────────────────
  useEffect(() => {
    async function checkSession() {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('plano_ativo, onboarding_done, plano')
        .eq('id', user.id)
        .single()

      if (!profile?.plano_ativo) {
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/assinar')) {
          router.push('/assinar')
        }
        return
      }
      if (!profile?.onboarding_done) { router.push('/onboarding'); return }

      checkTrial(user, profile)
      await loadAll(user)
    }
    checkSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function checkTrial(u: any, profile?: any) {
    if (profile?.plano === 'completo' || (profile?.plano_ativo && profile?.plano !== 'trial')) {
      setPlanActive(true); setTrialExpired(false); setTrialDaysLeft(99); return
    }
    const createdAt = new Date(u.created_at || Date.now())
    const diffDays  = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
    const daysLeft  = Math.max(0, 7 - diffDays)
    setTrialDaysLeft(daysLeft)
    if (daysLeft <= 0) setTrialExpired(true)
  }

  // ── loadAll — carga inicial completa ─────────────────────────────────────
  const loadAll = useCallback(async (u: any) => {
    setUser(u)
    const name = u.user_metadata?.name || u.email?.split('@')[0] || 'Usuário'
    const biz  = u.user_metadata?.business_name || 'Meu Negócio'
    setUserName(name)
    setUserBiz(biz)
    setAiMessages((prev: AiMessage[]) => {
      if (prev.length > 1) return prev
      return [{ role: 'ai', text: `Oi, ${name.split(' ')[0]}! 👋 Sou sua IA financeira. Pergunte qualquer coisa sobre o negócio em linguagem normal.` }]
    })

    const { first, last } = monthRange()
    const now = new Date()
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
    sixMonthsAgo.setDate(1)

    const [resTxMonth, resTxYear, resCli, resChart, resRec, resDas, resQuotes] = await Promise.all([
      supabase.from('transactions').select('*').eq('user_id', u.id).gte('date', first).lte('date', last).order('created_at', { ascending: false }),
      supabase.from('transactions').select('value').eq('user_id', u.id).eq('type', 'in').gte('date', `${now.getFullYear()}-01-01`),
      supabase.from('clients').select('*').eq('user_id', u.id).order('total_revenue', { ascending: false }),
      supabase.from('transactions').select('value,type,date').eq('user_id', u.id).gte('date', sixMonthsAgo.toISOString().split('T')[0]),
      supabase.from('receivables').select('*').eq('user_id', u.id).order('due_date', { ascending: true }),
      supabase.from('das_history').select('*').eq('user_id', u.id).order('paid_date', { ascending: false }),
      supabase.from('quotes').select('*').eq('user_id', u.id).order('created_at', { ascending: false }),
    ])

    applyTransactionData(resTxMonth.data || [], resTxYear.data || [], resChart.data || [])
    setClients(resCli.data || [])
    setReceivables((resRec.data || []).map((r: any) => ({
      ...r,
      status: r.status === 'received' ? 'received' : new Date(r.due_date) < new Date() ? 'overdue' : 'pending'
    })))
    setDasHistory(resDas.data || [])
    setQuotes((resQuotes.data || []).map((q: any) => ({
      ...q,
      items: typeof q.items === 'string' ? JSON.parse(q.items) : q.items || []
    })))
    setLoading(false)
    await loadIntegrations(u.id)

    const yearRev = (resTxYear.data || []).reduce((s: number, t: any) => s + t.value, 0)
    await checkAndNotify(u.id, resDas.data || [], resRec.data || [], yearRev)
  }, [])

  // ── loadTransactions — recarrega só transações (após lançamento/delete) ──
  // Evita recarregar clientes, coranças, orçamentos desnecessariamente
  const loadTransactions = useCallback(async (u: any) => {
    const { first, last } = monthRange()
    const now = new Date()
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
    sixMonthsAgo.setDate(1)

    const [resTxMonth, resTxYear, resChart] = await Promise.all([
      supabase.from('transactions').select('*').eq('user_id', u.id).gte('date', first).lte('date', last).order('created_at', { ascending: false }),
      supabase.from('transactions').select('value').eq('user_id', u.id).eq('type', 'in').gte('date', `${now.getFullYear()}-01-01`),
      supabase.from('transactions').select('value,type,date').eq('user_id', u.id).gte('date', sixMonthsAgo.toISOString().split('T')[0]),
    ])

    applyTransactionData(resTxMonth.data || [], resTxYear.data || [], resChart.data || [])
  }, [])

  // ── Aplica dados de transações ao estado + recalcula stats ───────────────
  function applyTransactionData(txMonth: any[], txYear: any[], txChart: any[]) {
    const txs: Transaction[] = txMonth

    const monthRevenue  = txs.filter(t => t.type === 'in').reduce((s, t) => s + t.value, 0)
    const monthExpenses = txs.filter(t => t.type === 'out').reduce((s, t) => s + t.value, 0)
    const monthProfit   = monthRevenue - monthExpenses

    const bizTxs           = txs.filter(t => !t.is_personal)
    const monthRevenueNet  = bizTxs.filter(t => t.type === 'in').reduce((s, t) => s + t.value, 0)
    const monthExpensesNet = bizTxs.filter(t => t.type === 'out').reduce((s, t) => s + t.value, 0)
    const monthProfitNet   = monthRevenueNet - monthExpensesNet
    const bankSyncCount    = txs.filter(t => t.source === 'bank_sync').length
    const yearRevenue      = txYear.reduce((s: number, t: any) => s + t.value, 0)

    // Health score: só calcula se tiver dados reais — evita o "40 falso"
    let healthScore = 0
    if (monthRevenueNet > 0 || monthExpensesNet > 0) {
      const marginScore = monthRevenueNet > 0
        ? Math.round((monthProfitNet / monthRevenueNet) * 60)
        : 0
      const limitScore = Math.round(((81000 - yearRevenue) / 81000) * 40)
      healthScore = Math.min(100, Math.max(0, marginScore + limitScore))
    }

    setTransactions(txs)
    setStats({ monthRevenue, monthExpenses, monthProfit, yearRevenue, healthScore, monthRevenueNet, monthExpensesNet, monthProfitNet, bankSyncCount })

    const months: ChartMonth[] = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(); d.setMonth(d.getMonth() - (5 - i))
      const label = d.toLocaleString('pt-BR', { month: 'short' }).replace('.', '').replace(/^\w/, c => c.toUpperCase())
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const rev = txChart.filter((t: any) => t.date?.startsWith(key) && t.type === 'in').reduce((s: number, t: any) => s + t.value, 0)
      const exp = txChart.filter((t: any) => t.date?.startsWith(key) && t.type === 'out').reduce((s: number, t: any) => s + t.value, 0)
      return { month: label, revenue: rev, expenses: exp }
    })
    setChartData(months)
  }

  async function loadIntegrations(userId: string) {
    const { data } = await supabase.from('integrations').select('*').eq('user_id', userId)
    const map: Record<string, any> = {}
    if (data) data.forEach((i: any) => {
      const key = i.provider_name ? `${i.provider}_${i.provider_name}` : i.provider
      map[key] = i
    })
    setIntegrations(map)
  }

  async function saveIntegration(provider: string, providerName: string, token: string, meta: any = {}) {
    const { error } = await supabase.from('integrations').upsert({
      user_id: user.id, provider, provider_name: providerName,
      status: 'connected', access_token: token, metadata: meta,
      connected_at: new Date().toISOString(),
    }, { onConflict: 'user_id,provider,provider_name' })
    if (!error) await loadIntegrations(user.id)
    return !error
  }

  async function disconnectIntegration(provider: string, providerName: string) {
    await supabase.from('integrations').delete().eq('user_id', user.id).eq('provider', provider).eq('provider_name', providerName)
    await loadIntegrations(user.id)
  }

  // ── Ações otimizadas — usam loadTransactions em vez de loadAll ────────────

  async function addTransaction(desc: string, val: number, type: 'in' | 'out', cat: string, date: string) {
    try {
      const { error } = await supabase.from('transactions').insert({ user_id: user.id, description: desc, value: val, type, category: cat, date: date || todayISO() })
      if (error) throw error
      await loadTransactions(user)
      showToast(`${type === 'in' ? '↑' : '↓'} ${desc} — ${fmt(val)} lançado!`, 'success')
    } catch {
      showToast('Erro ao lançar transação. Tente novamente.', 'error')
    }
  }

  async function deleteTransaction(id: string) {
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id)
      if (error) throw error
      await loadTransactions(user)
      showToast('Lançamento removido.', 'info')
    } catch {
      showToast('Erro ao remover lançamento.', 'error')
    }
  }

  async function addClient(name: string, phone: string, email: string) {
    try {
      const { error } = await supabase.from('clients').insert({ user_id: user.id, name, phone, email, total_revenue: 0 })
      if (error) throw error
      await loadAll(user)
      showToast(`Cliente ${name} adicionado.`, 'success')
    } catch {
      showToast('Erro ao adicionar cliente.', 'error')
    }
  }

  async function deleteClient(id: string) {
    try {
      const { error } = await supabase.from('clients').delete().eq('id', id)
      if (error) throw error
      await loadAll(user)
      showToast('Cliente removido.', 'info')
    } catch {
      showToast('Erro ao remover cliente.', 'error')
    }
  }

  async function addReceivable(clientName: string, desc: string, value: number, dueDate: string) {
    try {
      const { error } = await supabase.from('receivables').insert({ user_id: user.id, client_name: clientName, description: desc, value, due_date: dueDate, status: 'pending' })
      if (error) throw error
      await loadAll(user)
      showToast(`Cobrança de ${fmt(value)} criada para ${clientName}.`, 'success')
    } catch {
      showToast('Erro ao criar cobrança.', 'error')
    }
  }

  async function markReceivableReceived(id: string, value: number, desc: string) {
    try {
      await supabase.from('receivables').update({ status: 'received' }).eq('id', id)
      await supabase.from('transactions').insert({ user_id: user.id, description: desc || 'Cobrança recebida', value, type: 'in', category: 'Serviço', date: todayISO() })
      await loadAll(user)
      showToast(`${fmt(value)} recebido e lançado!`, 'success')
    } catch {
      showToast('Erro ao registrar recebimento.', 'error')
    }
  }

  async function deleteReceivable(id: string) {
    try {
      const { error } = await supabase.from('receivables').delete().eq('id', id)
      if (error) throw error
      await loadAll(user)
      showToast('Cobrança removida.', 'info')
    } catch {
      showToast('Erro ao remover cobrança.', 'error')
    }
  }

  async function addDasHistory(refMonth: string, value: number, paidDate: string, receipt: string) {
    try {
      const { error } = await supabase.from('das_history').insert({ user_id: user.id, reference_month: refMonth, value, paid_date: paidDate, receipt_number: receipt })
      if (error) throw error
      await loadAll(user)
      showToast(`DAS de ${fmt(value)} registrado.`, 'success')
    } catch {
      showToast('Erro ao registrar DAS.', 'error')
    }
  }

  async function addQuote(client: string, desc: string, items: QuoteItem[], validUntil: string, notes: string) {
    try {
      const total = items.reduce((s, i) => s + (i.value || 0), 0)
      const { error } = await supabase.from('quotes').insert({ user_id: user.id, client_name: client, description: desc, items: JSON.stringify(items), total, valid_until: validUntil || null, status: 'draft', notes })
      if (error) throw error
      await loadAll(user)
      showToast(`Orçamento para ${client} criado — ${fmt(total)}.`, 'success')
    } catch {
      showToast('Erro ao criar orçamento.', 'error')
    }
  }

  async function updateQuoteStatus(id: string, status: Quote['status']) {
    try {
      await supabase.from('quotes').update({ status }).eq('id', id)
      if (status === 'approved') {
        const q = quotes.find(x => x.id === id)
        if (q) await supabase.from('receivables').insert({ user_id: user.id, client_name: q.client_name, description: q.description || 'Orçamento aprovado', value: q.total, due_date: q.valid_until || todayISO(), status: 'pending' })
        showToast('Orçamento aprovado e cobrança criada!', 'success')
      } else {
        const labels: Record<string, string> = { sent: 'enviado', rejected: 'recusado', draft: 'voltou para rascunho' }
        showToast(`Orçamento ${labels[status] || status}.`, 'info')
      }
      await loadAll(user)
    } catch {
      showToast('Erro ao atualizar orçamento.', 'error')
    }
  }

  async function deleteQuote(id: string) {
    try {
      const { error } = await supabase.from('quotes').delete().eq('id', id)
      if (error) throw error
      await loadAll(user)
      showToast('Orçamento removido.', 'info')
    } catch {
      showToast('Erro ao remover orçamento.', 'error')
    }
  }

  async function saveConfig(name: string, biz: string) {
    try {
      await supabase.auth.updateUser({ data: { name, business_name: biz } })
      setUserName(name)
      setUserBiz(biz)
      showToast('Configurações salvas!', 'success')
    } catch {
      showToast('Erro ao salvar configurações.', 'error')
    }
  }

  async function doLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <DashboardContext.Provider value={{
      user, userName, userBiz, setUserName, setUserBiz,
      loading,
      transactions, clients, receivables, dasHistory, quotes, stats, chartData, integrations,
      trialDaysLeft, trialExpired, planActive, setPlanActive,
      aiMessages, setAiMessages, aiTyping, setAiTyping, chatRef,
      setActiveTab, registerActiveTabSetter,
      confirmModal, showConfirm, setConfirmModal,
      toasts, showToast, dismissToast,
      loadAll, loadIntegrations, saveIntegration, disconnectIntegration,
      addTransaction, deleteTransaction,
      addClient, deleteClient,
      addReceivable, markReceivableReceived, deleteReceivable,
      addDasHistory,
      addQuote, updateQuoteStatus, deleteQuote,
      saveConfig, doLogout,
    }}>
      {children}
    </DashboardContext.Provider>
  )
}
