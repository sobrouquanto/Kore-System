'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'

// Este componente é chamado pelo onboarding/page.tsx via Suspense
// Lida com o delay do webhook do Stripe (pode levar 1-5s para chegar)

export default function OnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromCheckout = searchParams.get('checkout') === 'success'

  const [status, setStatus] = useState<'checking' | 'waiting_payment' | 'ready' | 'already_done'>('checking')
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
      // Já fez onboarding — vai pro app
      setStatus('already_done')
      router.push('/app')
      return
    }

    if (profile?.plano_ativo) {
      // Plano ativo e onboarding não feito — pode continuar
      setStatus('ready')
      return
    }

    // Plano não ativo ainda
    if (fromCheckout && attempt < 8) {
      // Veio do checkout — webhook pode estar a caminho, espera e tenta de novo
      setStatus('waiting_payment')
      setTimeout(() => setAttempt(a => a + 1), 2000) // tenta a cada 2s, até 8x (16s)
      return
    }

    // Esgotou tentativas ou não veio do checkout — manda assinar
    router.push('/assinar')
  }

  if (status === 'checking' || status === 'already_done') {
    return (
      <div style={containerStyle}>
        <button
          onClick={() => router.push('/')}
          style={{
            position: 'fixed',
            top: 16,
            left: 16,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.8)',
            padding: '10px 12px',
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            backdropFilter: 'blur(12px)',
          }}
        >
          ← Voltar ao site
        </button>
        <div style={spinnerStyle} />
        <p style={textStyle}>Verificando sua conta...</p>
      </div>
    )
  }

  if (status === 'waiting_payment') {
    return (
      <div style={containerStyle}>
        <button
          onClick={() => router.push('/')}
          style={{
            position: 'fixed',
            top: 16,
            left: 16,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.8)',
            padding: '10px 12px',
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            backdropFilter: 'blur(12px)',
          }}
        >
          ← Voltar ao site
        </button>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>⏳</div>
        <p style={{ ...textStyle, fontSize: '16px', fontWeight: 700 }}>Confirmando seu pagamento...</p>
        <p style={{ ...textStyle, color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginTop: '8px' }}>
          Isso leva apenas alguns segundos
        </p>
        <div style={{ display: 'flex', gap: '6px', marginTop: '20px' }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: '#10b981',
              animation: `pulse 1.2s ${i * 0.2}s ease-in-out infinite`,
            }}/>
          ))}
        </div>
        <style>{`@keyframes pulse{0%,100%{opacity:0.3;transform:scale(0.8);}50%{opacity:1;transform:scale(1.2);}}`}</style>
      </div>
    )
  }

  // status === 'ready' — renderiza o onboarding real aqui
  // Substitua o conteúdo abaixo pelo seu onboarding atual
  return <OnboardingFlow />
}

// ─── Coloque aqui o conteúdo real do seu onboarding ───────────────────────────
function OnboardingFlow() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [data, setData] = useState({ nome_empresa: '', cnpj: '', segmento: '' })
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
    {
      title: 'Qual o nome do seu negócio?',
      field: 'nome_empresa' as const,
      placeholder: 'Ex: Silva Elétrica',
    },
    {
      title: 'Qual é o seu CNPJ?',
      field: 'cnpj' as const,
      placeholder: 'XX.XXX.XXX/0001-XX',
    },
    {
      title: 'Qual é o seu segmento?',
      field: 'segmento' as const,
      placeholder: 'Ex: Eletricista, Encanador, Designer...',
    },
  ]

  const current = steps[step]

  return (
    <div style={{ minHeight: '100vh', background: '#060a12', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Sora', sans-serif", color: '#f1f5f9', padding: '20px' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;700;800;900&display=swap');*{margin:0;padding:0;box-sizing:border-box;}`}</style>
      <div style={{ maxWidth: '480px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <button
            onClick={() => router.push('/')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.45)',
              fontSize: '13px',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
            }}
          >
            ← Voltar ao site
          </button>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '40px' }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              flex: 1, height: '4px', borderRadius: '99px',
              background: i <= step ? '#10b981' : 'rgba(255,255,255,0.1)',
              transition: 'background .3s',
            }}/>
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
          onKeyDown={e => { if (e.key === 'Enter' && data[current.field]) { step < steps.length - 1 ? setStep(s => s + 1) : finish() } }}
          style={{
            width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '14px', padding: '16px 18px', color: '#f1f5f9', fontSize: '16px',
            outline: 'none', marginBottom: '16px', fontFamily: 'Sora, sans-serif',
          }}
        />

        <button
          onClick={() => step < steps.length - 1 ? setStep(s => s + 1) : finish()}
          disabled={!data[current.field] || saving}
          style={{
            width: '100%', padding: '15px', borderRadius: '14px', fontSize: '15px', fontWeight: 800,
            background: data[current.field] ? 'linear-gradient(135deg,#10b981,#059669)' : 'rgba(255,255,255,0.08)',
            color: data[current.field] ? '#fff' : 'rgba(255,255,255,0.3)',
            border: 'none', cursor: data[current.field] ? 'pointer' : 'not-allowed',
            transition: 'all .2s', boxShadow: data[current.field] ? '0 4px 20px rgba(16,185,129,0.3)' : 'none',
          }}>
          {saving ? 'Salvando...' : step < steps.length - 1 ? 'Continuar →' : 'Entrar no sistema 🚀'}
        </button>

        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)} style={{ marginTop: '12px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '13px', cursor: 'pointer', width: '100%', textAlign: 'center' }}>
            ← Voltar
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Estilos de loading ───────────────────────────────────────────────────────
const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: '#060a12',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: "'Sora', sans-serif",
}

const spinnerStyle: React.CSSProperties = {
  width: '32px',
  height: '32px',
  border: '3px solid rgba(255,255,255,0.1)',
  borderTop: '3px solid #10b981',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
  marginBottom: '16px',
}

const textStyle: React.CSSProperties = {
  color: '#f1f5f9',
  fontSize: '14px',
}
