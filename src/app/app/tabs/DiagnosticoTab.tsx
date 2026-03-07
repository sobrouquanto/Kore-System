'use client'

// ─── DIAGNÓSTICO FINANCEIRO ───────────────────────────────────────────────────
import { useMemo } from 'react'
import { useDashboard, fmt, pctOf, todayISO } from '@/context/DashboardContext'

// ── Tipos internos ────────────────────────────────────────────────────────────
type AlertLevel = 'danger' | 'warning' | 'success' | 'info'

interface Alert {
  level: AlertLevel
  icon: string
  title: string
  detail: string
}

interface ScoreFactor {
  label: string
  score: number   // 0-100
  weight: number  // % do total
  detail: string
}

// ── Cores por nível ───────────────────────────────────────────────────────────
const LEVEL_COLOR: Record<AlertLevel, string> = {
  danger:  'var(--red)',
  warning: 'var(--amber)',
  success: 'var(--green)',
  info:    '#93c5fd',
}
const LEVEL_BG: Record<AlertLevel, string> = {
  danger:  'rgba(239,68,68,0.07)',
  warning: 'rgba(245,158,11,0.07)',
  success: 'rgba(16,185,129,0.07)',
  info:    'rgba(59,130,246,0.07)',
}
const LEVEL_BORDER: Record<AlertLevel, string> = {
  danger:  'rgba(239,68,68,0.2)',
  warning: 'rgba(245,158,11,0.2)',
  success: 'rgba(16,185,129,0.2)',
  info:    'rgba(59,130,246,0.2)',
}

