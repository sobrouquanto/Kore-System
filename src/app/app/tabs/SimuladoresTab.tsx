'use client'
import { useState } from 'react'
import { useDashboard, fmt } from '@/context/DashboardContext'

export default function SimuladoresTab() {
  const { stats } = useDashboard()

  const [simCusto, setSimCusto] = useState(80)
  const [simHoras, setSimHoras] = useState(4)
  const [simMargem, setSimMargem] = useState(35)
  const [projFat, setProjFat] = useState(0)
  const [projMed, setProjMed] = useState(0)

  const simBase = simCusto + simHoras * 25
  const simPreco = simBase / Math.max(1 - simMargem / 100, 0.01)
  const projRem = Math.max(0, 81000 - projFat)
  const projMeses = projMed > 0 ? projRem / projMed : 0
  const projColor = projMeses < 3 ? 'var(--red)' : projMeses < 6 ? 'var(--amber)' : 'var(--green)'
  const lucro = stats.monthProfit

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="grid-2">
        {/* Calculadora de Preço */}
        <div className="card">
          <div className="card-title">🎯 CALCULADORA DE PRECIFICAÇÃO</div>
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="form-group-sm">
              <label>Custo do serviço/produto (R$)</label>
              <input type="number" value={simCusto} onChange={e => setSimCusto(parseFloat(e.target.value) || 0)} />
            </div>
            <div className="form-group-sm">
              <label>Horas trabalhadas</label>
              <input type="number" value={simHoras} onChange={e => setSimHoras(parseFloat(e.target.value) || 0)} />
            </div>
            <div className="form-group-sm">
              <label>Margem desejada (%)</label>
              <input type="number" value={simMargem} onChange={e => setSimMargem(parseFloat(e.target.value) || 0)} />
            </div>
            <div style={{ background: 'var(--green-dim)', border: '1px solid var(--green-border)', borderRadius: '10px', padding: '16px', textAlign: 'center', marginTop: '4px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text3)', letterSpacing: '1px', marginBottom: '4px' }}>PREÇO SUGERIDO</div>
              <div style={{ fontSize: '32px', fontWeight: 900, fontFamily: 'var(--mono)', color: 'var(--green)' }}>{fmt(simPreco)}</div>
              <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '4px' }}>Custo base: {fmt(simBase)} · Lucro: {fmt(simPreco - simBase)}</div>
            </div>
          </div>
        </div>

        {/* Projeção Limite MEI */}
        <div className="card">
          <div className="card-title">📈 PROJEÇÃO DO LIMITE MEI</div>
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="form-group-sm">
              <label>Faturamento atual no ano (R$)</label>
              <input type="number" value={projFat} onChange={e => setProjFat(parseFloat(e.target.value) || 0)} />
            </div>
            <div className="form-group-sm">
              <label>Média mensal (R$)</label>
              <input type="number" value={projMed} onChange={e => setProjMed(parseFloat(e.target.value) || 0)} />
            </div>
            <div style={{ background: `rgba(${projMeses < 3 ? '239,68,68' : projMeses < 6 ? '245,158,11' : '16,185,129'},0.1)`, border: `1px solid rgba(${projMeses < 3 ? '239,68,68' : projMeses < 6 ? '245,158,11' : '16,185,129'},0.25)`, borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontSize: '13px', lineHeight: '1.8' }}>
                <div>Restam: <strong style={{ color: projColor }}>{fmt(projRem)}</strong></div>
                <div>Tempo estimado: <strong style={{ color: projColor }}>{projMeses.toFixed(1)} meses</strong></div>
                <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--text3)' }}>
                  {projMeses < 1 ? '🚨 Atingirá o limite este mês!' : projMeses < 3 ? '🚨 Crítico — planeje a migração para ME.' : projMeses < 6 ? '⚠️ Acompanhe o crescimento mensalmente.' : '✅ Você está confortável. Continue crescendo!'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pró-labore */}
      <div className="card">
        <div className="card-title">💰 SIMULADOR DE PRÓ-LABORE</div>
        <div style={{ fontSize: '13px', color: 'var(--text2)', margin: '10px 0 14px' }}>
          Baseado no lucro atual de <strong style={{ color: 'var(--green)' }}>{fmt(lucro)}</strong> este mês:
        </div>
        <div className="grid-2" style={{ gap: '10px' }}>
          {[
            { l: 'Conservador (40%)', p: 0.4, c: 'var(--blue)', desc: 'Foco em reinvestimento' },
            { l: 'Recomendado (50%)', p: 0.5, c: 'var(--green)', desc: 'Equilíbrio ideal para MEI' },
            { l: 'Agressivo (60%)', p: 0.6, c: 'var(--amber)', desc: 'Maximize o salário agora' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--card-border)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '6px' }}>{s.l}</div>
              <div style={{ fontFamily: 'var(--mono)', fontWeight: 800, color: s.c, fontSize: '22px' }}>{fmt(lucro * s.p)}</div>
              <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>{s.desc}</div>
            </div>
          ))}
          <div style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--card-border)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '8px', fontWeight: 700 }}>Distribuição recomendada</div>
            {[{ l: 'Pró-labore', p: 0.5, c: 'var(--green)' }, { l: 'Reinvestimento', p: 0.3, c: 'var(--blue)' }, { l: 'Reserva', p: 0.15, c: '#8b5cf6' }, { l: 'Impostos', p: 0.05, c: 'var(--amber)' }].map((d, j) => (
              <div key={j} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text2)' }}>{d.l} ({Math.round(d.p * 100)}%)</span>
                <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--mono)', color: d.c }}>{fmt(lucro * d.p)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MEI vs ME */}
      <div className="card" style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)' }}>
        <div className="card-title">🔄 SIMULADOR DE MIGRAÇÃO MEI → ME</div>
        <div className="grid-2" style={{ marginTop: '14px', gap: '16px' }}>
          {[
            { label: 'Atual como MEI', color: 'var(--text)', items: [['Faturamento', 'R$ 81.000/ano'], ['DAS (fixo)', 'R$ 923/ano'], ['Alíquota efetiva', '~1,1%'], ['Limite', 'R$ 81.000']] },
            { label: 'Como ME (Simples)', color: '#93c5fd', items: [['Faturamento', 'Até R$ 360.000/ano'], ['SIMPLES (estimado)', 'R$ 4.860/ano'], ['Alíquota efetiva', '6% (Anexo III)'], ['Limite', 'R$ 360.000']] },
          ].map((col, ci) => (
            <div key={ci}>
              <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', color: col.color }}>{col.label}</div>
              {col.items.map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text2)' }}>{r[0]}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: col.color }}>{r[1]}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ background: 'rgba(59,130,246,0.1)', borderRadius: '10px', padding: '12px', marginTop: '14px', fontSize: '13px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.6' }}>
          💡 <strong>Conclusão:</strong> A migração para ME vale a pena quando você <strong>superar consistentemente os R$ 81k</strong> ou precisar contratar funcionários. Abaixo disso, o MEI é muito mais vantajoso.
        </div>
      </div>
    </div>
  )
}
