'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'

// ── Botão voltar ──────────────────────────────────────────────────────────────
function BackButton({ onClick, label = 'Voltar' }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'fixed', top: '20px', left: '20px',
        display: 'flex', alignItems: 'center', gap: '7px',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: 'rgba(255,255,255,0.7)',
        padding: '9px 14px', borderRadius: '10px',
        fontSize: '13px', fontWeight: 600,
        cursor: 'pointer', fontFamily: 'inherit',
        backdropFilter: 'blur(12px)',
        transition: 'all 0.15s',
        zIndex: 50,
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.10)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
      </svg>
      {label}
    </button>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function OnboardingContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const fromCheckout = searchParams.get('checkout') === 'success'

  const [status, setStatus]   = useState<'checking' | 'waiting_payment' | 'ready' | 'already_done'>('checking')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    checkProfile()
  }, [attempt])

  async function checkProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: profile } = await supabase
      .from('profiles')
      .select('plano_ativo, onboarding_done')
      .eq('id', user.id)
      .single()

    if (profile?.onboarding_done) {
      setStatus('already_done')
      router.push('/app')
      return
    }

    if (profile?.plano_ativo) {
      setStatus('ready')
      return
    }

    if (fromCheckout && attempt < 8) {
      setStatus('waiting_payment')
      setTimeout(() => setAttempt(a => a + 1), 2000)
      return
    }

    router.push('/assinar')
  }

  // ── Estado: verificando ───────────────────────────────────────────────────
  if (status === 'checking' || status === 'already_done') {
    return (
      <div style={containerStyle}>
        <BackButton onClick={() => router.push('/assinar')} label="Voltar" />
        <div style={spinnerStyle} />
        <p style={textStyle}>Verificando sua conta...</p>
      </div>
    )
  }

  // ── Estado: aguardando pagamento ──────────────────────────────────────────
  if (status === 'waiting_payment') {
    return (
      <div style={containerStyle}>
        <BackButton onClick={() => router.push('/assinar')} label="Voltar" />
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>⏳</div>
        <p style={{ ...textStyle, fontSize: '16px', fontWeight: 700 }}>Confirmando seu pagamento...</p>
        <p style={{ ...textStyle, color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginTop: '8px' }}>
          Isso leva apenas alguns segundos
        </p>
        <div style={{ display: 'flex', gap: '6px', marginTop: '20px' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: '#2E62FF',
              animation: `pulse 1.2s ${i * 0.2}s ease-in-out infinite`,
            }} />
          ))}
        </div>
        <style>{`@keyframes pulse{0%,100%{opacity:0.3;transform:scale(0.8);}50%{opacity:1;transform:scale(1.2);}}`}</style>
      </div>
    )
  }

  // ── Estado: pronto — renderiza o fluxo ───────────────────────────────────
  return <OnboardingFlow />
}

