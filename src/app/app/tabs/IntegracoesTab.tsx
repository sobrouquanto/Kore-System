'use client'
import { useState, useEffect } from 'react'
import { useDashboard } from '@/context/DashboardContext'
import { supabase } from '@/lib/supabase'

const BANCOS = [
  { id: 'nubank',   nome: 'Nubank',          icon: '🟣', desc: 'Conta PJ e extrato' },
  { id: 'inter',    nome: 'Banco Inter',      icon: '🟠', desc: 'Conta MEI e cartão' },
  { id: 'itau',     nome: 'Itaú',             icon: '🟡', desc: 'Conta corrente PJ' },
  { id: 'bradesco', nome: 'Bradesco',         icon: '🔴', desc: 'Conta PJ' },
  { id: 'bb',       nome: 'Banco do Brasil',  icon: '💛', desc: 'Conta PJ' },
  { id: 'caixa',    nome: 'Caixa Econômica',  icon: '🔵', desc: 'Conta PJ' },
  { id: 'sicoob',   nome: 'Sicoob',           icon: '🟢', desc: 'Cooperativa' },
  { id: 'c6',       nome: 'C6 Bank',          icon: '⚫', desc: 'Conta digital PJ' },
]

// ─── Sprint 2: tipos de sync ──────────────────────────────────────────────────

type SyncStatus = 'idle' | 'syncing' | 'done' | 'error'

type SyncResult = {
  imported: number
  skipped: number
  errors: string[]
}

