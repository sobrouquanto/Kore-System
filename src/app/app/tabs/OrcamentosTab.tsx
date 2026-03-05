'use client'
import { useState } from 'react'
import { useDashboard, fmt, formatDateBR, todayISO, QuoteItem } from '@/context/DashboardContext'
import { SectionHeader, EmptyState } from '@/components/ui'

export default function OrcamentosTab() {
  const { quotes, addQuote, updateQuoteStatus, deleteQuote, showConfirm } = useDashboard()

  const [quoteModal, setQuoteModal] = useState(false)
  const [quoteClient, setQuoteClient] = useState('')
  const [quoteDesc, setQuoteDesc] = useState('')
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([{ desc: '', value: 0 }])
  const [quoteValidUntil, setQuoteValidUntil] = useState('')
  const [quoteNotes, setQuoteNotes] = useState('')

  async function handleAddQuote() {
    if (!quoteClient || quoteItems.length === 0) return
    await addQuote(quoteClient, quoteDesc, quoteItems, quoteValidUntil, quoteNotes)
    setQuoteClient(''); setQuoteDesc(''); setQuoteItems([{ desc: '', value: 0 }]); setQuoteValidUntil(''); setQuoteNotes(''); setQuoteModal(false)
  }

  function sendWhatsApp(q: typeof quotes[0]) {
    const lines = (q.items || []).map((it: any) => `• ${it.desc}: R$${Number(it.value).toFixed(2).replace('.', ',')}`).join('%0A')
    const msg = `Olá! Segue seu orçamento 👇%0A%0A*${q.description || 'Orçamento'}*%0ACliente: ${q.client_name}%0A%0AItens:%0A${lines}%0A%0A*Total: R$${Number(q.total).toFixed(2).replace('.', ',')}*%0A%0AQualquer dúvida, é só chamar! 🤝`
    window.open('https://wa.me/?text=' + msg, '_blank')
  }

  const statusLabel: Record<string, string> = {
    draft: '📝 Rascunho', sent: '📤 Enviado', approved: '✓ Aprovado', rejected: '✗ Recusado'
  }
  const statusBadge: Record<string, string> = {
    draft: 'gray', sent: 'amber', approved: 'green', rejected: 'red'
  }

  return (
    <>
      {quoteModal && (
        <div className="modal-overlay" onClick={() => setQuoteModal(false)}>
          <div className="modal" style={{ maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>Novo Orçamento</div>
            <div style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '20px' }}>Crie uma proposta profissional para seu cliente</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-row">
                <div className="form-group-sm"><label>Cliente *</label><input value={quoteClient} onChange={e => setQuoteClient(e.target.value)} placeholder="Nome do cliente" autoFocus /></div>
                <div className="form-group-sm"><label>Validade</label><input type="date" value={quoteValidUntil} onChange={e => setQuoteValidUntil(e.target.value)} /></div>
              </div>
              <div className="form-group-sm"><label>Descrição geral</label><input value={quoteDesc} onChange={e => setQuoteDesc(e.target.value)} placeholder="Ex: Reforma banheiro, Desenvolvimento de site..." /></div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text2)', fontWeight: 600, letterSpacing: '.5px', textTransform: 'uppercase', marginBottom: '8px' }}>Itens do orçamento</div>
                {quoteItems.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input value={item.desc} onChange={e => { const n = [...quoteItems]; n[i].desc = e.target.value; setQuoteItems(n) }} placeholder="Descrição do item" style={{ flex: 2, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', borderRadius: '9px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none' }} />
                    <input type="number" value={item.value || ''} onChange={e => { const n = [...quoteItems]; n[i].value = parseFloat(e.target.value) || 0; setQuoteItems(n) }} placeholder="R$" style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', borderRadius: '9px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none' }} />
                    {quoteItems.length > 1 && <button onClick={() => setQuoteItems(quoteItems.filter((_, j) => j !== i))} style={{ background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.25)', color: 'var(--red)', padding: '8px 12px', borderRadius: '9px', cursor: 'pointer', fontWeight: 700 }}>×</button>}
                  </div>
                ))}
                <button onClick={() => setQuoteItems([...quoteItems, { desc: '', value: 0 }])} className="btn-ghost-sm" style={{ width: '100%', marginTop: '4px' }}>+ Adicionar item</button>
                <div style={{ textAlign: 'right', marginTop: '10px', fontFamily: 'var(--mono)', fontWeight: 800, color: 'var(--green)', fontSize: '18px' }}>
                  Total: {fmt(quoteItems.reduce((s, i) => s + (i.value || 0), 0))}
                </div>
              </div>
              <div className="form-group-sm"><label>Observações</label><input value={quoteNotes} onChange={e => setQuoteNotes(e.target.value)} placeholder="Condições, prazo de execução, forma de pagamento..." /></div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button className="btn-ghost-sm" onClick={() => setQuoteModal(false)} style={{ flex: 1 }}>Cancelar</button>
                <button className="btn-add" onClick={handleAddQuote} style={{ flex: 2 }}>Criar orçamento ✓</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid-3" style={{ marginBottom: '20px' }}>
        <div className="card"><div className="card-title">TOTAL ORÇAMENTOS</div><div className="card-value" style={{ fontSize: '32px' }}>{quotes.length}</div></div>
        <div className="card card-green"><div className="card-title">APROVADOS</div><div className="card-value" style={{ fontSize: '32px', color: 'var(--green)' }}>{quotes.filter(q => q.status === 'approved').length}</div></div>
        <div className="card card-amber">
          <div className="card-title">VALOR TOTAL</div>
          <div className="card-value" style={{ fontSize: '24px', color: 'var(--amber)' }}>
            {fmt(quotes.filter(q => q.status === 'approved').reduce((s, q) => s + q.total, 0))}
          </div>
          <div className="card-sub">em orçamentos aprovados</div>
        </div>
      </div>

      {/* Tabela */}
      <div className="card">
        <SectionHeader
          title="📋 Orçamentos"
          sub="Crie e gerencie propostas para clientes"
          action={<button className="btn-add" style={{ padding: '7px 14px', fontSize: '12px' }} onClick={() => setQuoteModal(true)}>+ Novo orçamento</button>}
        />
        {quotes.length === 0 ? (
          <EmptyState text="Nenhum orçamento ainda." action={
            <button className="btn-add" style={{ fontSize: '12px', padding: '8px 16px' }} onClick={() => setQuoteModal(true)}>Criar primeiro orçamento →</button>
          } />
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Cliente</th><th>Descrição</th><th>Total</th><th>Validade</th><th>Status</th><th>Ações</th></tr></thead>
              <tbody>
                {quotes.map(q => (
                  <tr key={q.id}>
                    <td style={{ fontWeight: 600 }}>{q.client_name}</td>
                    <td style={{ color: 'var(--text3)', fontSize: '13px' }}>{q.description || '—'}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--green)' }}>{fmt(q.total)}</td>
                    <td style={{ color: 'var(--text3)', fontSize: '12px' }}>{q.valid_until ? formatDateBR(q.valid_until) : '—'}</td>
                    <td>
                      <span className={`badge badge-${statusBadge[q.status] || 'gray'}`}>{statusLabel[q.status]}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {q.status === 'draft' && <button onClick={() => updateQuoteStatus(q.id, 'sent')} style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: 'var(--blue)', padding: '5px 8px', borderRadius: '7px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>Enviar</button>}
                        {q.status === 'sent' && <button onClick={() => updateQuoteStatus(q.id, 'approved')} style={{ background: 'var(--green-dim)', border: '1px solid var(--green-border)', color: 'var(--green)', padding: '5px 8px', borderRadius: '7px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>✓ Aprovar</button>}
                        {q.status === 'sent' && <button onClick={() => updateQuoteStatus(q.id, 'rejected')} style={{ background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.25)', color: 'var(--red)', padding: '5px 8px', borderRadius: '7px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>✗</button>}
                        <button onClick={() => sendWhatsApp(q)} style={{ background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.3)', color: '#25d366', padding: '5px 8px', borderRadius: '7px', fontSize: '12px', cursor: 'pointer' }} title="Enviar no WhatsApp">📱</button>
                        <button onClick={() => showConfirm('Excluir este orçamento?', () => deleteQuote(q.id))} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'var(--text3)', padding: '5px 8px', borderRadius: '7px', fontSize: '12px', cursor: 'pointer' }}>🗑️</button>
                      </div>
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
