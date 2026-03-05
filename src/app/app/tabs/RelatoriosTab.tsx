'use client'
// ─── RELATÓRIOS ───────────────────────────────────────────────────────────────
import { useDashboard, fmt, pctOf, formatDateBR } from '@/context/DashboardContext'
import { HealthRing, Chart6Months, LimitBar } from '@/components/ui'

export default function RelatoriosTab() {
  const { stats, chartData, dasHistory } = useDashboard()

  const margem = parseFloat(pctOf(stats.monthProfit, stats.monthRevenue))
  const pctLimit = parseFloat(pctOf(stats.yearRevenue, 81000))
  const limitColor = pctLimit > 80 ? 'var(--red)' : pctLimit > 60 ? 'var(--amber)' : 'var(--green)'

  return (
    <>
      <div className="card card-green" style={{ marginBottom: '20px', padding: '24px' }}>
        <div className="card-title">📊 RELATÓRIO CONSOLIDADO</div>
        <div style={{ fontSize: '16px', lineHeight: '1.8', marginTop: '8px', color: 'rgba(255,255,255,0.85)' }}>
          Faturamento anual: <strong style={{ color: 'var(--green)' }}>{fmt(stats.yearRevenue)}</strong> · Uso do limite: <strong style={{ color: limitColor }}>{pctLimit}%</strong> · Margem atual: <strong style={{ color: '#6ee7b7' }}>{margem}%</strong>
        </div>
      </div>

      <div className="grid-21" style={{ marginBottom: '20px' }}>
        <div className="card">
          <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>Histórico dos últimos 6 meses</div>
          <Chart6Months data={chartData} />
          <div className="table-wrap" style={{ marginTop: '16px' }}>
            <table>
              <thead><tr><th>Mês</th><th>Receita</th><th>Despesas</th><th>Lucro</th></tr></thead>
              <tbody>
                {chartData.map((d, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{d.month}</td>
                    <td className="tx-in">+{fmt(d.revenue)}</td>
                    <td className="tx-out">-{fmt(d.expenses)}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: d.revenue - d.expenses >= 0 ? 'var(--green)' : 'var(--red)' }}>{fmt(d.revenue - d.expenses)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="card card-green">
            <div className="card-title">SAÚDE DO NEGÓCIO</div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0' }}>
              <HealthRing score={stats.healthScore} />
              <div style={{ fontSize: '13px', color: 'var(--text2)', marginTop: '8px', textAlign: 'center' }}>
                {stats.healthScore >= 70 ? 'Negócio saudável 🌟' : stats.healthScore >= 40 ? 'Atenção necessária ⚠️' : 'Precisa de ajustes 🔧'}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-title">LIMITE MEI ANUAL</div>
            <div style={{ margin: '12px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px' }}>{fmt(stats.yearRevenue)}</span>
                <span style={{ fontSize: '13px', color: 'var(--text3)' }}>de {fmt(81000)}</span>
              </div>
              <LimitBar value={stats.yearRevenue} max={81000} color={limitColor} />
              <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '6px' }}>Restam {fmt(81000 - stats.yearRevenue)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* DASN-SIMEI */}
      <div className="card" style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.08),rgba(139,92,246,0.03))', border: '1px solid rgba(139,92,246,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800 }}>🧾 Relatório para Declaração Anual (DASN-SIMEI)</div>
            <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '4px' }}>Preencha a declaração anual até 31 de maio com esses dados</div>
          </div>
          <button className="btn-add" style={{ padding: '7px 14px', fontSize: '12px', background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)', color: '#a78bfa' }}
            onClick={() => window.open('https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/dasnsimei.app/Identificacao', '_blank')}>
            Acessar DASN-SIMEI →
          </button>
        </div>
        <div className="grid-2" style={{ gap: '12px', marginBottom: '16px' }}>
          {[
            ['Faturamento Total do Ano', fmt(stats.yearRevenue), '#a78bfa'],
            ['Despesas do Ano (estimado)', fmt(stats.monthExpenses * 12), 'var(--red)'],
            ['Lucro Estimado Anual', fmt(stats.monthProfit * 12), 'var(--green)'],
            ['DAS Pagos no Ano', fmt(dasHistory.reduce((s, d) => s + d.value, 0) || 76.90 * 12), 'var(--amber)'],
          ].map(([label, value, color], i) => (
            <div key={i} style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--card-border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text3)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</div>
              <div style={{ fontSize: '22px', fontWeight: 900, fontFamily: 'var(--mono)', color: color as string }}>{value}</div>
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