function formatLastSync(iso?: string): string {
  if (!iso) return 'Nunca sincronizado'
  try {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
    if (diff < 1)  return 'Agora mesmo'
    if (diff < 60) return `Há ${diff} min`
    const h = Math.floor(diff / 60)
    if (h < 24)    return `Há ${h}h`
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  } catch { return '' }
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function IntegracoesTab() {
  const { integrations, saveIntegration, disconnectIntegration, loadAll, loadIntegrations, user } = useDashboard()

  // Modal state (idêntico ao original)
  const [intgModal, setIntgModal]     = useState<null | 'mercadopago' | 'banco' | 'notafiscal'>(null)
  const [intgLoading, setIntgLoading] = useState(false)
  const [intgBanco, setIntgBanco]     = useState('')
  const [intgToken, setIntgToken]     = useState('')
  const [intgStep, setIntgStep]       = useState(1)

  // Pluggy widget (idêntico ao original)
  const [pluggyToken, setPluggyToken] = useState<string | null>(null)
  const [pluggyBancoSelecionado, setPluggyBancoSelecionado] = useState<{ id: string; nome: string; icon: string } | null>(null)
  const [PluggyConnect, setPluggyConnect] = useState<any>(null)

  useEffect(() => {
    import('react-pluggy-connect').then(mod => setPluggyConnect(() => mod.PluggyConnect))
  }, [])

  // ─── Sprint 2: estado de sync por banco ──────────────────────────────────────
  const [syncStatus, setSyncStatus] = useState<Record<string, SyncStatus>>({})
  const [syncResult, setSyncResult] = useState<Record<string, SyncResult>>({})
  const [syncingAll, setSyncingAll] = useState(false)

  // ─── Computed (idêntico ao original) ─────────────────────────────────────────
  const isBancoConectado = (id: string) => integrations[`banco_${id}`]?.status === 'connected'
  const mpConectado  = integrations['mercadopago_mercadopago']?.status === 'connected'
  const nfConectado  = integrations['notafiscal_focusnfe']?.status === 'connected'
  const listaBancosConectados = BANCOS.filter(b => isBancoConectado(b.id))
  const bancosConectados = listaBancosConectados.length
  const totalConectados  = bancosConectados + (mpConectado ? 1 : 0) + (nfConectado ? 1 : 0)

  // ─── Pluggy flow (idêntico ao original) ──────────────────────────────────────
  async function abrirPluggy(banco: { id: string; nome: string; icon: string }) {
    setIntgLoading(true)
    setPluggyBancoSelecionado(banco)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/pluggy/token', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session?.access_token}`, 'Content-Type': 'application/json' },
      })
      const json = await res.json()
      if (!res.ok || !json.accessToken) {
        alert('Erro ao conectar com o Pluggy: ' + (json.error || 'Tente novamente.'))
        setPluggyBancoSelecionado(null)
        setIntgLoading(false)
        return
      }
      setPluggyToken(json.accessToken)
    } catch { alert('Erro de conexão. Verifique sua internet.') }
    setIntgLoading(false)
  }

  async function onPluggySuccess(itemData: any) {
    setPluggyToken(null)
    if (!pluggyBancoSelecionado) return

    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/pluggy/callback', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${session?.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemId:          itemData.item?.id || itemData.itemId || itemData.id,
        bankName:        pluggyBancoSelecionado.id,
        bankDisplayName: pluggyBancoSelecionado.nome,
        bankIcon:        pluggyBancoSelecionado.icon,
      }),
    })
    const result = await res.json()
    if (result.success) {
      setIntgModal('banco')
      setIntgStep(3)
      // Sprint 2: dispara sync imediata após conectar
      syncBanco(pluggyBancoSelecionado.id)
    } else {
      alert('Erro ao salvar conexão bancária: ' + (result.error || ''))
    }
    setPluggyBancoSelecionado(null)
  }

  function closeModal() { setIntgModal(null); setIntgToken(''); setIntgStep(1); setIntgBanco('') }

  // ─── Sprint 2: funções de sync ────────────────────────────────────────────────

  async function syncBanco(bankId: string) {
    setSyncStatus(s => ({ ...s, [bankId]: 'syncing' }))
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/pluggy/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bankName: bankId }),
      })
      const json = await res.json()

      if (!res.ok) {
        setSyncStatus(s => ({ ...s, [bankId]: 'error' }))
        setSyncResult(r => ({ ...r, [bankId]: { imported: 0, skipped: 0, errors: [json.error || 'Erro'] } }))
        return
      }

      const r = json.results?.[0] || { imported: json.totalImported || 0, skipped: json.totalSkipped || 0, errors: [] }
      setSyncStatus(s => ({ ...s, [bankId]: 'done' }))
      setSyncResult(prev => ({ ...prev, [bankId]: r }))

      // Recarrega dados do dashboard para refletir transações importadas
      if (r.imported > 0) {
        await loadAll(user)
      } else {
        await loadIntegrations(user.id)
      }

    } catch (e: any) {
      setSyncStatus(s => ({ ...s, [bankId]: 'error' }))
      setSyncResult(r => ({ ...r, [bankId]: { imported: 0, skipped: 0, errors: [e.message] } }))
    }

    // Volta para idle após 10s
    setTimeout(() => setSyncStatus(s => ({ ...s, [bankId]: 'idle' })), 10000)
  }

  async function syncTodosBancos() {
    setSyncingAll(true)
    await Promise.allSettled(listaBancosConectados.map(b => syncBanco(b.id)))
    setSyncingAll(false)
  }

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Pluggy Widget — idêntico ao original */}
      {pluggyToken && PluggyConnect && (
        <PluggyConnect
          connectToken={pluggyToken}
          onSuccess={(d: any) => onPluggySuccess(d)}
          onClose={() => { setPluggyToken(null); setPluggyBancoSelecionado(null) }}
          onError={(err: any) => { console.error(err); setPluggyToken(null); alert('Erro ao conectar banco.') }}
        />
      )}

      {/* Modal MP — idêntico ao original */}
      {intgModal === 'mercadopago' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ fontSize: '36px' }}>💳</div>
              <div><div style={{ fontSize: '18px', fontWeight: 800 }}>Conectar Mercado Pago</div><div style={{ fontSize: '13px', color: 'var(--text2)' }}>Importe vendas e Pix automaticamente</div></div>
            </div>
            {intgStep === 1 && (<>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '16px', marginBottom: '16px', border: '1px solid var(--card-border)' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px', color: 'var(--text2)', letterSpacing: '1px', textTransform: 'uppercase' }}>Como pegar seu token:</div>
                {[['1', 'Acesse mercadopago.com.br e faça login'], ['2', 'Vá em Seu negócio → Configurações'], ['3', 'Clique em Credenciais'], ['4', 'Copie o "Access Token de Produção"']].map(([n, t]) => (
                  <div key={n} style={{ display: 'flex', gap: '10px', marginBottom: '8px', fontSize: '13px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--green-dim)', border: '1px solid var(--green-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: 'var(--green)', flexShrink: 0 }}>{n}</div>
                    <span style={{ color: 'var(--text2)', lineHeight: '1.5' }}>{t}</span>
                  </div>
                ))}
              </div>
              <div className="form-group-sm" style={{ marginBottom: '16px' }}>
                <label>Cole seu Access Token aqui</label>
                <input value={intgToken} onChange={e => setIntgToken(e.target.value)} placeholder="APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" style={{ fontFamily: 'var(--mono)', fontSize: '12px' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn-ghost-sm" onClick={closeModal} style={{ flex: 1 }}>Cancelar</button>
                <button className="btn-add" style={{ flex: 2 }} disabled={!intgToken.startsWith('APP_USR') || intgLoading}
                  onClick={async () => { setIntgLoading(true); const ok = await saveIntegration('mercadopago', 'mercadopago', intgToken, { display: 'Mercado Pago' }); if (ok) setIntgStep(2); setIntgLoading(false) }}>
                  {intgLoading ? 'Validando...' : 'Conectar →'}
                </button>
              </div>
            </>)}
            {intgStep === 2 && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--green)', marginBottom: '8px' }}>Mercado Pago Conectado!</div>
                <div style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '24px', lineHeight: '1.6' }}>Suas transações serão sincronizadas automaticamente.</div>
                <button className="btn-add" onClick={closeModal}>Fechar ✓</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Banco — idêntico ao original, step 3 com texto atualizado */}
      {intgModal === 'banco' && (
        <div className="modal-overlay" onClick={() => { if (intgStep !== 3) closeModal() }}>
          <div className="modal" style={{ maxWidth: '580px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ fontSize: '36px' }}>🏦</div>
              <div><div style={{ fontSize: '18px', fontWeight: 800 }}>Conectar Banco</div><div style={{ fontSize: '13px', color: 'var(--text2)' }}>Importe extrato via Open Finance</div></div>
            </div>
            {intgStep === 1 && (<>
              <div style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '14px' }}>Selecione seu banco:</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                {BANCOS.map(b => (
                  <button key={b.id} onClick={() => setIntgBanco(b.id)} style={{ background: intgBanco === b.id ? 'var(--green-dim)' : 'rgba(255,255,255,0.03)', border: intgBanco === b.id ? '1px solid var(--green-border)' : '1px solid var(--card-border)', borderRadius: '10px', padding: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all .2s' }}>
                    <span style={{ fontSize: '22px' }}>{b.icon}</span>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: intgBanco === b.id ? 'var(--green)' : 'var(--text)' }}>{b.nome}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{b.desc}</div>
                    </div>
                    {isBancoConectado(b.id) && <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--green)', fontWeight: 700 }}>✓</span>}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn-ghost-sm" onClick={closeModal} style={{ flex: 1 }}>Cancelar</button>
                <button className="btn-add" style={{ flex: 2 }} disabled={!intgBanco} onClick={() => setIntgStep(2)}>Continuar →</button>
              </div>
            </>)}
            {intgStep === 2 && (() => {
              const banco = BANCOS.find(b => b.id === intgBanco)!
              return (<>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--card-border)' }}>
                  <span style={{ fontSize: '24px' }}>{banco?.icon}</span>
                  <div><div style={{ fontSize: '14px', fontWeight: 700 }}>{banco?.nome}</div><div style={{ fontSize: '12px', color: 'var(--text3)' }}>{banco?.desc}</div></div>
                  <button onClick={() => setIntgStep(1)} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'var(--text3)', fontSize: '12px', cursor: 'pointer' }}>← Trocar</button>
                </div>
                <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#93c5fd', marginBottom: '10px' }}>🔒 Como funciona (3 passos simples):</div>
                  {[['1. Clique em "Conectar agora"', 'Uma janela segura vai abrir'], ['2. Faça login no seu banco', 'Use seu app ou internet banking normalmente'], ['3. Autorize o acesso', 'Apenas leitura do extrato — nunca pedimos senha']].map(([t, d], i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: i < 2 ? '10px' : '0' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: '#93c5fd', flexShrink: 0 }}>{i + 1}</div>
                      <div><div style={{ fontSize: '13px', fontWeight: 600 }}>{t}</div><div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '2px' }}>{d}</div></div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn-ghost-sm" onClick={closeModal} style={{ flex: 1 }}>Cancelar</button>
                  <button className="btn-add" style={{ flex: 2 }} disabled={intgLoading}
                    onClick={async () => { setIntgModal(null); await abrirPluggy({ id: banco?.id || '', nome: banco?.nome || '', icon: banco?.icon || '🏦' }) }}>
                    {intgLoading ? 'Preparando...' : `Conectar ${banco?.nome} →`}
                  </button>
                </div>
              </>)
            })()}
            {intgStep === 3 && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--green)', marginBottom: '8px' }}>Banco Conectado!</div>
                <div style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '8px', lineHeight: '1.6' }}>
                  Importando transações dos últimos 90 dias...
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '24px' }}>
                  Sincronização automática a cada 6 horas.
                </div>
                <button className="btn-add" onClick={closeModal}>Fechar ✓</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal NF — idêntico ao original */}
      {intgModal === 'notafiscal' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ fontSize: '36px' }}>📄</div>
              <div><div style={{ fontSize: '18px', fontWeight: 800 }}>Conectar Nota Fiscal</div><div style={{ fontSize: '13px', color: 'var(--text2)' }}>Emissão automática via Focus NFe</div></div>
            </div>
            <div className="form-group-sm" style={{ marginBottom: '8px' }}>
              <label>Token de Acesso Focus NFe</label>
              <input value={intgToken} onChange={e => setIntgToken(e.target.value)} placeholder="Cole aqui seu token..." style={{ fontFamily: 'var(--mono)', fontSize: '12px' }} />
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '16px' }}>🔒 Armazenado com segurança, nunca compartilhado.</div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-ghost-sm" onClick={closeModal} style={{ flex: 1 }}>Cancelar</button>
              <button className="btn-add" style={{ flex: 2 }} disabled={intgToken.length < 10 || intgLoading}
                onClick={async () => { setIntgLoading(true); const ok = await saveIntegration('notafiscal', 'focusnfe', intgToken, { display: 'Focus NFe' }); if (ok) setIntgStep(2); setIntgLoading(false) }}>
                {intgLoading ? 'Conectando...' : 'Conectar →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header — idêntico ao original */}
      <div className="card" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ fontSize: '32px' }}>🔗</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '16px', fontWeight: 800 }}>Hub de Integrações</div>
          <div style={{ fontSize: '13px', color: 'var(--text2)', marginTop: '2px' }}>Conecte suas ferramentas e deixe o Kore trabalhar por você.</div>
        </div>
        <div style={{ display: 'flex', gap: '20px', flexShrink: 0 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 900, fontFamily: 'var(--mono)', color: totalConectados > 0 ? 'var(--green)' : 'var(--text2)' }}>{totalConectados}</div>
            <div style={{ fontSize: '11px', color: 'var(--text3)' }}>Conectadas</div>
          </div>
        </div>
      </div>

      {/* ── Bancos — seção expandida com Sprint 2 ────────────────────────────── */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: bancosConectados > 0 ? '16px' : '0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>🏦</div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700 }}>Conta Bancária</div>
              <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '4px' }}>
                {bancosConectados === 0
                  ? 'Open Finance · Nubank, Inter, Itaú e mais'
                  : `${bancosConectados} banco${bancosConectados > 1 ? 's' : ''} conectado${bancosConectados > 1 ? 's' : ''} · sync automático a cada 6h`}
              </div>
            </div>
          </div>
          {/* Sprint 2: botão "Sincronizar tudo" quando há bancos conectados */}
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            {bancosConectados > 0 && (
              <button
                className="btn-ghost-sm"
                disabled={syncingAll}
                onClick={syncTodosBancos}
                style={{ fontSize: '12px', opacity: syncingAll ? 0.5 : 1 }}
              >
                {syncingAll ? '⟳ Sincronizando...' : '⟳ Sincronizar tudo'}
              </button>
            )}
            <button
              className="btn-add"
              style={{ padding: '8px 18px', fontSize: '13px' }}
              onClick={() => { setIntgModal('banco'); setIntgStep(1); setIntgBanco('') }}
            >
              {bancosConectados > 0 ? '+ Adicionar banco' : 'Conectar banco →'}
            </button>
          </div>
        </div>

        {/* Sprint 2: lista de bancos com status de sync (substituindo os chips simples do original) */}
        {bancosConectados > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '14px', borderTop: '1px solid var(--card-border)' }}>
            {listaBancosConectados.map(b => {
              const intg     = integrations[`banco_${b.id}`]
              const status   = syncStatus[b.id] || 'idle'
              const result   = syncResult[b.id]
              const lastSync = intg?.metadata?.last_sync
              const lastCount: number = intg?.metadata?.last_sync_count || 0

              return (
                <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--card-border)' }}>
                  {/* Ícone + nome */}
                  <span style={{ fontSize: '20px' }}>{b.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--green)' }}>{b.nome}</span>
                      <span className="badge badge-green" style={{ fontSize: '10px', padding: '2px 7px' }}>✓ Conectado</span>
                      {lastCount > 0 && (
                        <span style={{ fontSize: '10px', background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.25)', padding: '2px 7px', borderRadius: '99px', fontWeight: 700 }}>
                          {lastCount} importadas
                        </span>
                      )}
                    </div>
                    {/* Status de sync */}
                    <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>
                      {status === 'syncing' && (
                        <span style={{ color: 'var(--amber)' }}>⟳ Sincronizando...</span>
                      )}
                      {status === 'done' && result && (
                        <span style={{ color: 'var(--green)' }}>
                          ✓ {result.imported > 0 ? `${result.imported} transações importadas` : 'Tudo já atualizado'}
                        </span>
                      )}
                      {status === 'error' && result && (
                        <span style={{ color: 'var(--red)' }}>✗ {result.errors[0] || 'Erro ao sincronizar'}</span>
                      )}
                      {status === 'idle' && (
                        <span>Última sync: {formatLastSync(lastSync)}</span>
                      )}
                    </div>
                  </div>
                  {/* Botões de ação */}
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <button
                      onClick={() => syncBanco(b.id)}
                      disabled={status === 'syncing'}
                      title="Sincronizar agora"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid var(--card-border)',
                        borderRadius: '8px',
                        padding: '5px 10px',
                        fontSize: '12px',
                        color: 'var(--text2)',
                        cursor: status === 'syncing' ? 'not-allowed' : 'pointer',
                        opacity: status === 'syncing' ? 0.5 : 1,
                      }}
                    >
                      {status === 'syncing' ? '⟳' : '⟳ Sync'}
                    </button>
                    <button
                      onClick={() => disconnectIntegration('banco', b.id)}
                      title="Desconectar"
                      style={{
                        background: 'transparent',
                        border: '1px solid rgba(239,68,68,0.2)',
                        borderRadius: '8px',
                        padding: '5px 9px',
                        fontSize: '13px',
                        color: 'rgba(239,68,68,0.6)',
                        cursor: 'pointer',
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* MP + NF — idêntico ao original */}
      <div className="grid-2">
        {[
          {
            key: 'mercadopago', icon: '💳', name: 'Mercado Pago', desc: 'Vendas e Pix automáticos',
            connected: mpConectado,
            connectedMsg: '✓ Sincronizando vendas e Pix automaticamente.',
            disconnectedMsg: 'Importe suas vendas, cobranças e Pix recebidos diretamente.',
            bg: 'rgba(0,158,227,0.12)', border: 'rgba(0,158,227,0.2)',
            onConnect: () => { setIntgModal('mercadopago'); setIntgStep(1); setIntgToken('') },
            onDisconnect: () => disconnectIntegration('mercadopago', 'mercadopago'),
          },
          {
            key: 'notafiscal', icon: '📄', name: 'Nota Fiscal', desc: 'Emissão automática',
            connected: nfConectado,
            connectedMsg: '✓ NFS-e configurada via Focus NFe.',
            disconnectedMsg: 'Emita notas fiscais de serviço (NFS-e) automaticamente para seus clientes.',
            bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.2)',
            onConnect: () => { setIntgModal('notafiscal'); setIntgStep(1); setIntgToken('') },
            onDisconnect: () => disconnectIntegration('notafiscal', 'focusnfe'),
          },
        ].map(item => (
          <div key={item.key} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: item.bg, border: `1px solid ${item.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>{item.icon}</div>
              <div style={{ flex: 1 }}><div style={{ fontSize: '15px', fontWeight: 700 }}>{item.name}</div><div style={{ fontSize: '12px', color: 'var(--text3)' }}>{item.desc}</div></div>
              {item.connected ? <span className="badge badge-green">✓ Conectado</span> : <span style={{ fontSize: '11px', color: 'var(--text3)' }}>Desconectado</span>}
            </div>
            <div style={{ fontSize: '13px', color: item.connected ? 'var(--green)' : 'var(--text2)', lineHeight: '1.6', background: item.connected ? 'var(--green-dim)' : 'transparent', border: item.connected ? '1px solid var(--green-border)' : 'none', borderRadius: item.connected ? '10px' : '0', padding: item.connected ? '12px' : '0' }}>{item.connected ? item.connectedMsg : item.disconnectedMsg}</div>
            <div style={{ marginTop: 'auto' }}>
              {item.connected
                ? <button className="btn-ghost-sm" style={{ width: '100%', color: 'var(--red)', borderColor: 'rgba(239,68,68,0.3)' }} onClick={item.onDisconnect}>Desconectar</button>
                : <button className="btn-add" style={{ width: '100%' }} onClick={item.onConnect}>Conectar →</button>}
            </div>
          </div>
        ))}
      </div>

      {/* Em breve — idêntico ao original */}
      <div style={{ marginTop: '16px' }}>
        <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Em breve</div>
        <div className="grid-2">
          {[
            { icon: '🛵', name: 'iFood',             desc: 'Pedidos e faturamento automático' },
            { icon: '🛍️', name: 'Shopee',            desc: 'Vendas marketplace' },
            { icon: '📱', name: 'WhatsApp Business', desc: 'Cobranças automáticas' },
            { icon: '🏪', name: 'Nuvemshop',         desc: 'Loja virtual integrada' },
          ].map((item, i) => (
            <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.5 }}>
              <div style={{ fontSize: '28px' }}>{item.icon}</div>
              <div><div style={{ fontSize: '14px', fontWeight: 700 }}>{item.name}</div><div style={{ fontSize: '12px', color: 'var(--text3)' }}>{item.desc}</div></div>
              <span style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.05)', color: 'var(--text3)', padding: '4px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 700 }}>Em breve</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}