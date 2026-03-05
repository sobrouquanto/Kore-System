'use client'
import { useState } from 'react'
import { useDashboard, fmt, formatDateBR, todayISO } from '@/context/DashboardContext'
import { EmptyState } from '@/components/ui'

export default function LancamentosTab() {
  const { transactions, addTransaction, deleteTransaction, showConfirm } = useDashboard()

  const [txType, setTxType] = useState<'in' | 'out'>('in')
  const [txDesc, setTxDesc] = useState('')
  const [txVal, setTxVal] = useState('')
  const [txCat, setTxCat] = useState('Serviço')
  const [txDate, setTxDate] = useState(todayISO())
  const [txLoading, setTxLoading] = useState(false)

  async function handleAdd() {
    if (!txDesc || !txVal) return
    setTxLoading(true)
    await addTransaction(txDesc, parseFloat(txVal), txType, txCat, txDate)
    setTxDesc(''); setTxVal(''); setTxDate(todayISO())
    setTxLoading(false)
  }

  async function quickLaunch(desc: string, val: string, type: 'in' | 'out', cat: string) {
    await addTransaction(desc, parseFloat(val), type, cat, todayISO())
  }

  function handleDasQuick() {
    const thisMonth = todayISO().slice(0, 7)
    const alreadyPaid = transactions.some(t => t.description === 'DAS Mensal' && t.type === 'out' && t.date?.startsWith(thisMonth))
    if (alreadyPaid) {
      showConfirm('O DAS deste mês já foi registrado. Deseja registrar mesmo assim?', () => quickLaunch('DAS Mensal', '76.90', 'out', 'Imposto'))
      return
    }
    quickLaunch('DAS Mensal', '76.90', 'out', 'Imposto')
  }

  return (
    <div className="grid-21">
      {/* Form */}
      <div>
        <div className="card" style={{ marginBottom: '16px' }}>
          <div className="card-title">NOVO LANÇAMENTO</div>
          <div style={{ margin: '14px 0 12px' }}>
            <div className="toggle-group">
              <button className={`toggle-btn ${txType === 'in' ? 'active' : ''}`} onClick={() => setTxType('in')}>↑ Entrada</button>
              <button className={`toggle-btn ${txType === 'out' ? 'active' : ''}`} onClick={() => setTxType('out')}>↓ Saída</button>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group-sm"><label>Descrição</label><input value={txDesc} onChange={e => setTxDesc(e.target.value)} placeholder="Ex: serviço para João" onKeyDown={e => e.key === 'Enter' && handleAdd()} /></div>
            <div className="form-group-sm"><label>Valor (R$)</label><input type="number" value={txVal} onChange={e => setTxVal(e.target.value)} placeholder="0,00" min="0" onKeyDown={e => e.key === 'Enter' && handleAdd()} /></div>
          </div>
          <div className="form-row">
            <div className="form-group-sm">
              <label>Categoria</label>
              <select value={txCat} onChange={e => setTxCat(e.target.value)}>
                <option>Serviço</option><option>Produto</option><option>Fornecedor</option>
                <option>Imposto</option><option>Fixo</option><option>Equipamento</option><option>Pessoal</option>
              </select>
            </div>
            <div className="form-group-sm"><label>Data</label><input type="date" value={txDate} onChange={e => setTxDate(e.target.value)} /></div>
          </div>
          <button className="btn-add" style={{ width: '100%' }} onClick={handleAdd} disabled={txLoading}>
            {txLoading ? 'Salvando...' : 'Lançar ✓'}
          </button>
        </div>

        {/* Ações rápidas */}
        <div className="card">
          <div className="card-title">AÇÕES RÁPIDAS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
            <button onClick={handleDasQuick} style={{ background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--red)', padding: '10px 14px', borderRadius: '9px', fontSize: '13px', fontWeight: 600, textAlign: 'left', cursor: 'pointer' }}>
              ⚠️ Registrar pagamento DAS — R$76,90
            </button>
            <button onClick={() => { setTxType('in'); setTxCat('Serviço'); setTxDesc('Serviço avulso') }} style={{ background: 'var(--green-dim)', border: '1px solid var(--green-border)', color: 'var(--green)', padding: '10px 14px', borderRadius: '9px', fontSize: '13px', fontWeight: 600, textAlign: 'left', cursor: 'pointer' }}>
              ↑ Registrar receita de serviço
            </button>
            <button onClick={() => { setTxType('out'); setTxCat('Fixo') }} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--card-border)', color: 'var(--text2)', padding: '10px 14px', borderRadius: '9px', fontSize: '13px', fontWeight: 600, textAlign: 'left', cursor: 'pointer' }}>
              ↓ Registrar despesa fixa
            </button>
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div className="card-title" style={{ margin: 0 }}>ÚLTIMOS LANÇAMENTOS</div>
          <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{transactions.length} registros</div>
        </div>
        {transactions.length === 0 ? (
          <EmptyState text="Nenhum lançamento ainda. Faça seu primeiro registro ao lado!" />
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Descrição</th><th>Cat.</th><th>Data</th><th>Valor</th><th></th></tr></thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: t.type === 'in' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                          {t.type === 'in' ? '↑' : '↓'}
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 500 }}>{t.description}</span>
                      </div>
                    </td>
                    <td><span className={`badge badge-${t.type === 'in' ? 'green' : 'red'}`}>{t.category}</span></td>
                    <td style={{ color: 'var(--text3)', fontSize: '12px' }}>{formatDateBR(t.date)}</td>
                    <td className={t.type === 'in' ? 'tx-in' : 'tx-out'}>{t.type === 'in' ? '+' : '-'}{fmt(t.value)}</td>
                    <td>
                      <button onClick={() => showConfirm('Excluir este lançamento?', () => deleteTransaction(t.id))} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: '16px', padding: '0 4px' }}>×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
