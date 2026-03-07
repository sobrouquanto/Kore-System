'use client'
import { useState, useMemo } from 'react'
import { useDashboard, fmt, pctOf, todayISO, formatDateBR } from '@/context/DashboardContext'
import { HealthRing, LimitBar, Chart6Months } from '@/components/ui'

export default function CockpitTab() {
  const { stats, transactions, chartData, setActiveTab } = useDashboard()

  const [selectedMonth, setSelectedMonth] = useState(todayISO().slice(0, 7))
  const [monthDropOpen, setMonthDropOpen] = useState(false)

  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date()
      d.setDate(1)
      d.setMonth(d.getMonth() - i)
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
        .replace(/^\w/, c => c.toUpperCase())
      return { value, label }
    })
  }, [])

  const filteredTransactions = useMemo(() =>
    transactions.filter((t: any) => t.date?.startsWith(selectedMonth)),
    [transactions, selectedMonth]
  )

  // ── Saldo acumulado: histórico total de todas as transações ──────────────
  const saldoAcumulado = useMemo(() =>
    transactions.reduce((acc: number, t: any) =>
      t.type === 'in' ? acc + t.value : acc - t.value, 0
    ),
    [transactions]
  )

  // ── Lucro Real: receita do mês − despesas do mês − DAS pago no mês ──────
  const thisMonth = todayISO().slice(0, 7)

  const dasPaidThisMonth = useMemo(() =>
    transactions.some(
      (t: any) => t.description === 'DAS Mensal' && t.type === 'out' && t.date?.startsWith(thisMonth)
    ),
    [transactions, thisMonth]
  )

  const dasValorMes = useMemo(() =>
    transactions
      .filter((t: any) => t.description === 'DAS Mensal' && t.type === 'out' && t.date?.startsWith(thisMonth))
      .reduce((acc: number, t: any) => acc + t.value, 0),
    [transactions, thisMonth]
  )

  const lucroReal = (stats.monthRevenueNet ?? stats.monthRevenue)
    - (stats.monthExpensesNet ?? stats.monthExpenses ?? 0)
    - dasValorMes

  const margem   = parseFloat(pctOf(lucroReal, stats.monthRevenueNet ?? stats.monthRevenue))
  const pctLimit = parseFloat(pctOf(stats.yearRevenue, 81000))
  const limitColor = pctLimit > 80 ? 'var(--red)' : pctLimit > 60 ? 'var(--amber)' : 'var(--green)'

  return (
    <>
      {/* ── Alerta DAS ─────────────────────────────────────────────────────── */}
      {!dasPaidThisMonth && (
        <div className="alert card-amber" style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '20px', flexShrink: 0 }}>⚠️</div>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '3px' }}>Lembre-se do DAS mensal</h4>
            <p style={{ fontSize: '12px', color: 'var(--text2)' }}>Pague até o dia 20 de cada mês para evitar multas e juros.</p>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', flexShrink: 0 }}>
            <button className="btn-add" style={{ padding: '7px 14px', fontSize: '12px', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: 'var(--amber)' }}
              onClick={() => setActiveTab('lancamentos')}>Registrar</button>
            <button className="btn-add" style={{ padding: '7px 14px', fontSize: '12px' }}
              onClick={() => window.open('https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao', '_blank')}>
              Pagar agora →
            </button>
          </div>
        </div>
      )}

      {/* ── Banner banco ───────────────────────────────────────────────────── */}
      {stats.bankSyncCount > 0 && selectedMonth === thisMonth && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', padding: '10px 14px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: '10px', fontSize: '13px', color: 'var(--text2)' }}>
          🏦 <strong style={{ color: '#93c5fd' }}>{stats.bankSyncCount}</strong> transações importadas do banco este mês —
          <button onClick={() => setActiveTab('lancamentos')} style={{ background: 'none', border: 'none', color: '#93c5fd', cursor: 'pointer', fontSize: '13px', padding: 0, marginLeft: '2px', fontFamily: 'inherit', fontWeight: 600 }}>
            ver tudo →
          </button>
        </div>
      )}

      {/* ── KPI Grid ───────────────────────────────────────────────────────── */}
      <div className="grid-4" style={{ marginBottom: '20px' }}>

        {/* Card 1: Saldo Acumulado (histórico total) */}
        <div className="card card-green">
          <div className="card-title">SALDO DO NEGÓCIO</div>
          <div className="card-value" style={{ color: saldoAcumulado >= 0 ? 'var(--green)' : 'var(--red)' }}>
            {fmt(saldoAcumulado)}
          </div>
          <div className="card-sub">Acumulado histórico</div>
        </div>

        {/* Card 2: Receita do mês */}
        <div className="card">
          <div className="card-title">RECEITA DO MÊS</div>
          <div className="card-value" style={{ color: '#6ee7b7' }}>
            {fmt(stats.monthRevenueNet ?? stats.monthRevenue)}
          </div>
          <div className="card-sub">Total de entradas</div>
        </div>

        {/* Card 3: Lucro Real (pós-DAS) */}
        <div className="card">
          <div className="card-title">LUCRO REAL</div>
          <div className="card-value" style={{ color: lucroReal >= 0 ? 'var(--green)' : 'var(--red)' }}>
            {fmt(lucroReal)}
          </div>
          <div style={{ fontSize: '12px', color: lucroReal >= 0 ? 'var(--green)' : 'var(--red)', marginTop: '6px', fontWeight: 700 }}>
            {margem}% margem · DAS deduzido
          </div>
        </div>

        {/* Card 4: Saúde */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center' }}>
          <HealthRing score={stats.healthScore} />
          <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>Saúde Financeira</div>
        </div>
      </div>

      {/* ── Limite MEI ─────────────────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700 }}>Limite Anual MEI</div>
            <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '2px' }}>{fmt(stats.yearRevenue)} de {fmt(81000)}</div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, fontFamily: 'var(--mono)', color: limitColor }}>{pctLimit}%</div>
        </div>
        <LimitBar value={stats.yearRevenue} max={81000} color={limitColor} />
        <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '6px' }}>
          {pctLimit >= 80 ? '🚨 Próximo do limite — considere migrar para ME.' : pctLimit >= 60 ? '⚠️ Acompanhe o crescimento.' : '✅ Limite anual sob controle.'}
        </div>
      </div>

      {/* ── Atividade + Tarefas ────────────────────────────────────────────── */}
      <div className="grid-21">
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexShrink: 0 }}>
            <div className="card-title" style={{ margin: 0 }}>ATIVIDADE RECENTE</div>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setMonthDropOpen(o => !o)}
                style={{ fontSize: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', borderRadius: '8px', padding: '5px 28px 5px 10px', color: 'var(--text)', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit', position: 'relative' }}
              >
                {monthOptions.find(m => m.value === selectedMonth)?.label}
                <span style={{ position: 'absolute', right: '8px', color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>▼</span>
              </button>
              {monthDropOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, background: '#111827', border: '1px solid var(--card-border)', borderRadius: '10px', overflow: 'hidden', zIndex: 200, minWidth: '180px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                  {monthOptions.map(m => (
                    <button key={m.value} onClick={() => { setSelectedMonth(m.value); setMonthDropOpen(false) }}
                      style={{ display: 'block', width: '100%', padding: '9px 14px', background: m.value === selectedMonth ? 'var(--green-dim)' : 'transparent', border: 'none', color: m.value === selectedMonth ? 'var(--green)' : 'var(--text2)', fontSize: '13px', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
                      {m.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ overflowY: 'auto', maxHeight: '420px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredTransactions.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text3)', fontSize: '13px' }}>
                Nenhuma movimentação neste mês.<br />
                <button className="btn-add" style={{ marginTop: '12px', fontSize: '12px', padding: '8px 16px' }}
                  onClick={() => setActiveTab('lancamentos')}>Fazer primeiro lançamento →</button>
              </div>
            ) : filteredTransactions.map((t: any) => (
              <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px', flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{
                    width: '32px', height: '32px', border: '1px solid var(--card-border)', borderRadius: '8px',
                    color: t.type === 'in' ? 'var(--green)' : 'var(--red)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
                    background: t.source === 'bank_sync'
                      ? (t.type === 'in' ? 'rgba(59,130,246,0.12)' : 'rgba(239,68,68,0.1)')
                      : (t.type === 'in' ? 'rgba(16,185,129,0.1)'  : 'rgba(239,68,68,0.1)'),
                  }}>
                    {t.source === 'bank_sync' ? '🏦' : (t.type === 'in' ? '↑' : '↓')}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 600 }}>{t.description}</div>
                      {t.is_personal && (
                        <span style={{ fontSize: '10px', color: 'var(--amber)', opacity: 0.7 }}>pessoal</span>
                      )}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text3)' }}>
                      {formatDateBR(t.date)} · {t.category}
                      {t.bank_name && <span style={{ color: '#93c5fd', marginLeft: '4px' }}>· {t.bank_name}</span>}
                    </div>
                  </div>
                </div>
                <div className={t.type === 'in' ? 'tx-in' : 'tx-out'}>{t.type === 'in' ? '+' : '-'}{fmt(t.value)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tarefas + mini chart */}
        <div className="card card-blue">
          <div className="card-title">⚡ TAREFAS DO DIA</div>
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              ['💰', 'Lance sua receita de hoje',      'lancamentos'],
              ['⚠️', 'Verifique o vencimento do DAS', 'financeiro'],
              ['🤖', 'Pergunte algo para a IA',        'ia'],
            ].map(([icon, text, tab], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none', cursor: 'pointer' }}
                onClick={() => setActiveTab(tab as any)}>
                <span style={{ fontSize: '16px' }}>{icon}</span>
                <span style={{ fontSize: '13px', lineHeight: '1.4' }}>{text}</span>
                <span style={{ marginLeft: 'auto', color: 'var(--blue)', fontSize: '12px' }}>→</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '20px', borderTop: '1px solid var(--card-border)', paddingTop: '16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '8px', letterSpacing: '1px' }}>TENDÊNCIA 6 MESES</div>
            <Chart6Months data={chartData} />
          </div>
        </div>
      </div>
    </>
  )
}
