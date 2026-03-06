'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

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

export default function AssinarPage() {
  const router  = useRouter()
  const [loading, setLoading] = useState(false)
  const [user, setUser]       = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      setUser(user)
    })
  }, [])

  // Volta para login se tiver sessão, ou para página inicial se não tiver
  function handleBack() {
    if (user) {
      router.push('/login')
    } else {
      router.push('/')
    }
  }

  async function startCheckout() {
    if (!user) return
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, userId: user.id }),
      })
      const data = await res.json().catch(() => null)

      if (!res.ok) {
        const msg = data?.error || data?.message || 'Erro ao iniciar checkout. Tente novamente.'
        alert(msg)
        return
      }

      if (data?.url) {
        window.location.href = data.url
        return
      }

      alert('Checkout não retornou uma URL. Verifique as configurações e tente novamente.')
    } catch {
      alert('Erro de conexão. Tente novamente.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#060a12',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Sora', sans-serif", color: '#f1f5f9', padding: '20px',
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&display=swap');*{margin:0;padding:0;box-sizing:border-box;}`}</style>

      <BackButton onClick={handleBack} label="Voltar" />

      {/* Orbs de fundo */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: '600px', height: '600px', top: '-200px', left: '10%', background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      <div style={{ maxWidth: '440px', width: '100%', textAlign: 'center', position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <div style={{ width: '36px', height: '36px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '15px', color: '#10b981' }}>M</div>
          <div style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '-0.5px' }}>MEI <span style={{ color: '#10b981' }}>360</span> OS</div>
        </div>

        <h1 style={{ fontSize: '30px', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: '8px', lineHeight: 1.2 }}>
          Comece seus 7 dias grátis
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '32px', lineHeight: 1.6, fontSize: '15px' }}>
          Nenhuma cobrança hoje. Depois R$29/mês.<br />
          Cancele antes do 7º dia e não paga nada.
        </p>

        {/* Features */}
        <div style={{
          background: 'linear-gradient(135deg,rgba(16,185,129,0.1),rgba(16,185,129,0.04))',
          border: '1px solid rgba(16,185,129,0.25)',
          borderRadius: '20px', padding: '28px', marginBottom: '24px', textAlign: 'left',
        }}>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>O que está incluído</div>
          {[
            ['🤖', 'IA que lança transações por você'],
            ['💰', 'Financeiro completo + Fluxo de caixa'],
            ['📋', 'Orçamentos + Envio por WhatsApp'],
            ['⚠️', 'Alerta DAS + Limite MEI'],
            ['📥', 'Exportação de relatórios CSV'],
            ['🔍', 'Busca automática de CNPJ'],
          ].map(([icon, text]) => (
            <div key={text as string} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '9px 0', fontSize: '14px',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.75)',
            }}>
              <span>{icon}</span> {text}
            </div>
          ))}
        </div>

        {/* Preço */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '14px', padding: '16px 20px', marginBottom: '20px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '2px' }}>Após o trial</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#10b981', fontFamily: 'DM Mono, monospace' }}>
              R$29<span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', fontFamily: 'Sora, sans-serif' }}>/mês</span>
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '13px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
            Cancele quando quiser<br />Sem fidelidade
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={startCheckout}
          disabled={loading || !user}
          style={{
            width: '100%', padding: '16px', borderRadius: '14px',
            fontSize: '16px', fontWeight: 800,
            background: loading ? 'rgba(16,185,129,0.5)' : 'linear-gradient(135deg,#10b981,#059669)',
            color: '#fff', border: 'none',
            cursor: loading || !user ? 'not-allowed' : 'pointer',
            boxShadow: '0 8px 32px rgba(16,185,129,0.3)',
            transition: 'all .2s', marginBottom: '12px',
            fontFamily: 'inherit',
          }}
        >
          {loading ? 'Redirecionando...' : 'Iniciar 7 dias grátis'}
        </button>

        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', lineHeight: 1.6 }}>
          Pagamento seguro via Stripe · Cartão de crédito<br />
          Você receberá um aviso 1 dia antes de ser cobrado
        </p>
      </div>
    </div>
  )
}
