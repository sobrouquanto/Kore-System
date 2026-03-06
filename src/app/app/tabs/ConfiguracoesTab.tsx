'use client'
import { useState } from 'react'
import { useDashboard } from '@/context/DashboardContext'

export default function ConfiguracoesTab() {
  const { user, userName, userBiz, saveConfig, doLogout, planActive, trialDaysLeft, trialExpired } = useDashboard()

  const [cfgName, setCfgName] = useState(userName)
  const [cfgBiz, setCfgBiz] = useState(userBiz)
  const [cfgCnpj, setCfgCnpj] = useState('')
  const [cfgSaving, setCfgSaving] = useState(false)
  const [cfgSaved, setCfgSaved] = useState(false)
  const [cnpjData, setCnpjData] = useState<any>(null)
  const [cnpjLoading, setCnpjLoading] = useState(false)
  const [cnpjError, setCnpjError] = useState('')
  const [pwdNew, setPwdNew] = useState('')
  const [pwdMsg, setPwdMsg] = useState('')

  async function handleSaveConfig() {
    if (!cfgName) return
    setCfgSaving(true)
    await saveConfig(cfgName, cfgBiz)
    setCfgSaved(true)
    setTimeout(() => setCfgSaved(false), 2500)
    setCfgSaving(false)
  }

  async function lookupCnpj() {
    const clean = cfgCnpj.replace(/\D/g, '')
    if (clean.length !== 14) { setCnpjError('CNPJ inválido — informe 14 dígitos.'); return }
    setCnpjLoading(true); setCnpjError(''); setCnpjData(null)
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${clean}`)
      if (!res.ok) throw new Error('CNPJ não encontrado na Receita Federal.')
      const data = await res.json()
      setCnpjData(data)
      if (data.razao_social) setCfgBiz(data.razao_social)
    } catch (e: any) {
      setCnpjError(e.message || 'Erro ao consultar CNPJ.')
    }
    setCnpjLoading(false)
  }

  async function handleChangePwd() {
    if (!pwdNew || pwdNew.length < 8) { setPwdMsg('A nova senha deve ter ao menos 8 caracteres.'); return }
    const { supabase } = await import('@/lib/supabase')
    const { error } = await supabase.auth.updateUser({ password: pwdNew })
    if (error) setPwdMsg('Erro: ' + error.message)
    else { setPwdMsg('Senha alterada com sucesso! ✓'); setPwdNew('') }
    setTimeout(() => setPwdMsg(''), 4000)
  }

  const formatCnpj = (v: string) =>
    v.replace(/\D/g, '').replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')

  // Status do plano
  const planLabel = planActive ? 'Plano Completo' : trialExpired ? 'Trial Expirado' : `Trial · ${trialDaysLeft} dia${trialDaysLeft !== 1 ? 's' : ''} restante${trialDaysLeft !== 1 ? 's' : ''}`
  const planColor = planActive ? 'var(--green)' : trialExpired ? 'var(--red)' : 'var(--amber)'
  const planBg    = planActive ? 'var(--green-dim)' : trialExpired ? 'var(--red-dim)' : 'rgba(245,158,11,0.12)'
  const planBorder= planActive ? 'var(--green-border)' : trialExpired ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.25)'

  return (
    <div style={{ maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Perfil */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--green),var(--blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800 }}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800 }}>{userName}</div>
            <div style={{ fontSize: '13px', color: 'var(--text3)', marginTop: '2px' }}>{user?.email}</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="form-group-sm">
            <label>Seu nome</label>
            <input value={cfgName} onChange={e => setCfgName(e.target.value)} placeholder="Nome completo" />
          </div>
          <div className="form-group-sm">
            <label>Nome do negócio</label>
            <input value={cfgBiz} onChange={e => setCfgBiz(e.target.value)} placeholder="Nome da sua empresa ou MEI" />
          </div>
          <button className="btn-add" onClick={handleSaveConfig} disabled={cfgSaving} style={{ alignSelf: 'flex-start', minWidth: '160px' }}>
            {cfgSaved ? '✓ Salvo!' : cfgSaving ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      </div>

      {/* ── Assinatura ── */}
      <div className="card" style={{ border: `1px solid ${planBorder}`, background: planBg }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>💳 Assinatura</div>
            <div style={{ fontSize: '12px', color: 'var(--text3)' }}>Gerencie seu plano MEI 360 OS</div>
          </div>
          <span style={{ background: planBg, border: `1px solid ${planBorder}`, color: planColor, padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 700 }}>
            {planActive ? '✓ ' : ''}{planLabel}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          {[
            ['Plano', planActive ? 'MEI 360 OS · Completo' : 'Trial gratuito'],
            ['Valor', planActive ? 'R$ 29,00/mês' : 'Gratuito'],
            ['Status', planActive ? 'Ativo' : trialExpired ? 'Expirado' : 'Em avaliação'],
            ['Membro desde', user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : '—'],
          ].map(([label, value], i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <span style={{ fontSize: '13px', color: 'var(--text3)' }}>{label}</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: i === 2 ? planColor : 'var(--text)' }}>{value}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {planActive ? (
            <button
              onClick={() => window.open('https://billing.stripe.com/p/login/test_00g000000000000', '_blank')}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--card-border)', color: 'var(--text2)', padding: '9px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            >
              Gerenciar assinatura →
            </button>
          ) : (
            <button
              onClick={() => window.open('/assinar', '_blank')}
              className="btn-add"
              style={{ padding: '9px 18px' }}
            >
              {trialExpired ? 'Reativar assinatura →' : 'Assinar agora — R$29/mês →'}
            </button>
          )}
        </div>
      </div>

      {/* Consulta CNPJ */}
      <div className="card">
        <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>🏢 Consulta de CNPJ</div>
        <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '14px' }}>
          Busque os dados do seu MEI diretamente na Receita Federal via BrasilAPI.
        </div>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
          <div className="form-group-sm" style={{ flex: 1 }}>
            <label>CNPJ</label>
            <input value={cfgCnpj} onChange={e => setCfgCnpj(formatCnpj(e.target.value))} placeholder="00.000.000/0000-00" maxLength={18} />
          </div>
          <button className="btn-add" style={{ alignSelf: 'flex-end', padding: '10px 18px' }} onClick={lookupCnpj} disabled={cnpjLoading}>
            {cnpjLoading ? 'Buscando...' : 'Consultar'}
          </button>
        </div>
        {cnpjError && (
          <div style={{ background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px', fontSize: '13px', color: 'var(--red)' }}>⚠️ {cnpjError}</div>
        )}
        {cnpjData && (
          <div style={{ background: 'var(--green-dim)', border: '1px solid var(--green-border)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--green)', marginBottom: '12px' }}>✓ Dados encontrados</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                ['Razão Social', cnpjData.razao_social],
                ['Nome Fantasia', cnpjData.nome_fantasia || '—'],
                ['Situação', cnpjData.descricao_situacao_cadastral],
                ['CNAE Principal', cnpjData.cnae_fiscal_descricao],
                ['Município', `${cnpjData.municipio} / ${cnpjData.uf}`],
                ['Abertura', cnpjData.data_inicio_atividade ? new Date(cnpjData.data_inicio_atividade).toLocaleDateString('pt-BR') : '—'],
              ].map(([label, value], i) => (
                <div key={i}>
                  <div style={{ fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>{label}</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, lineHeight: '1.4' }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Segurança */}
      <div className="card">
        <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>🔒 Segurança</div>
        <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '14px' }}>Altere sua senha de acesso ao MEI 360 OS.</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="form-group-sm">
            <label>Nova senha</label>
            <input type="password" value={pwdNew} onChange={e => setPwdNew(e.target.value)} placeholder="Mínimo 8 caracteres" />
          </div>
          <button className="btn-add" style={{ alignSelf: 'flex-start', minWidth: '160px', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#a78bfa' }} onClick={handleChangePwd} disabled={!pwdNew}>
            Alterar senha
          </button>
          {pwdMsg && (
            <div style={{ fontSize: '13px', color: pwdMsg.includes('Erro') ? 'var(--red)' : 'var(--green)', background: pwdMsg.includes('Erro') ? 'var(--red-dim)' : 'var(--green-dim)', border: `1px solid ${pwdMsg.includes('Erro') ? 'rgba(239,68,68,0.3)' : 'var(--green-border)'}`, borderRadius: '8px', padding: '10px 14px' }}>
              {pwdMsg}
            </div>
          )}
        </div>
      </div>

      {/* Dados da conta */}
      <div className="card">
        <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px' }}>📋 Informações da conta</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            ['E-mail', user?.email],
            ['Membro desde', user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : '—'],
          ].map(([label, value], i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 1 ? '1px solid var(--card-border)' : 'none' }}>
              <span style={{ fontSize: '13px', color: 'var(--text3)' }}>{label}</span>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sair */}
      <div className="card" style={{ border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.04)' }}>
        <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px', color: 'var(--red)' }}>⚠️ Sair da conta</div>
        <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '14px' }}>Você será redirecionado para a tela de login.</div>
        <button onClick={doLogout} style={{ background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--red)', padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
          Sair da conta →
        </button>
      </div>
    </div>
  )
}
