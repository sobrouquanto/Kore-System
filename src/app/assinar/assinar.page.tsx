'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AssinarPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      setUser(user)
    })
  }, [])

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
        const msg = (data && (data.error || data.message)) ? (data.error || data.message) : 'Erro ao iniciar checkout. Tente novamente.'
        alert(msg)
        return
      }

      if (data?.url) {
        window.location.href = data.url
        return
      }

      alert('Checkout não retornou uma URL. Verifique as configurações e tente novamente.')
    } catch {
      alert('Erro de conexao. Tente novamente.')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#060a12', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Sora',sans-serif", color: '#f1f5f9', padding: '20px' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&display=swap');*{margin:0;padding:0;box-sizing:border-box;}`}</style>
      <div style={{ maxWidth: '440px', width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '52px', marginBottom: '20px' }}>🚀</div>
        <h1 style={{ fontSize: '30px', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: '8px', lineHeight: 1.2 }}>
          Comece seus 7 dias gratis
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '32px', lineHeight: 1.6, fontSize: '15px' }}>
          Nenhuma cobranca hoje. Depois R$29/mes.<br />
          Cancele antes do 7 dia e nao paga nada.
        </p>

        <div style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.1),rgba(16,185,129,0.04))', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '20px', padding: '28px', marginBottom: '24px', textAlign: 'left' }}>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>O que esta incluido</div>
          {[
            ['🤖', 'IA que lanca transacoes por voce'],
            ['💰', 'Financeiro completo + Fluxo de caixa'],
            ['📋', 'Orcamentos + Envio por WhatsApp'],
            ['⚠️', 'Alerta DAS + Limite MEI'],
            ['📥', 'Exportacao de relatorios CSV'],
            ['🔍', 'Busca automatica de CNPJ'],
          ].map(([icon, text]) => (
            <div key={text as string} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '9px 0', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.75)' }}>
              <span>{icon}</span> {text}
            </div>
          ))}
        </div>

        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '16px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '2px' }}>Apos o trial</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#10b981', fontFamily: 'DM Mono,monospace' }}>R$29<span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', fontFamily: 'Sora,sans-serif' }}>/mes</span></div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '13px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
            Cancele quando quiser<br />Sem fidelidade
          </div>
        </div>

        <button
          onClick={startCheckout}
          disabled={loading || !user}
          style={{ width: '100%', padding: '16px', borderRadius: '14px', fontSize: '16px', fontWeight: 800, background: loading ? 'rgba(16,185,129,0.5)' : 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 8px 32px rgba(16,185,129,0.3)', transition: 'all .2s', marginBottom: '12px' }}>
          {loading ? 'Redirecionando...' : 'Iniciar 7 dias gratis'}
        </button>

        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', lineHeight: 1.6 }}>
          Pagamento seguro via Stripe · Cartao de credito<br />
          Voce recebera um aviso 1 dia antes de ser cobrado
        </p>

        <button
          onClick={() => router.push('/app')}
          style={{ marginTop: '16px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.25)', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}>
          Voltar ao app
        </button>
      </div>
    </div>
  )
}
