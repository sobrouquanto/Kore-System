'use client'
import { useState, useMemo } from 'react'
import { useDashboard, fmt, formatDateBR, todayISO } from '@/context/DashboardContext'
import { EmptyState } from '@/components/ui'
import { supabase } from '@/lib/supabase'

// ── Badge de origem ───────────────────────────────────────────────────────────
function SourceBadge({ source, bankName }: { source?: string; bankName?: string }) {
  if (source !== 'bank_sync') return null
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '3px',
      fontSize: '10px', fontWeight: 700,
      background: 'rgba(59,130,246,0.12)', color: '#93c5fd',
      border: '1px solid rgba(59,130,246,0.2)',
      padding: '2px 7px', borderRadius: '99px', flexShrink: 0,
    }}>
      🏦 {bankName || 'Banco'}
    </span>
  )
}

// ── Toggle negócio / pessoal ──────────────────────────────────────────────────
function PersonalToggle({ isPersonal, saving, onChange }: {
  isPersonal: boolean; saving: boolean; onChange: (val: boolean) => void
}) {
  return (
    <button
      onClick={() => !saving && onChange(!isPersonal)}
      title={isPersonal ? 'Pessoal — clique para marcar como negócio' : 'Negócio — clique para marcar como pessoal'}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        padding: '2px 8px', borderRadius: '99px', fontSize: '10px', fontWeight: 700,
        cursor: saving ? 'wait' : 'pointer', border: '1px solid',
        fontFamily: 'inherit', transition: 'all 0.15s',
        background:  isPersonal ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.1)',
        borderColor: isPersonal ? 'rgba(245,158,11,0.25)' : 'rgba(16,185,129,0.25)',
        color:       isPersonal ? 'var(--amber)'          : 'var(--green)',
        opacity: saving ? 0.5 : 1,
      }}
    >
      {saving ? '…' : isPersonal ? '👤 Pessoal' : '💼 Negócio'}
    </button>
  )
}

// ── Descrição editável inline ─────────────────────────────────────────────────
function EditableDesc({ value, saving, onSave }: {
  value: string; saving: boolean; onSave: (val: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState(value)

  function commit() {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== value) onSave(trimmed)
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter')  commit()
          if (e.key === 'Escape') { setDraft(value); setEditing(false) }
        }}
        style={{
          background: 'rgba(255,255,255,0.07)', border: '1px solid var(--card-border)',
          borderRadius: '6px', padding: '2px 8px', color: 'var(--text)',
          fontSize: '14px', fontWeight: 600, outline: 'none', width: '100%',
        }}
      />
    )
  }

  return (
    <span
      onClick={() => !saving && setEditing(true)}
      title="Clique para editar"
      style={{
        fontSize: '14px', fontWeight: 600, lineHeight: '1.35',
        cursor: saving ? 'default' : 'text',
        borderBottom: '1px dashed rgba(255,255,255,0.15)',
      }}
    >
      {value}
    </span>
  )
}

