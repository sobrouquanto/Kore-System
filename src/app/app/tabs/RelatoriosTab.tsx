'use client'

import { useMemo, useState } from 'react'
import { useDashboard, fmt, pctOf, Transaction } from '@/context/DashboardContext'
import { HealthRing, Chart6Months, LimitBar } from '@/components/ui'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden', flex: 1 }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '99px', transition: 'width 0.6s ease' }} />
    </div>
  )
}

const CAT_COLORS: Record<string, string> = {
  'Serviço':      '#10b981',
  'Produto':      '#6ee7b7',
  'Fornecedor':   '#ef4444',
  'Imposto':      '#f59e0b',
  'Fixo':         '#f97316',
  'Equipamento':  '#8b5cf6',
  'Pessoal':      '#ec4899',
  'Alimentação':  '#84cc16',
  'Transporte':   '#06b6d4',
  'Outros':       '#94a3b8',
}

function getCatColor(cat: string) {
  return CAT_COLORS[cat] ?? '#94a3b8'
}

// ─── Sparkline SVG ───────────────────────────────────────────────────────────
function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.every(v => v === 0)) return <div style={{ height: '32px' }} />
  const max = Math.max(...values, 1)
  const w = 80, h = 32
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - (v / max) * (h - 4) - 2}`)
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
    </svg>
  )
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function RelatoriosTab() {
  const { stats, chartData, dasHistory, transactions, user } = useDashboard()

  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(currentYear)

  // Anos disponíveis baseados nas transações reais
  const availableYears = useMemo(() => {
    const years = new Set<number>()
    years.add(currentYear)
    transactions.forEach((t: Transaction) => {
      const y = parseInt(t.date?.slice(0, 4) ?? '')
      if (!isNaN(y)) years.add(y)
    })
    return Array.from(years).sort((a, b) => b - a)
  }, [transactions, currentYear])

  // Transações filtradas pelo ano selecionado (negócio apenas)
  const yearTxs = useMemo(() =>
    transactions.filter((t: Transaction) =>
      t.date?.startsWith(String(selectedYear)) && !t.is_personal
    ),
    [transactions, selectedYear]
  )

  // ── Totais reais do ano ────────────────────────────────────────────────────
  const yearRevenue  = useMemo(() => yearTxs.filter(t => t.type === 'in').reduce((s, t) => s + t.value, 0), [yearTxs])
  const yearExpenses = useMemo(() => yearTxs.filter(t => t.type === 'out').reduce((s, t) => s + t.value, 0), [yearTxs])
  const yearProfit   = yearRevenue - yearExpenses
  const yearMargem   = yearRevenue > 0 ? ((yearProfit / yearRevenue) * 100).toFixed(1) : '0.0'

  // DAS pagos no ano selecionado (do histórico real)
  const dasThisYear = useMemo(() =>
    dasHistory
      .filter(d => d.paid_date?.startsWith(String(selectedYear)))
      .reduce((s, d) => s + d.value, 0),
    [dasHistory, selectedYear]
  )

  // ── Receita e despesas por mês (12 meses) ─────────────────────────────────
  const monthlyData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const monthKey = `${selectedYear}-${String(i + 1).padStart(2, '0')}`
      const label = new Date(selectedYear, i, 1)
        .toLocaleString('pt-BR', { month: 'short' })
        .replace('.', '')
        .replace(/^\w/, c => c.toUpperCase())
      const rev = yearTxs.filter(t => t.date?.startsWith(monthKey) && t.type === 'in').reduce((s, t) => s + t.value, 0)
      const exp = yearTxs.filter(t => t.date?.startsWith(monthKey) && t.type === 'out').reduce((s, t) => s + t.value, 0)
      return { month: label, revenue: rev, expenses: exp, profit: rev - exp }
    })
  }, [yearTxs, selectedYear])

  // ── Despesas por categoria ─────────────────────────────────────────────────
  const expensesByCategory = useMemo(() => {
    const map: Record<string, number> = {}
    yearTxs.filter(t => t.type === 'out').forEach(t => {
      map[t.category] = (map[t.category] ?? 0) + t.value
    })
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
  }, [yearTxs])

  const maxCatValue = expensesByCategory[0]?.[1] ?? 1

  // ── Receita por categoria ──────────────────────────────────────────────────
  const revenueByCategory = useMemo(() => {
    const map: Record<string, number> = {}
    yearTxs.filter(t => t.type === 'in').forEach(t => {
      map[t.category] = (map[t.category] ?? 0) + t.value
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [yearTxs])

  // ── Melhor e pior mês ──────────────────────────────────────────────────────
  const bestMonth  = monthlyData.reduce((best, m) => m.revenue > best.revenue ? m : best, monthlyData[0])
  const worstMonth = monthlyData
    .filter(m => m.revenue > 0)
    .reduce((worst, m) => m.revenue < worst.revenue ? m : worst, bestMonth)

  // ── Ticket médio ──────────────────────────────────────────────────────────
  const inTxCount  = yearTxs.filter(t => t.type === 'in').length
  const avgTicket  = inTxCount > 0 ? yearRevenue / inTxCount : 0

  // ── Pct limite ────────────────────────────────────────────────────────────
  const pctLimit   = parseFloat(pctOf(yearRevenue, 81000))
  const limitColor = pctLimit > 80 ? 'var(--red)' : pctLimit > 60 ? 'var(--amber)' : 'var(--green)'

  const isCurrentYear = selectedYear === currentYear

  return (
    <>
      {/* ── Header com filtro de ano ───────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '-0.5px' }}>
            Relatório {selectedYear}
            {isCurrentYear && <span style={{ fontSize: '11px', background: 'var(--green-dim)', border: '1px solid var(--green-border)', color: 'var(--green)', padding: '2px 8px', borderRadius: '99px', fontWeight: 700, marginLeft: '10px', verticalAlign: 'middle' }}>Ano atual</span>}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '3px' }}>Dados reais das suas transações</div>
        </div>
        {/* Seletor de ano */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {availableYears.map(y => (
            <button
              key={y}
              onClick={() => setSelectedYear(y)}
              style={{
                padding: '7px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
                background: y === selectedYear ? 'var(--green-dim)' : 'rgba(255,255,255,0.04)',
                border: y === selectedYear ? '1px solid var(--green-border)' : '1px solid rgba(255,255,255,0.08)',
                color: y === selectedYear ? 'var(--green)' : 'rgba(255,255,255,0.5)',
                transition: 'all 0.15s',
              }}
            >{y}</button>
          ))}
        </div>
      </div>

      {/* ── KPIs do ano ───────────────────────────────────────────────────── */}
      <div className="grid-4" style={{ marginBottom: '20px' }}>
        {[
          { label: 'RECEITA DO ANO', value: fmt(yearRevenue), color: 'var(--green)', sub: `${inTxCount} entradas` },
          { label: 'DESPESAS DO ANO', value: fmt(yearExpenses), color: 'var(--red)', sub: `${yearTxs.filter(t => t.type === 'out').length} saídas` },
          { label: 'LUCRO REAL DO ANO', value: fmt(yearProfit), color: yearProfit >= 0 ? 'var(--green)' : 'var(--red)', sub: `${yearMargem}% de margem` },
          { label: 'TICKET MÉDIO', value: fmt(avgTicket), color: '#6ee7b7', sub: 'por entrada' },
        ].map((k, i) => (
          <div key={i} className="card" style={{ borderColor: i === 0 ? 'var(--green-border)' : i === 1 ? 'rgba(239,68,68,0.15)' : undefined }}>
            <div className="card-title">{k.label}</div>
            <div className="card-value" style={{ color: k.color, fontSize: '22px' }}>{k.value}</div>
            <div className="card-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Gráfico anual por mês ──────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700 }}>Receita vs Despesas — mês a mês</div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: 'var(--text3)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--green)', display: 'inline-block' }} />Receita</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--red)', display: 'inline-block' }} />Despesas</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(110,231,183,0.4)', display: 'inline-block' }} />Lucro</span>
          </div>
        </div>

        {/* Barras verticais dos 12 meses */}
        {(() => {
          const maxVal = Math.max(...monthlyData.map(m => m.revenue), 1)
          return (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', height: '120px', marginBottom: '8px' }}>
              {monthlyData.map((m, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1px', justifyContent: 'flex-end' }}>
                    <div style={{ width: '100%', height: `${(m.revenue / maxVal) * 100}px`, background: 'var(--green)', opacity: 0.7, borderRadius: '3px 3px 0 0', minHeight: m.revenue > 0 ? '3px' : '0', transition: 'height 0.5s ease' }} />
                  </div>
                  <div style={{ width: '100%', height: `${(m.expenses / maxVal) * 100}px`, background: 'var(--red)', opacity: 0.6, borderRadius: '0 0 3px 3px', minHeight: m.expenses > 0 ? '3px' : '0', marginTop: '1px', transition: 'height 0.5s ease' }} />
                </div>
              ))}
            </div>
          )
        })()}
        <div style={{ display: 'flex', gap: '6px' }}>
          {monthlyData.map((m, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: '10px', color: 'var(--text3)', fontWeight: 600 }}>{m.month}</div>
          ))}
        </div>

        {/* Tabela resumo dos meses */}
        <div className="table-wrap" style={{ marginTop: '16px' }}>
          <table>
            <thead>
              <tr>
                <th>Mês</th>
                <th>Receita</th>
                <th>Despesas</th>
                <th>Lucro</th>
                <th>Margem</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((d, i) => {
                const margem = d.revenue > 0 ? ((d.profit / d.revenue) * 100).toFixed(0) : '—'
                const isEmpty = d.revenue === 0 && d.expenses === 0
                return (
                  <tr key={i} style={{ opacity: isEmpty ? 0.35 : 1 }}>
                    <td style={{ fontWeight: 600 }}>{d.month}</td>
                    <td className="tx-in">{d.revenue > 0 ? `+${fmt(d.revenue)}` : '—'}</td>
                    <td className="tx-out">{d.expenses > 0 ? `-${fmt(d.expenses)}` : '—'}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: d.profit >= 0 ? 'var(--green)' : 'var(--red)' }}>
                      {isEmpty ? '—' : fmt(d.profit)}
                    </td>
                    <td style={{ fontSize: '12px', color: parseFloat(margem) >= 50 ? 'var(--green)' : parseFloat(margem) >= 20 ? 'var(--amber)' : 'var(--text3)' }}>
                      {margem !== '—' ? `${margem}%` : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Categorias + Destaques ─────────────────────────────────────────── */}
      <div className="grid-21" style={{ marginBottom: '20px' }}>

        {/* Despesas por categoria */}
        <div className="card">
          <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>
            Despesas por categoria
            <span style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: 400, marginLeft: '8px' }}>ano {selectedYear}</span>
          </div>

          {expensesByCategory.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text3)', fontSize: '13px' }}>Nenhuma despesa registrada neste ano.</div>
          ) : expensesByCategory.map(([cat, val], i) => (
            <div key={i} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getCatColor(cat), flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{cat}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text3)' }}>{pctOf(val, yearExpenses)}%</span>
                  <span style={{ fontSize: '13px', fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--red)' }}>{fmt(val)}</span>
                </div>
              </div>
              <MiniBar value={val} max={maxCatValue} color={getCatColor(cat)} />
            </div>
          ))}

          {/* Receita por categoria */}
          {revenueByCategory.length > 0 && (
            <>
              <div style={{ fontSize: '13px', fontWeight: 700, margin: '20px 0 12px', paddingTop: '16px', borderTop: '1px solid var(--card-border)' }}>
                Receita por origem
              </div>
              {revenueByCategory.map(([cat, val], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getCatColor(cat), flexShrink: 0 }} />
                    <span style={{ fontSize: '13px' }}>{cat}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text3)' }}>{pctOf(val, yearRevenue)}%</span>
                    <span style={{ fontSize: '13px', fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--green)' }}>{fmt(val)}</span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Cards de destaque */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Saúde */}
          <div className="card card-green" style={{ textAlign: 'center', padding: '20px' }}>
            <div className="card-title" style={{ marginBottom: '8px' }}>SAÚDE DO NEGÓCIO</div>
            <HealthRing score={stats.healthScore} />
            <div style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '8px' }}>
              {stats.healthScore >= 70 ? 'Negócio saudável 🌟' : stats.healthScore >= 40 ? 'Atenção necessária ⚠️' : stats.healthScore > 0 ? 'Precisa de ajustes 🔧' : 'Sem dados ainda'}
            </div>
          </div>

          {/* Melhor mês */}
          {bestMonth.revenue > 0 && (
            <div className="card" style={{ background: 'rgba(16,185,129,0.06)', borderColor: 'var(--green-border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Melhor mês</div>
              <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--green)' }}>{bestMonth.month}</div>
              <div style={{ fontSize: '15px', fontFamily: 'var(--mono)', fontWeight: 700, color: '#6ee7b7', marginTop: '4px' }}>{fmt(bestMonth.revenue)}</div>
              <Sparkline values={monthlyData.map(m => m.revenue)} color="var(--green)" />
            </div>
          )}

          {/* Limite MEI */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: '10px' }}>LIMITE MEI {selectedYear}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '20px', fontWeight: 900, fontFamily: 'var(--mono)', color: limitColor }}>{pctLimit}%</span>
              <span style={{ fontSize: '12px', color: 'var(--text3)', alignSelf: 'flex-end' }}>de {fmt(81000)}</span>
            </div>
            <LimitBar value={yearRevenue} max={81000} color={limitColor} />
            <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '6px' }}>
              Restam {fmt(81000 - yearRevenue)}
            </div>
          </div>
        </div>
      </div>

      {/* ── DASN-SIMEI com dados reais ─────────────────────────────────────── */}
      <div className="card" style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.08),rgba(139,92,246,0.03))', border: '1px solid rgba(139,92,246,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800 }}>
              🧾 Dados para Declaração Anual (DASN-SIMEI) — {selectedYear}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '4px' }}>
              {isCurrentYear
                ? 'Dados parciais do ano em curso — atualizados em tempo real'
                : `Dados completos do ano ${selectedYear} — prontos para declaração`}
            </div>
          </div>
          <button
            className="btn-add"
            style={{ padding: '7px 14px', fontSize: '12px', background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)', color: '#a78bfa', flexShrink: 0 }}
            onClick={() => window.open('https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/dasnsimei.app/Identificacao', '_blank')}
          >
            Acessar DASN-SIMEI →
          </button>
        </div>

        <div className="grid-2" style={{ gap: '12px', marginBottom: '16px' }}>
          {[
            {
              label: 'Faturamento Total do Ano',
              value: fmt(yearRevenue),
              color: '#a78bfa',
              note: `${inTxCount} transações`,
              real: true,
            },
            {
              label: 'Despesas do Ano',
              value: fmt(yearExpenses),
              color: 'var(--red)',
              note: `${yearTxs.filter(t => t.type === 'out').length} lançamentos`,
              real: true,
            },
            {
              label: 'Lucro Real do Ano',
              value: fmt(yearProfit),
              color: yearProfit >= 0 ? 'var(--green)' : 'var(--red)',
              note: `Margem de ${yearMargem}%`,
              real: true,
            },
            {
              label: 'DAS Pagos no Ano',
              value: dasThisYear > 0 ? fmt(dasThisYear) : 'Não registrado',
              color: dasThisYear > 0 ? 'var(--amber)' : 'var(--text3)',
              note: dasThisYear > 0 ? `${dasHistory.filter(d => d.paid_date?.startsWith(String(selectedYear))).length} pagamentos` : 'Registre em Financeiro',
              real: dasThisYear > 0,
            },
          ].map((item, i) => (
            <div key={i} style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--card-border)', position: 'relative' }}>
              {/* Badge "real" */}
              <div style={{
                position: 'absolute', top: '10px', right: '10px',
                fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '99px',
                background: item.real ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                color: item.real ? 'var(--green)' : 'var(--amber)',
                border: `1px solid ${item.real ? 'var(--green-border)' : 'rgba(245,158,11,0.3)'}`,
              }}>
                {item.real ? '✓ real' : 'pendente'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text3)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px', paddingRight: '60px' }}>{item.label}</div>
              <div style={{ fontSize: '22px', fontWeight: 900, fontFamily: 'var(--mono)', color: item.color }}>{item.value}</div>
              <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>{item.note}</div>
            </div>
          ))}
        </div>

        <div style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '10px', padding: '14px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#a78bfa', marginBottom: '10px' }}>📌 O que você precisa saber sobre o IR como MEI:</div>
          {[
            '✅ A DASN-SIMEI declara o faturamento do seu negócio (não é o IR pessoal). Prazo: 31 de maio de cada ano.',
            '✅ Você também precisa declarar o IR pessoa física se recebeu mais de R$33.888 no ano.',
            '✅ O MEI é isento de IR sobre o lucro do negócio — só paga o DAS mensal fixo.',
            '⚠️ Se não declarar a DASN-SIMEI, paga multa de R$50 por mês de atraso.',
          ].map((tip, i) => (
            <div key={i} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', lineHeight: '1.6', marginBottom: i < 3 ? '6px' : 0 }}>{tip}</div>
          ))}
        </div>
      </div>
    </>
  )
}