// ─── Fluxo de onboarding ──────────────────────────────────────────────────────
function OnboardingFlow() {
  const router = useRouter()
  const [step, setStep]   = useState(0)
  const [data, setData]   = useState({ nome_empresa: '', cnpj: '', segmento: '' })
  const [saving, setSaving] = useState(false)

  async function finish() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('profiles').update({
      ...data,
      onboarding_done: true,
    }).eq('id', user.id)

    router.push('/app')
  }

  const steps = [
    { title: 'Qual o nome do seu negócio?',   field: 'nome_empresa' as const, placeholder: 'Ex: Silva Elétrica' },
    { title: 'Qual é o seu CNPJ?',             field: 'cnpj' as const,         placeholder: 'XX.XXX.XXX/0001-XX' },
    { title: 'Qual é o seu segmento?',         field: 'segmento' as const,     placeholder: 'Ex: Eletricista, Designer...' },
  ]

  const current  = steps[step]
  const isLast   = step === steps.length - 1
  const canAdvance = !!data[current.field]

  function goNext() {
    if (!canAdvance) return
    if (isLast) finish()
    else setStep(s => s + 1)
  }

  function goBack() {
    if (step > 0) setStep(s => s - 1)
    else router.push('/assinar')
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#060a12',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', sans-serif", color: '#f1f5f9', padding: '20px',
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800;900&display=swap');*{margin:0;padding:0;box-sizing:border-box;}`}</style>

      {/* Botão voltar — volta para step anterior ou para /assinar no step 0 */}
      <BackButton
        onClick={goBack}
        label={step === 0 ? 'Voltar' : `Passo ${step}`}
      />

      {/* Orb */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: '500px', height: '500px', top: '-150px', left: '20%', background: 'radial-gradient(circle, rgba(46,98,255,0.055) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      <div style={{ maxWidth: '480px', width: '100%', position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '40px' }}>
          <div style={{ width: '32px', height: '32px', background: 'rgba(46,98,255,0.15)', border: '1px solid rgba(46,98,255,0.25)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 28 28" fill="none"><path d="M7 6L7 22M7 14L16 6M7 14L16 22" stroke="#2E62FF" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
          <div style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '-0.3px' }}>Kore</div>
        </div>

        {/* Barra de progresso */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '40px' }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              flex: 1, height: '4px', borderRadius: '99px',
              background: i <= step ? '#2E62FF' : 'rgba(255,255,255,0.1)',
              transition: 'background .3s',
            }} />
          ))}
        </div>

        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
          Passo {step + 1} de {steps.length}
        </div>

        <h1 style={{ fontSize: '26px', fontWeight: 900, marginBottom: '32px', lineHeight: 1.3 }}>
          {current.title}
        </h1>

        <input
          key={current.field}
          autoFocus
          value={data[current.field]}
          onChange={e => setData(d => ({ ...d, [current.field]: e.target.value }))}
          placeholder={current.placeholder}
          onKeyDown={e => { if (e.key === 'Enter') goNext() }}
          style={{
            width: '100%', background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '14px', padding: '16px 18px',
            color: '#f1f5f9', fontSize: '16px', outline: 'none',
            marginBottom: '16px', fontFamily: 'Inter, system-ui, sans-serif',
            boxSizing: 'border-box',
          }}
        />

        <button
          onClick={goNext}
          disabled={!canAdvance || saving}
          style={{
            width: '100%', padding: '15px', borderRadius: '14px',
            fontSize: '15px', fontWeight: 800,
            background: canAdvance ? 'linear-gradient(135deg,#2E62FF,#1E4FE8)' : 'rgba(255,255,255,0.08)',
            color: canAdvance ? '#fff' : 'rgba(255,255,255,0.3)',
            border: 'none', cursor: canAdvance ? 'pointer' : 'not-allowed',
            transition: 'all .2s',
            boxShadow: canAdvance ? '0 4px 20px rgba(46,98,255,0.3)' : 'none',
            fontFamily: 'inherit',
          }}
        >
          {saving ? 'Salvando...' : isLast ? 'Entrar no sistema 🚀' : 'Continuar →'}
        </button>

        {/* Hint de pular campo opcional */}
        {current.field === 'cnpj' && (
          <button
            onClick={() => setStep(s => s + 1)}
            style={{ marginTop: '12px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.25)', fontSize: '13px', cursor: 'pointer', width: '100%', textAlign: 'center', fontFamily: 'inherit' }}
          >
            Pular por agora →
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Estilos de loading ───────────────────────────────────────────────────────
const containerStyle: React.CSSProperties = {
  minHeight: '100vh', background: '#060a12',
  display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center',
  fontFamily: "'Inter', sans-serif",
}

const spinnerStyle: React.CSSProperties = {
  width: '32px', height: '32px',
  border: '3px solid rgba(255,255,255,0.1)',
  borderTop: '3px solid #2E62FF',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
  marginBottom: '16px',
}

const textStyle: React.CSSProperties = {
  color: '#f1f5f9', fontSize: '14px',
}
