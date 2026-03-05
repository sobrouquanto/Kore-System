'use client'
import { useState } from 'react'
import { useDashboard, fmt, pctOf, formatDateBR } from '@/context/DashboardContext'
import { HealthRing, Chart6Months, LimitBar, SectionHeader, EmptyState } from '@/components/ui'

export default function FinanceiroTab() {
  const { stats, chartData, transactions, dasHistory, addDasHistory } = useDashboard()
  const [dasModal, setDasModal] = useState(false)
  const [dasRefMonth, setDasRefMonth] = useState('')
  const [dasValue, setDasValue] = useState('76.90')
  const [dasPaidDate, setDasPaidDate] = useState(new Date().toISOString().split('T')[0])
  const [dasReceipt, setDasReceipt] = useState('')

  const margem = parseFloat(pctOf(stats.monthProfit, stats.monthRevenue))
  const pctLimit = parseFloat(pctOf(stats.yearRevenue, 81000))
  const limitColor = pctLimit > 80 ? 'var(--red)' : pctLimit > 60 ? 'var(--amber)' : 'var(--green)'
  const proLabore = stats.monthProfit * 0.5

  async function handleAddDas() {
    if (!dasRefMonth || !dasValue) return
    await addDasHistory(dasRefMonth, parseFloat(dasValue), dasPaidDate, dasReceipt)
    setDasRefMonth(''); setDasValue('76.90'); setDasReceipt(''); setDasModal(false)
  }

  function exportCSV() {
    const header = 'Data,Descricao,Tipo,Categoria,Valor\n'
    const rows = transactions.map(t =>
      t.date + ',"' + t.description + '",' + (t.type === 'in' ? 'Entrada' : 'Saida') + ',"' + t.category + '",' + (t.type === 'in' ? '+' : '-') + t.value.toFixed(2)
    ).join('\n')
    const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url
    a.download = 'mei360_financeiro_' + new Date().toISOString().slice(0, 7) + '.csv'
    a.click(); URL.revokeObjectURL(url)
  }

  return (
    <>
      {dasModal && (
        <div className="modal-overlay" onClick={() => setDasModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>Registrar DAS Pago</div>
            <div style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '20px' }}>Mantenha o histórico de pagamentos em dia</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-row">
                <div className="form-group-sm"><label>Mês de Competência *</label><input value={dasRefMonth} onChange={e => setDasRefMonth(e.target.value)} placeholder="Ex: Jan/2025" /></div>
                <div className="form-group-sm"><label>Valor (R$)</label><input type="number" value={dasValue} onChange={e => setDasValue(e.target.value)} /></div>
              </div>
              <div className="form-row">
                <div className="form-group-sm"><label>Data do Pagamento</label><input type="date" value={dasPaidDate} onChange={e => setDasPaidDate(e.target.value)} /></div>
                <div className="form-group-sm"><label>Número do Recibo</label><input value={dasReceipt} onChange={e => setDasReceipt(e.target.value)} placeholder="Opcional" /></div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button className="btn-ghost-sm" onClick={() => setDasModal(false)} style={{ flex: 1 }}>Cancelar</button>
                <button className="btn-add" onClick={handleAddDas} style={{ flex: 2 }}>Salvar ✓</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resumo narrativo */}
      <div className="card card-green" style={{ marginBottom: '20px', padding: '24px' }}>
        <div className="card-title">RELATÓRIO MENSAL</div>
        <div style={{ fontSize: '16px', lineHeight: '1.8', marginTop: '8px', color: 'rgba(255,255,255,0.85)' }}>
          Você <strong style={{ color: 'var(--green)' }}>faturou {fmt(stats.monthRevenue)}</strong> este mês,
          gastou <strong style={{ color: 'var(--red)' }}>{fmt(stats.monthExpenses)}</strong> em custos,
          e teve um <strong style={{ color: '#6ee7b7' }}>lucro real de {fmt(stats.monthProfit)}</strong> —
          margem de <strong style={{ color: '#6ee7b7' }}>{margem}%</strong>. {margem >= 50 ? '🎉' : '💡'}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid-4" style={{ marginBottom: '20px' }}>
        <div className="card"><div className="card-title">RECEITA TOTAL</div><div className="card-value" style={{ color: '#6ee7b7' }}>{fmt(stats.monthRevenue)}</div></div>
        <div className="card"><div className="card-title">CUSTOS TOTAIS</div><div className="card-value" style={{ color: 'var(--red)' }}>{fmt(stats.monthExpenses)}</div></div>
        <div className="card card-green"><div className="card-title">LUCRO LÍQUIDO</div><div className="card-value" style={{ color: 'var(--green)' }}>{fmt(stats.monthProfit)}</div></div>
        <div className="card"><div className="card-title">PRÓ-LABORE SUGERIDO</div><div className="card-value" style={{ fontSize: '22px', color: 'var(--amber)' }}>{fmt(proLabore)}</div><div className="card-sub">50% do lucro</div></div>
      </div>

      {/* Gráfico + Separação */}
      <div className="grid-21" style={{ marginBottom: '20px' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700 }}>Receita × Despesas (6 meses)</div>
            <div style={{ display: 'flex', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text3)' }}><div style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--green)' }} />Receita</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text3)' }}><div style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'rgba(239,68,68,0.5)' }} />Despesa</div>
            </div>
          </div>
          <Chart6Months data={chartData} />
        </div>
        <div className="card">
          <div className="card-title">SEPARAÇÃO DO LUCRO</div>
          {[
            { l: 'Pró-labore', v: proLabore, p: 50, c: 'var(--green)' },
            { l: 'Reinvestimento', v: stats.monthProfit * 0.3, p: 30, c: 'var(--blue)' },
            { l: 'Reserva', v: stats.monthProfit * 0.15, p: 15, c: '#8b5cf6' },
            { l: 'Impostos', v: stats.monthProfit * 0.05, p: 5, c: 'var(--amber)' },
          ].map((s, i) => (
            <div key={i} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontSize: '13px' }}>{s.l}</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: s.c, fontFamily: 'var(--mono)' }}>{fmt(s.v)}</span>
              </div>
              <div style={{ height: '5px', background: 'rgba(255,255,255,0.07)', borderRadius: '99px' }}>
                <div style={{ height: '100%', width: `${s.p}%`, background: s.c, borderRadius: '99px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Limite MEI */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700 }}>⚠️ Limite Anual MEI — R$81.000</div>
            <div style={{ fontSize: '13px', color: 'var(--text3)', marginTop: '4px' }}>Faturamento acumulado: {fmt(stats.yearRevenue)} ({pctLimit}%)</div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, fontFamily: 'var(--mono)', color: limitColor }}>{pctLimit}%</div>
        </div>
        <LimitBar value={stats.yearRevenue} max={81000} color={limitColor} />
        <div style={{ marginTop: '10px', fontSize: '13px', color: 'var(--text3)' }}>Restam {fmt(81000 - stats.yearRevenue)} antes de ultrapassar o limite anual.</div>
      </div>

      {/* Export */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
        <button onClick={exportCSV} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'var(--text2)', padding: '8px 14px', borderRadius: '9px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
          📥 Exportar CSV
        </button>
      </div>

      {/* Histórico DAS */}
      <div className="card">
        <SectionHeader
          title="📅 Histórico de DAS Pagos"
          sub="Comprovante de regularidade fiscal"
          action={<button className="btn-add" style={{ padding: '7px 14px', fontSize: '12px' }} onClick={() => setDasModal(true)}>+ Registrar DAS</button>}
        />
        {dasHistory.length === 0 ? (
          <EmptyState text="Nenhum DAS registrado." action={
            <button className="btn-add" style={{ fontSize: '12px', padding: '8px 16px' }} onClick={() => setDasModal(true)}>Registrar primeiro DAS →</button>
          } />
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Competência</th><th>Valor</th><th>Data Pgto</th><th>Nº Recibo</th></tr></thead>
              <tbody>{dasHistory.map(d => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 600 }}>{d.reference_month}</td>
                  <td className="tx-out">{fmt(d.value)}</td>
                  <td style={{ color: 'var(--text3)', fontSize: '12px' }}>{formatDateBR(d.paid_date)}</td>
                  <td style={{ color: 'var(--text3)', fontSize: '12px', fontFamily: 'var(--mono)' }}>{d.receipt_number || '—'}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