// ── Linha de transação ────────────────────────────────────────────────────────
function TxRow({ t, saving, onUpdate, onDelete, showConfirm }: {
  t: any; saving: boolean
  onUpdate: (id: string, fields: Record<string, any>) => void
  onDelete: () => void
  showConfirm: (msg: string, fn: () => void) => void
}) {
  const isBank   = t.source === 'bank_sync'
  const isIn     = t.type === 'in'
  const iconBg   = isBank
    ? (isIn ? 'rgba(59,130,246,0.15)' : 'rgba(239,68,68,0.12)')
    : (isIn ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)')
  const iconColor = isIn ? (isBank ? '#93c5fd' : 'var(--green)') : 'var(--red)'

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '12px',
      padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
      opacity: saving ? 0.5 : 1, transition: 'opacity 0.15s',
    }}>
      {/* Ícone tipo/origem */}
      <div style={{
        width: '32px', height: '32px', borderRadius: '9px', flexShrink: 0,
        background: iconBg, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '14px', color: iconColor,
        border: '1px solid rgba(255,255,255,0.06)', marginTop: '2px',
      }}>
        {isBank ? '🏦' : (isIn ? '↑' : '↓')}
      </div>

      {/* Bloco central: descrição em cima, metadados embaixo */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* Linha 1: descrição editável */}
        <EditableDesc
          value={t.description}
          saving={saving}
          onSave={val => onUpdate(t.id, { description: val })}
        />

        {/* Linha 2: badges + metadados */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          marginTop: '5px', flexWrap: 'wrap',
        }}>
          {/* Categoria */}
          <span className={`badge badge-${isIn ? 'green' : 'red'}`} style={{ fontSize: '10px' }}>
            {t.category}
          </span>

          {/* Data */}
          <span style={{ fontSize: '11px', color: 'var(--text3)' }}>
            {formatDateBR(t.date)}
          </span>

          {/* Badge banco */}
          <SourceBadge source={t.source} bankName={t.bank_name} />

          {/* Toggle negócio/pessoal (só banco) */}
          {isBank && (
            <PersonalToggle
              isPersonal={t.is_personal ?? false}
              saving={saving}
              onChange={val => onUpdate(t.id, { is_personal: val })}
            />
          )}
        </div>

        {/* Linha 3: nome da conta bancária (se tiver) */}
        {t.bank_account_name && (
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '3px' }}>
            {t.bank_account_name}
          </div>
        )}
      </div>

      {/* Valor + botão delete */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
        <span className={isIn ? 'tx-in' : 'tx-out'} style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'var(--mono)', whiteSpace: 'nowrap' }}>
          {isIn ? '+' : '-'}{fmt(t.value)}
        </span>
        {!isBank && (
          <button
            onClick={() => showConfirm('Excluir este lançamento?', onDelete)}
            style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.15)', cursor: 'pointer', fontSize: '16px', padding: '0', lineHeight: 1 }}
          >×</button>
        )}
      </div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function LancamentosTab() {
  const { transactions, addTransaction, deleteTransaction, showConfirm, stats, loadAll, user } = useDashboard()

  // Form state
  const [txType, setTxType]           = useState<'in' | 'out'>('in')
  const [txDesc, setTxDesc]           = useState('')
  const [txVal, setTxVal]             = useState('')
  const [txCat, setTxCat]             = useState('Serviço')
  const [catDropOpen, setCatDropOpen] = useState(false)
  const CATS = ['Serviço', 'Produto', 'Fornecedor', 'Imposto', 'Fixo', 'Equipamento', 'Pessoal']
  const [txDate, setTxDate]           = useState(todayISO())
  const [txLoading, setTxLoading]     = useState(false)

  // Saving por id
  const [saving, setSaving] = useState<Record<string, boolean>>({})

  // Filtros
  type SourceFilter = 'all' | 'manual' | 'bank_sync'
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all')
  const [searchTerm, setSearchTerm]     = useState('')

  const filteredTransactions = useMemo(() => {
    let list = transactions
    if (sourceFilter !== 'all') list = list.filter(t => (t.source || 'manual') === sourceFilter)
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      list = list.filter(t =>
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.bank_name || '').toLowerCase().includes(q)
      )
    }
    return list
  }, [transactions, sourceFilter, searchTerm])

  const manualCount   = transactions.filter(t => (t.source || 'manual') === 'manual').length
  const bankCount     = transactions.filter(t => t.source === 'bank_sync').length
  const pendingReview = transactions.filter(t => t.source === 'bank_sync' && t.is_personal === true).length

  async function updateField(id: string, fields: Record<string, any>) {
    setSaving(s => ({ ...s, [id]: true }))
    await supabase.from('transactions').update(fields).eq('id', id)
    await loadAll(user)
    setSaving(s => ({ ...s, [id]: false }))
  }

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
    const alreadyPaid = transactions.some(
      t => t.description === 'DAS Mensal' && t.type === 'out' && t.date?.startsWith(thisMonth)
    )
    if (alreadyPaid) {
      showConfirm('O DAS deste mês já foi registrado. Deseja registrar mesmo assim?',
        () => quickLaunch('DAS Mensal', '76.90', 'out', 'Imposto'))
      return
    }
    quickLaunch('DAS Mensal', '76.90', 'out', 'Imposto')
  }

  return (
    <div className="grid-21">

      {/* ── Formulário ───────────────────────────────────────────────────── */}
      <div>
        <div className="card" style={{ marginBottom: '16px' }}>
          <div className="card-title">NOVO LANÇAMENTO</div>
          <div style={{ margin: '14px 0 12px' }}>
            <div className="toggle-group">
              <button className={`toggle-btn ${txType === 'in'  ? 'active' : ''}`} onClick={() => setTxType('in')}>↑ Entrada</button>
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
              <div style={{ position: 'relative' }}>
                <button onClick={() => setCatDropOpen(o => !o)} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', borderRadius: '9px', padding: '9px 32px 9px 12px', color: 'var(--text)', fontSize: '13px', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', position: 'relative' }}>
                  {txCat}
                  <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>▼</span>
                </button>
                {catDropOpen && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: '#111827', border: '1px solid var(--card-border)', borderRadius: '10px', overflow: 'hidden', zIndex: 200, boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                    {CATS.map(cat => (
                      <button key={cat} onClick={() => { setTxCat(cat); setCatDropOpen(false) }} style={{ display: 'block', width: '100%', padding: '9px 14px', background: cat === txCat ? 'var(--green-dim)' : 'transparent', border: 'none', color: cat === txCat ? 'var(--green)' : 'var(--text2)', fontSize: '13px', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>
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

          {bankCount > 0 && (
            <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--card-border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Banco sincronizado</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: pendingReview > 0 ? '8px' : 0 }}>
                <span style={{ color: 'var(--text2)' }}>Importadas este mês</span>
                <span style={{ color: '#93c5fd', fontWeight: 700, fontFamily: 'var(--mono)' }}>{stats.bankSyncCount}</span>
              </div>
              {pendingReview > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 10px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', fontSize: '12px', color: 'var(--amber)' }}>
                  <span>⚠️</span>
                  <span><strong>{pendingReview}</strong> marcadas como pessoal — confirme</span>
                  <button onClick={() => setSourceFilter('bank_sync')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--amber)', cursor: 'pointer', fontSize: '12px', fontWeight: 700, padding: 0, fontFamily: 'inherit', flexShrink: 0 }}>
                    revisar →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Lista ────────────────────────────────────────────────────────── */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexShrink: 0 }}>
          <div className="card-title" style={{ margin: 0 }}>ÚLTIMOS LANÇAMENTOS</div>
          <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{filteredTransactions.length} registros</div>
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexShrink: 0, flexWrap: 'wrap' }}>
          {([
            ['all',       `Todos (${transactions.length})`],
            ['manual',    `Manual (${manualCount})`],
            ['bank_sync', `🏦 Banco (${bankCount})`],
          ] as [typeof sourceFilter, string][]).map(([val, label]) => (
            <button key={val} onClick={() => setSourceFilter(val)} style={{
              background: sourceFilter === val ? 'var(--green-dim)' : 'rgba(255,255,255,0.04)',
              border: sourceFilter === val ? '1px solid var(--green-border)' : '1px solid var(--card-border)',
              color: sourceFilter === val ? 'var(--green)' : 'var(--text3)',
              padding: '5px 12px', borderRadius: '99px', fontSize: '11px',
              fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              {label}
            </button>
          ))}
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar..."
            style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', borderRadius: '8px', padding: '5px 10px', color: 'var(--text)', fontSize: '12px', outline: 'none', width: '140px' }}
          />
        </div>

        {/* Dica de edição (só na view banco) */}
        {sourceFilter === 'bank_sync' && bankCount > 0 && (
          <div style={{ marginBottom: '8px', padding: '7px 12px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)', borderRadius: '8px', fontSize: '12px', color: 'var(--text3)', flexShrink: 0 }}>
            💡 Clique na <strong style={{ color: 'var(--text2)' }}>descrição</strong> para editar · Clique em <strong style={{ color: 'var(--text2)' }}>💼/👤</strong> para alternar negócio/pessoal
          </div>
        )}

        {/* Transações */}
        {filteredTransactions.length === 0 ? (
          <EmptyState text="Nenhum lançamento encontrado." />
        ) : (
          <div style={{ overflowY: 'auto', maxHeight: '600px', flex: 1, paddingRight: '2px' }}>
            {filteredTransactions.map(t => (
              <TxRow
                key={t.id}
                t={t}
                saving={saving[t.id] ?? false}
                onUpdate={updateField}
                onDelete={() => deleteTransaction(t.id)}
                showConfirm={showConfirm}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