export default function DiagnosticoTab() {
  const { stats, transactions, chartData, receivables } = useDashboard()

  const thisMonth = todayISO().slice(0, 7)
  const lastMonthDate = new Date(); lastMonthDate.setMonth(lastMonthDate.getMonth() - 1)
  const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`

  // ── Métricas do mês atual ─────────────────────────────────────────────────
  const revenue  = stats.monthRevenueNet  ?? stats.monthRevenue
  const expenses = stats.monthExpensesNet ?? stats.monthExpenses
  const profit   = stats.monthProfitNet   ?? stats.monthProfit
  const margem   = revenue > 0 ? (profit / revenue) * 100 : 0
  const pctLimit = parseFloat(pctOf(stats.yearRevenue, 81000))

  // ── Dados do mês anterior (via chartData — últimos 6 meses) ──────────────
  const prevChartMonth = chartData.length >= 2 ? chartData[chartData.length - 2] : null
  const prevRevenue    = prevChartMonth?.revenue  ?? 0
  const prevExpenses   = prevChartMonth?.expenses ?? 0
  const prevProfit     = prevRevenue - prevExpenses
  const prevMargem     = prevRevenue > 0 ? (prevProfit / prevRevenue) * 100 : 0

  const revDelta     = prevRevenue  > 0 ? ((revenue  - prevRevenue)  / prevRevenue)  * 100 : 0
  const expDelta     = prevExpenses > 0 ? ((expenses - prevExpenses) / prevExpenses) * 100 : 0
  const profitDelta  = prevProfit   !== 0 ? ((profit  - prevProfit)  / Math.abs(prevProfit)) * 100 : 0

  // ── DAS pago este mês ─────────────────────────────────────────────────────
  const dasPaidThisMonth = useMemo(() =>
    transactions.some(t => t.description === 'DAS Mensal' && t.type === 'out' && t.date?.startsWith(thisMonth)),
    [transactions, thisMonth]
  )

  const diaAtual = new Date().getDate()
  const dasVencendo = !dasPaidThisMonth && diaAtual >= 15

  // ── Cobranças vencidas ────────────────────────────────────────────────────
  const overdueReceivables = receivables.filter(r => r.status === 'overdue')
  const overdueValue = overdueReceivables.reduce((s, r) => s + r.value, 0)

  // ── Previsão "se continuar assim" ─────────────────────────────────────────
  // Projeta com base na média dos últimos 3 meses disponíveis
  const last3 = chartData.slice(-3)
  const avgRevenue  = last3.length > 0 ? last3.reduce((s, m) => s + m.revenue,  0) / last3.length : 0
  const avgExpenses = last3.length > 0 ? last3.reduce((s, m) => s + m.expenses, 0) / last3.length : 0
  const avgProfit   = avgRevenue - avgExpenses

  const monthsUsed = new Date().getMonth() // 0=jan
  const remainingMonths = 12 - monthsUsed - 1
  const projYearRevenue = stats.yearRevenue + avgRevenue * remainingMonths
  const projYearProfit  = chartData.reduce((s, m) => s + (m.revenue - m.expenses), 0) + avgProfit * remainingMonths
  const projLimitPct    = Math.min(100, (projYearRevenue / 81000) * 100)
  const mesesAteLimit   = avgRevenue > 0 ? Math.max(0, (81000 - stats.yearRevenue) / avgRevenue) : null

  // ── Alertas inteligentes ──────────────────────────────────────────────────
  const alerts = useMemo<Alert[]>(() => {
    const list: Alert[] = []

    // DAS vencendo
    if (!dasPaidThisMonth) {
      if (diaAtual >= 18) {
        list.push({ level: 'danger', icon: '🚨', title: 'DAS vence em breve!', detail: `Dia ${diaAtual} de ${new Date().toLocaleString('pt-BR', { month: 'long' })}. Vence dia 20. Pague agora para evitar multa.` })
      } else if (diaAtual >= 15) {
        list.push({ level: 'warning', icon: '⚠️', title: 'DAS ainda não pago', detail: `Você tem até o dia 20 para pagar. Faltam ${20 - diaAtual} dias.` })
      } else {
        list.push({ level: 'info', icon: '📅', title: 'DAS pendente este mês', detail: `Lembre-se de pagar o DAS até o dia 20 para evitar multas.` })
      }
    } else {
      list.push({ level: 'success', icon: '✅', title: 'DAS pago este mês', detail: 'Obrigação fiscal do mês em dia.' })
    }

    // Lucro caiu vs mês anterior
    if (prevProfit > 0 && profitDelta < -20) {
      list.push({ level: 'danger', icon: '📉', title: `Lucro caiu ${Math.abs(profitDelta).toFixed(0)}% vs mês anterior`, detail: `Mês passado: ${fmt(prevProfit)} → Este mês: ${fmt(profit)}. Verifique se houve queda de receita ou aumento de despesas.` })
    } else if (prevProfit > 0 && profitDelta < -5) {
      list.push({ level: 'warning', icon: '📊', title: `Lucro caiu ${Math.abs(profitDelta).toFixed(0)}% vs mês anterior`, detail: `Mês passado: ${fmt(prevProfit)} → Este mês: ${fmt(profit)}. Acompanhe a tendência.` })
    } else if (prevProfit > 0 && profitDelta > 10) {
      list.push({ level: 'success', icon: '📈', title: `Lucro subiu ${profitDelta.toFixed(0)}% vs mês anterior`, detail: `Mês passado: ${fmt(prevProfit)} → Este mês: ${fmt(profit)}. Ótimo desempenho!` })
    }

    // Despesas subiram muito
    if (prevExpenses > 0 && expDelta > 30) {
      list.push({ level: 'danger', icon: '💸', title: `Despesas subiram ${expDelta.toFixed(0)}%`, detail: `De ${fmt(prevExpenses)} para ${fmt(expenses)}. Revise se há gastos inesperados.` })
    } else if (prevExpenses > 0 && expDelta > 15) {
      list.push({ level: 'warning', icon: '💰', title: `Despesas subiram ${expDelta.toFixed(0)}%`, detail: `De ${fmt(prevExpenses)} para ${fmt(expenses)}. Acompanhe de perto.` })
    }

    // Margem baixa
    if (revenue > 0 && margem < 20) {
      list.push({ level: 'danger', icon: '⚠️', title: 'Margem muito baixa', detail: `${margem.toFixed(1)}% de margem líquida. O ideal para MEI é acima de 40%. Revise preços e despesas.` })
    } else if (revenue > 0 && margem < 40) {
      list.push({ level: 'warning', icon: '📊', title: 'Margem abaixo do ideal', detail: `${margem.toFixed(1)}% de margem. Tente chegar a 40-60% reduzindo custos ou ajustando preços.` })
    } else if (revenue > 0 && margem >= 60) {
      list.push({ level: 'success', icon: '🌟', title: 'Margem excelente', detail: `${margem.toFixed(1)}% de margem líquida. Você está acima da média do mercado!` })
    }

    // Limite MEI
    if (pctLimit >= 90) {
      list.push({ level: 'danger', icon: '🚨', title: `Limite MEI em ${pctLimit.toFixed(0)}%`, detail: `Faturamento anual de ${fmt(stats.yearRevenue)} de ${fmt(81000)}. Considere migrar para ME com urgência.` })
    } else if (pctLimit >= 75) {
      list.push({ level: 'warning', icon: '📋', title: `Limite MEI em ${pctLimit.toFixed(0)}%`, detail: `Restam ${fmt(81000 - stats.yearRevenue)} para o teto anual. Planeje a migração para ME.` })
    }

    // Cobranças vencidas
    if (overdueReceivables.length > 0) {
      list.push({ level: 'warning', icon: '🔔', title: `${overdueReceivables.length} cobrança${overdueReceivables.length > 1 ? 's' : ''} vencida${overdueReceivables.length > 1 ? 's'  : ''}`, detail: `Total de ${fmt(overdueValue)} em atraso. Acesse a aba Clientes para cobrar.` })
    }

    // Sem lançamentos este mês
    if (revenue === 0 && expenses === 0) {
      list.push({ level: 'info', icon: '📝', title: 'Nenhum lançamento este mês', detail: 'Registre suas receitas e despesas para ter um diagnóstico preciso.' })
    }

    return list
  }, [stats, transactions, receivables, dasPaidThisMonth, profit, prevProfit, expenses, prevExpenses, margem, pctLimit, overdueReceivables])

  // ── Fatores do score de saúde ─────────────────────────────────────────────
  const scoreFactors = useMemo<ScoreFactor[]>(() => {
    const margemScore   = revenue > 0 ? Math.min(100, (margem / 60) * 100) : 0
    const limiteScore   = Math.min(100, ((81000 - stats.yearRevenue) / 81000) * 100)
    const dasScore      = dasPaidThisMonth ? 100 : diaAtual > 20 ? 0 : Math.max(0, ((20 - diaAtual) / 20) * 100)
    const overdueScore  = overdueReceivables.length === 0 ? 100 : Math.max(0, 100 - overdueReceivables.length * 25)
    const tendenciaScore = profitDelta >= 0 ? 100 : Math.max(0, 100 + profitDelta)

    return [
      {
        label: 'Margem de lucro',
        score: Math.round(margemScore),
        weight: 35,
        detail: `${margem.toFixed(1)}% de margem · ideal ≥ 40%`,
      },
      {
        label: 'Uso do limite MEI',
        score: Math.round(limiteScore),
        weight: 25,
        detail: `${pctLimit.toFixed(1)}% usado · restam ${fmt(81000 - stats.yearRevenue)}`,
      },
      {
        label: 'Obrigações fiscais',
        score: Math.round(dasScore),
        weight: 20,
        detail: dasPaidThisMonth ? 'DAS pago este mês ✅' : `DAS pendente · vence dia 20`,
      },
      {
        label: 'Cobranças em dia',
        score: Math.round(overdueScore),
        weight: 10,
        detail: overdueReceivables.length === 0
          ? 'Nenhuma cobrança vencida ✅'
          : `${overdueReceivables.length} cobrança${overdueReceivables.length > 1 ? 's' : ''} vencida${overdueReceivables.length > 1 ? 's' : ''}`,
      },
      {
        label: 'Tendência de lucro',
        score: Math.round(tendenciaScore),
        weight: 10,
        detail: profitDelta === 0
          ? 'Sem comparativo ainda'
          : `${profitDelta >= 0 ? '+' : ''}${profitDelta.toFixed(1)}% vs mês anterior`,
      },
    ]
  }, [stats, margem, pctLimit, dasPaidThisMonth, diaAtual, overdueReceivables, profitDelta])

  const scoreCalculado = Math.round(
    scoreFactors.reduce((s, f) => s + (f.score * f.weight) / 100, 0)
  )

  const scoreColor = scoreCalculado >= 70 ? 'var(--green)' : scoreCalculado >= 40 ? 'var(--amber)' : 'var(--red)'
  const scoreLabel = scoreCalculado >= 70 ? 'Negócio saudável 🌟' : scoreCalculado >= 40 ? 'Atenção necessária ⚠️' : 'Precisa de ajustes 🔧'

  // ── Delta helper ──────────────────────────────────────────────────────────
  function DeltaBadge({ value, inverse = false }: { value: number; inverse?: boolean }) {
    if (Math.abs(value) < 0.5) return <span style={{ fontSize: '12px', color: 'var(--text3)' }}>—</span>
    const positive = inverse ? value < 0 : value > 0
    const color = positive ? 'var(--green)' : 'var(--red)'
    return (
      <span style={{ fontSize: '12px', fontWeight: 700, color }}>
        {value > 0 ? '▲' : '▼'} {Math.abs(value).toFixed(1)}%
      </span>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="card card-blue" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="card-title" style={{ fontSize: '16px' }}>🩺 DIAGNÓSTICO FINANCEIRO</div>
            <div style={{ fontSize: '13px', color: 'var(--text2)', marginTop: '4px' }}>
              Análise automática baseada nos seus lançamentos
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '42px', fontWeight: 900, fontFamily: 'var(--mono)', color: scoreColor, lineHeight: 1 }}>
              {scoreCalculado}
            </div>
            <div style={{ fontSize: '12px', color: scoreColor, marginTop: '4px', fontWeight: 700 }}>{scoreLabel}</div>
          </div>
        </div>
      </div>

      <div className="grid-21">

        {/* ── COLUNA ESQUERDA ────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Alertas inteligentes */}
          <div className="card">
            <div className="card-title">🔔 ALERTAS INTELIGENTES</div>
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {alerts.map((a, i) => (
                <div key={i} style={{
                  display: 'flex', gap: '12px', alignItems: 'flex-start',
                  padding: '12px 14px', borderRadius: '10px',
                  background: LEVEL_BG[a.level],
                  border: `1px solid ${LEVEL_BORDER[a.level]}`,
                }}>
                  <span style={{ fontSize: '18px', flexShrink: 0, marginTop: '1px' }}>{a.icon}</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: LEVEL_COLOR[a.level], marginBottom: '3px' }}>{a.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text2)', lineHeight: '1.5' }}>{a.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comparação mês anterior */}
          <div className="card">
            <div className="card-title">📅 COMPARAÇÃO COM MÊS ANTERIOR</div>
            {prevChartMonth ? (
              <div style={{ marginTop: '12px' }}>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Métrica</th>
                        <th>Mês anterior</th>
                        <th>Este mês</th>
                        <th>Variação</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ color: 'var(--text2)' }}>Receita</td>
                        <td style={{ fontFamily: 'var(--mono)', color: 'var(--text2)' }}>{fmt(prevRevenue)}</td>
                        <td className="tx-in">+{fmt(revenue)}</td>
                        <td><DeltaBadge value={revDelta} /></td>
                      </tr>
                      <tr>
                        <td style={{ color: 'var(--text2)' }}>Despesas</td>
                        <td style={{ fontFamily: 'var(--mono)', color: 'var(--text2)' }}>{fmt(prevExpenses)}</td>
                        <td className="tx-out">-{fmt(expenses)}</td>
                        <td><DeltaBadge value={expDelta} inverse /></td>
                      </tr>
                      <tr>
                        <td style={{ color: 'var(--text2)', fontWeight: 700 }}>Lucro</td>
                        <td style={{ fontFamily: 'var(--mono)', color: 'var(--text2)' }}>{fmt(prevProfit)}</td>
                        <td style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: profit >= 0 ? 'var(--green)' : 'var(--red)' }}>{fmt(profit)}</td>
                        <td><DeltaBadge value={profitDelta} /></td>
                      </tr>
                      <tr>
                        <td style={{ color: 'var(--text2)' }}>Margem</td>
                        <td style={{ fontFamily: 'var(--mono)', color: 'var(--text2)' }}>{prevMargem.toFixed(1)}%</td>
                        <td style={{ fontFamily: 'var(--mono)', color: margem >= 40 ? 'var(--green)' : 'var(--amber)' }}>{margem.toFixed(1)}%</td>
                        <td><DeltaBadge value={margem - prevMargem} /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: '12px', padding: '20px', textAlign: 'center', color: 'var(--text3)', fontSize: '13px' }}>
                Dados insuficientes para comparação. Lance transações por pelo menos 2 meses.
              </div>
            )}
          </div>
        </div>

        {/* ── COLUNA DIREITA ─────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Score explicado */}
          <div className="card">
            <div className="card-title">🏆 SCORE DE SAÚDE — {scoreCalculado}/100</div>
            <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {scoreFactors.map((f, i) => {
                const barColor = f.score >= 70 ? 'var(--green)' : f.score >= 40 ? 'var(--amber)' : 'var(--red)'
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                      <div>
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>{f.label}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text3)', marginLeft: '6px' }}>({f.weight}% do score)</span>
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 800, fontFamily: 'var(--mono)', color: barColor }}>{f.score}</span>
                    </div>
                    {/* Barra de progresso */}
                    <div style={{ height: '6px', borderRadius: '99px', background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${f.score}%`, background: barColor, borderRadius: '99px', transition: 'width 0.4s ease' }} />
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>{f.detail}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Previsão "se continuar assim" */}
          <div className="card" style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.06),rgba(59,130,246,0.04))', border: '1px solid rgba(139,92,246,0.18)' }}>
            <div className="card-title">🔮 PREVISÃO — SE CONTINUAR ASSIM</div>
            <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px', marginBottom: '14px' }}>
              Baseado na média dos últimos {last3.length} meses
            </div>

            {avgRevenue > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                {[
                  { label: 'Receita média mensal',   value: fmt(avgRevenue),       color: 'var(--green)' },
                  { label: 'Despesa média mensal',   value: fmt(avgExpenses),      color: 'var(--red)' },
                  { label: 'Lucro médio mensal',     value: fmt(avgProfit),        color: avgProfit >= 0 ? 'var(--green)' : 'var(--red)' },
                  { label: 'Faturamento anual proj.', value: fmt(projYearRevenue), color: '#a78bfa' },
                  { label: 'Lucro anual projetado',  value: fmt(projYearProfit),   color: '#a78bfa' },
                ].map(({ label, value, color }, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text2)' }}>{label}</span>
                    <span style={{ fontSize: '14px', fontWeight: 800, fontFamily: 'var(--mono)', color }}>{value}</span>
                  </div>
                ))}

                {/* Alerta de limite projetado */}
                <div style={{
                  marginTop: '4px', padding: '12px 14px', borderRadius: '10px',
                  background: projLimitPct >= 100 ? 'rgba(239,68,68,0.08)' : projLimitPct >= 80 ? 'rgba(245,158,11,0.08)' : 'rgba(16,185,129,0.08)',
                  border: `1px solid ${projLimitPct >= 100 ? 'rgba(239,68,68,0.2)' : projLimitPct >= 80 ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)'}`,
                }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: projLimitPct >= 100 ? 'var(--red)' : projLimitPct >= 80 ? 'var(--amber)' : 'var(--green)', marginBottom: '4px' }}>
                    {projLimitPct >= 100 ? '🚨 Vai ultrapassar o limite MEI este ano' : projLimitPct >= 80 ? '⚠️ Próximo do limite ao final do ano' : '✅ Dentro do limite MEI ao final do ano'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text2)' }}>
                    {mesesAteLimit !== null && mesesAteLimit < 12
                      ? `Estimativa: bate R$81.000 em ${mesesAteLimit < 1 ? 'menos de 1 mês' : `${mesesAteLimit.toFixed(1)} meses`}`
                      : `Projeção anual: ${fmt(projYearRevenue)} (${projLimitPct.toFixed(0)}% do limite)`}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text3)', fontSize: '13px' }}>
                Lance transações para gerar previsões.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
