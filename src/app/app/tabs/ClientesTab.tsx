'use client'
import { useState } from 'react'
import { useDashboard, fmt, formatDateBR, todayISO, getInitials } from '@/context/DashboardContext'
import { SectionHeader, EmptyState } from '@/components/ui'

export default function ClientesTab() {
  const { clients, receivables, addClient, deleteClient, addReceivable, markReceivableReceived, deleteReceivable, showConfirm } = useDashboard()

  const [cliModal, setCliModal] = useState(false)
  const [cliName, setCliName] = useState('')
  const [cliPhone, setCliPhone] = useState('')
  const [cliEmail, setCliEmail] = useState('')
  const [cliLoading, setCliLoading] = useState(false)

  const [recModal, setRecModal] = useState(false)
  const [recClientName, setRecClientName] = useState('')
  const [recDesc, setRecDesc] = useState('')
  const [recValue, setRecValue] = useState('')
  const [recDueDate, setRecDueDate] = useState(todayISO())

  const topClients = [...clients].sort((a, b) => b.total_revenue - a.total_revenue)
  const pendingReceivables = receivables.filter(r => r.status === 'pending')
  const totalAReceber = pendingReceivables.reduce((s, r) => s + r.value, 0)

  async function handleAddClient() {
    if (!cliName) return
    setCliLoading(true)
    await addClient(cliName, cliPhone, cliEmail)
    setCliName(''); setCliPhone(''); setCliEmail(''); setCliModal(false)
    setCliLoading(false)
  }

  async function handleAddReceivable() {
    if (!recClientName || !recValue) return
    await addReceivable(recClientName, recDesc, parseFloat(recValue), recDueDate)
    setRecClientName(''); setRecDesc(''); setRecValue(''); setRecDueDate(todayISO()); setRecModal(false)
  }

  return (
    <>
      {/* Modais */}
      {cliModal && (
        <div className="modal-overlay" onClick={() => setCliModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>Novo Cliente</div>
            <div style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '20px' }}>Cadastre um cliente na sua base</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group-sm"><label>Nome *</label><input value={cliName} onChange={e => setCliName(e.target.value)} placeholder="João Mendes" autoFocus /></div>
              <div className="form-group-sm"><label>WhatsApp</label><input value={cliPhone} onChange={e => setCliPhone(e.target.value)} placeholder="(11) 99999-9999" /></div>
              <div className="form-group-sm"><label>E-mail</label><input value={cliEmail} onChange={e => setCliEmail(e.target.value)} placeholder="cliente@email.com" /></div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button className="btn-ghost-sm" onClick={() => setCliModal(false)} style={{ flex: 1 }}>Cancelar</button>
                <button className="btn-add" onClick={handleAddClient} disabled={cliLoading} style={{ flex: 2 }}>{cliLoading ? 'Salvando...' : 'Salvar ✓'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {recModal && (
        <div className="modal-overlay" onClick={() => setRecModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>Nova Cobrança</div>
            <div style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '20px' }}>Registre um valor a receber de um cliente</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group-sm"><label>Cliente *</label><input value={recClientName} onChange={e => setRecClientName(e.target.value)} placeholder="Nome do cliente" /></div>
              <div className="form-group-sm"><label>Descrição do serviço</label><input value={recDesc} onChange={e => setRecDesc(e.target.value)} placeholder="Ex: Corte de cabelo, Instalação elétrica..." /></div>
              <div className="form-row">
                <div className="form-group-sm"><label>Valor (R$) *</label><input type="number" value={recValue} onChange={e => setRecValue(e.target.value)} placeholder="0,00" /></div>
                <div className="form-group-sm"><label>Vencimento</label><input type="date" value={recDueDate} onChange={e => setRecDueDate(e.target.value)} /></div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button className="btn-ghost-sm" onClick={() => setRecModal(false)} style={{ flex: 1 }}>Cancelar</button>
                <button className="btn-add" onClick={handleAddReceivable} style={{ flex: 2 }}>Salvar ✓</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid-3" style={{ marginBottom: '20px' }}>
        <div className="card"><div className="card-title">TOTAL CLIENTES</div><div className="card-value" style={{ fontSize: '32px' }}>{clients.length}</div><div className="card-sub">Na sua base</div></div>
        <div className="card card-green"><div className="card-title">RECEITA GERADA</div><div className="card-value" style={{ color: 'var(--green)', fontSize: '28px' }}>{fmt(clients.reduce((s, c) => s + c.total_revenue, 0))}</div></div>
        <div className="card card-amber"><div className="card-title">A RECEBER</div><div className="card-value" style={{ fontSize: '28px', color: 'var(--amber)' }}>{fmt(totalAReceber)}</div><div className="card-sub">{pendingReceivables.length} pendentes</div></div>
      </div>

      {/* Contas a receber */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <SectionHeader
          title="💰 Contas a Receber"
          sub="Gerencie cobranças e recebimentos"
          action={<button className="btn-add" style={{ padding: '7px 14px', fontSize: '12px' }} onClick={() => setRecModal(true)}>+ Nova cobrança</button>}
        />
        {receivables.length === 0 ? (
          <EmptyState text="Nenhuma cobrança ainda." action={
            <button className="btn-add" style={{ fontSize: '12px', padding: '8px 16px' }} onClick={() => setRecModal(true)}>Criar primeira cobrança →</button>
          } />
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Cliente</th><th>Descrição</th><th>Vencimento</th><th>Valor</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {receivables.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{r.client_name}</td>
                    <td style={{ color: 'var(--text3)', fontSize: '13px' }}>{r.description || '—'}</td>
                    <td style={{ color: r.status === 'overdue' ? 'var(--red)' : 'var(--text3)', fontSize: '12px' }}>{formatDateBR(r.due_date)}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: r.status === 'received' ? 'var(--green)' : r.status === 'overdue' ? 'var(--red)' : 'var(--amber)' }}>{fmt(r.value)}</td>
                    <td>
                      <span className={`badge badge-${r.status === 'received' ? 'green' : r.status === 'overdue' ? 'red' : 'amber'}`}>
                        {r.status === 'received' ? '✓ Recebido' : r.status === 'overdue' ? '⚠ Vencido' : '⏳ Pendente'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {r.status !== 'received' && (
                          <button onClick={() => markReceivableReceived(r.id, r.value, r.description)} style={{ background: 'var(--green-dim)', border: '1px solid var(--green-border)', color: 'var(--green)', padding: '5px 10px', borderRadius: '7px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>✓ Receber</button>
                        )}
                        <button onClick={() => showConfirm('Excluir esta cobrança?', () => deleteReceivable(r.id))} style={{ background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.25)', color: 'var(--red)', padding: '5px 10px', borderRadius: '7px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>×</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lista de clientes */}
      <div className="card">
        <SectionHeader
          title="LISTA DE CLIENTES"
          action={<button className="btn-add" style={{ padding: '7px 14px', fontSize: '12px' }} onClick={() => setCliModal(true)}>+ Novo cliente</button>}
        />
        {clients.length === 0 ? (
          <EmptyState text="Nenhum cliente ainda." action={
            <button className="btn-add" style={{ fontSize: '12px', padding: '8px 16px' }} onClick={() => setCliModal(true)}>Cadastrar primeiro cliente →</button>
          } />
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>#</th><th>Cliente</th><th>Telefone</th><th>E-mail</th><th>Cadastro</th><th></th></tr></thead>
              <tbody>
                {topClients.map((c, i) => (
                  <tr key={c.id}>
                    <td style={{ color: 'var(--text3)', fontFamily: 'var(--mono)', fontSize: '12px' }}>{i + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--green),var(--blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>{getInitials(c.name)}</div>
                        <span style={{ fontWeight: 600 }}>{c.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text3)', fontSize: '13px' }}>{c.phone || '—'}</td>
                    <td style={{ color: 'var(--text3)', fontSize: '13px' }}>{c.email || '—'}</td>
                    <td style={{ color: 'var(--text3)', fontSize: '12px' }}>{formatDateBR(c.created_at)}</td>
                    <td>
                      <button onClick={() => showConfirm(`Remover ${c.name} da base de clientes?`, () => deleteClient(c.id))} style={{ background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.25)', color: 'var(--red)', padding: '5px 10px', borderRadius: '7px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
