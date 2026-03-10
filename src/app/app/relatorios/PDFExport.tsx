'use client'

/**
 * src/app/app/relatorios/PDFExport.tsx
 *
 * Painel de exportação de PDFs.
 * Busca dados do Supabase e chama as funções de src/lib/pdf.ts.
 *
 * Uso:
 *   import PDFExport from './PDFExport'
 *   <PDFExport />
 */

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  exportExtrato,
  exportDAS,
  exportCotacao,
  exportClientes,
  type Transaction,
  type DASRecord,
  type Quote,
  type ClientReport,
} from '@/lib/pdf'

type ReportType = 'extrato' | 'das' | 'clientes' | 'cotacao'

const MESES = Array.from({ length: 12 }, (_, i) => {
  const d = new Date()
  d.setMonth(d.getMonth() - i)
  const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  const label = d.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
  return { value, label }
})

export default function PDFExport() {
  const [loading, setLoading] = useState<ReportType | null>(null)
  const [mesSelecionado, setMesSelecionado] = useState(MESES[0].value)
  const [cotacaoId, setCotacaoId] = useState('')
  const [cotacoes, setCotacoes] = useState<{ id: string; client_name: string }[]>([])
  const [cotacoesLoaded, setCotacoesLoaded] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  async function getProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')
    const { data } = await supabase
      .from('profiles')
      .select('nome_empresa, cnpj')
      .eq('id', user.id)
      .single()
    return { user, profile: data }
  }

  function showFeedback(type: 'success' | 'error', msg: string) {
    setFeedback({ type, msg })
    setTimeout(() => setFeedback(null), 4000)
  }

  // ── Extrato ──────────────────────────────────────────────────────────────
  async function handleExtrato() {
    setLoading('extrato')
    try {
      const { user, profile } = await getProfile()
      const [year, month] = mesSelecionado.split('-').map(Number)
      const start = new Date(year, month - 1, 1).toISOString().split('T')[0]
      const end = new Date(year, month, 0).toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('transactions')
        .select('date, description, category, type, value, source')
        .eq('user_id', user.id)
        .gte('date', start)
        .lte('date', end)
        .order('date', { ascending: true })

      if (error) throw error

      exportExtrato(data as Transaction[], mesSelecionado, profile?.nome_empresa ?? undefined)
      showFeedback('success', 'Extrato exportado com sucesso!')
    } catch (e) {
      showFeedback('error', 'Erro ao exportar extrato.')
      console.error(e)
    } finally {
      setLoading(null)
    }
  }

  // ── DAS ──────────────────────────────────────────────────────────────────
  async function handleDAS() {
    setLoading('das')
    try {
      const { user, profile } = await getProfile()

      const { data, error } = await supabase
        .from('das_history')
        .select('reference_month, value, paid_date, receipt_number')
        .eq('user_id', user.id)
        .order('paid_date', { ascending: false })

      if (error) throw error

      exportDAS(data as DASRecord[], profile?.nome_empresa ?? undefined)
      showFeedback('success', 'Histórico DAS exportado!')
    } catch (e) {
      showFeedback('error', 'Erro ao exportar DAS.')
      console.error(e)
    } finally {
      setLoading(null)
    }
  }

  // ── Clientes ─────────────────────────────────────────────────────────────
  async function handleClientes() {
    setLoading('clientes')
    try {
      const { user, profile } = await getProfile()

      const { data, error } = await supabase
        .from('clients')
        .select('name, email, phone, total_revenue, created_at')
        .eq('user_id', user.id)
        .order('total_revenue', { ascending: false })

      if (error) throw error

      exportClientes(data as ClientReport[], profile?.nome_empresa ?? undefined)
      showFeedback('success', 'Relatório de clientes exportado!')
    } catch (e) {
      showFeedback('error', 'Erro ao exportar clientes.')
      console.error(e)
    } finally {
      setLoading(null)
    }
  }

  // ── Cotação ──────────────────────────────────────────────────────────────
  async function loadCotacoes() {
    if (cotacoesLoaded) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('quotes')
      .select('id, client_name')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setCotacoes(data ?? [])
    if (data?.[0]) setCotacaoId(data[0].id)
    setCotacoesLoaded(true)
  }

  async function handleCotacao() {
    if (!cotacaoId) return
    setLoading('cotacao')
    try {
      const { user, profile } = await getProfile()

      const { data, error } = await supabase
        .from('quotes')
        .select('client_name, description, items, total, valid_until, notes, created_at')
        .eq('id', cotacaoId)
        .eq('user_id', user.id)
        .single()

      if (error) throw error

      exportCotacao(data as Quote, profile?.nome_empresa ?? undefined, profile?.cnpj ?? undefined)
      showFeedback('success', 'Cotação exportada!')
    } catch (e) {
      showFeedback('error', 'Erro ao exportar cotação.')
      console.error(e)
    } finally {
      setLoading(null)
    }
  }

  // ── UI ───────────────────────────────────────────────────────────────────
  const reports = [
    {
      id: 'extrato' as ReportType,
      icon: '📊',
      title: 'Extrato Mensal',
      desc: 'Todas as transações do mês com totais de receita, despesa e saldo.',
      action: handleExtrato,
      extra: (
        <div className="form-group-sm">
          <label>Mês de referência</label>
          <select value={mesSelecionado} onChange={e => setMesSelecionado(e.target.value)}>
            {MESES.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
      ),
    },
    {
      id: 'das' as ReportType,
      icon: '🏛️',
      title: 'Histórico DAS',
      desc: 'Todos os pagamentos do DAS com datas, valores e números de recibo.',
      action: handleDAS,
    },
    {
      id: 'clientes' as ReportType,
      icon: '👥',
      title: 'Relatório de Clientes',
      desc: 'Lista de clientes ordenada por receita total gerada.',
      action: handleClientes,
    },
    {
      id: 'cotacao' as ReportType,
      icon: '📄',
      title: 'Cotação / Orçamento',
      desc: 'Exporta uma cotação específica em formato de proposta comercial.',
      action: handleCotacao,
      extra: (
        <div className="form-group-sm" onClick={loadCotacoes}>
          <label>Selecionar cotação</label>
          <select
            value={cotacaoId}
            onChange={e => setCotacaoId(e.target.value)}
            onFocus={loadCotacoes}
          >
            {!cotacoesLoaded && <option value="">Carregando...</option>}
            {cotacoes.map(c => (
              <option key={c.id} value={c.id}>{c.client_name}</option>
            ))}
            {cotacoesLoaded && cotacoes.length === 0 && (
              <option value="">Nenhuma cotação encontrada</option>
            )}
          </select>
        </div>
      ),
    },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, margin: 0 }}>
          Exportar Relatórios
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 6 }}>
          Gere PDFs dos seus dados financeiros para guardar ou compartilhar.
        </p>
      </div>

      {/* Feedback toast */}
      {feedback && (
        <div style={{
          marginBottom: 20,
          padding: '12px 16px',
          borderRadius: 12,
          fontSize: 13,
          fontWeight: 600,
          background: feedback.type === 'success' ? 'var(--green-dim)' : 'var(--red-dim)',
          border: `1px solid ${feedback.type === 'success' ? 'var(--green-border)' : 'rgba(239,68,68,0.25)'}`,
          color: feedback.type === 'success' ? 'var(--green)' : 'var(--red)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          {feedback.type === 'success' ? '✓' : '✕'} {feedback.msg}
        </div>
      )}

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {reports.map(report => (
          <div key={report.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'var(--primary-dim)',
                border: '1px solid var(--primary-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, flexShrink: 0,
              }}>
                {report.icon}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
                  {report.title}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 3, lineHeight: 1.45 }}>
                  {report.desc}
                </div>
              </div>
            </div>

            {report.extra && report.extra}

            <button
              className="btn-primary"
              onClick={report.action}
              disabled={loading === report.id}
              style={{
                width: '100%',
                opacity: loading === report.id ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {loading === report.id ? (
                <>
                  <span style={{
                    width: 12, height: 12, borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid #fff',
                    animation: 'spin 0.7s linear infinite',
                    display: 'inline-block',
                  }} />
                  Gerando PDF...
                </>
              ) : (
                <>↓ Baixar PDF</>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
