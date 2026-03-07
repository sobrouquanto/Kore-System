'use client'

import { useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'

// ── Botão voltar ──────────────────────────────────────────────
function BackButton({ href, label = 'Voltar' }: { href: string; label?: string }) {
  const router = useRouter()
  return (
    <button
      onClick={() => router.push(href)}
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

// ── Logo Kore ─────────────────────────────────────────────────
function KoreLogo() {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
      <img src="/kore-logo.png" alt="Kore" width={32} height={32} style={{ borderRadius: '6px' }} />
      <div style={{ fontSize: '22px', fontWeight: 900, color: '#f1f5f9', letterSpacing: '-0.5px' }}>
        Kore <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 400, fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>System</span>
      </div>
    </div>
  )
}

function LoginForm() {
  const searchParams  = useSearchParams()
  // Suporta ?mode=signup (vindo da landing) e ?redirectedFrom / ?next
  const initialMode   = searchParams.get('mode') === 'signup' ? 'signup' : 'login'
  const redirectedFrom = searchParams.get('redirectedFrom') || searchParams.get('next') || null

  const [mode, setMode]         = useState<'login' | 'signup'>(initialMode)
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]         = useState('')
  const [business, setBusiness] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')

  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error

        const { data: profile } = await supabase
          .from('profiles')
          .select('plano_ativo, onboarding_done')
          .eq('id', data.user.id)
          .single()

        router.refresh()
        await new Promise(r => setTimeout(r, 50))

        if (redirectedFrom && profile?.plano_ativo && profile?.onboarding_done) {
          router.push(redirectedFrom)
        } else if (profile?.plano_ativo && profile?.onboarding_done) {
          router.push('/app')
        } else if (!profile?.plano_ativo) {
          router.push('/assinar')
        } else {
          router.push('/onboarding')
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name, name: name, business_name: business }
          }
        })
        if (error) throw error

        if (data.user) {
          await supabase
            .from('profiles')
            .upsert(
              { id: data.user.id, email: data.user.email, nome_empresa: business },
              { onConflict: 'id' }
            )
          router.push('/assinar')
          router.refresh()
        }
      }
    } catch (err: any) {
      if (err.message.includes('Invalid login'))          setError('E-mail ou senha incorretos.')
      else if (err.message.includes('already registered')) setError('Este e-mail já possui cadastro.')
      else if (err.message.includes('Password'))          setError('A senha precisa ter no mínimo 6 caracteres.')
      else setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0B0B0F',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', sans-serif", padding: '20px',
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');`}</style>

      <BackButton href="/" label="Página inicial" />

      {/* Orbs de fundo */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: '600px', height: '600px', top: '-200px', left: '10%', background: 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', width: '400px', height: '400px', bottom: '-100px', right: '5%', background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <KoreLogo />
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>
            O núcleo financeiro do seu negócio
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px', padding: '32px',
        }}>
          {/* Tabs login / criar conta */}
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '4px', marginBottom: '24px' }}>
            {(['login', 'signup'] as const).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(''); setSuccess('') }}
                style={{
                  flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  background: mode === m ? '#3B82F6' : 'transparent',
                  color: mode === m ? '#fff' : 'rgba(255,255,255,0.5)',
                  fontWeight: 700, fontSize: '14px', transition: 'all .2s', fontFamily: 'inherit',
                }}
              >
                {m === 'login' ? 'Entrar' : 'Criar conta'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {mode === 'signup' && (<>
              <div>
                <label style={labelStyle}>SEU NOME</label>
                <input value={name} onChange={e => setName(e.target.value)} required placeholder="João Silva" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>NOME DO NEGÓCIO</label>
                <input value={business} onChange={e => setBusiness(e.target.value)} required placeholder="Silva Elétrica" style={inputStyle} />
              </div>
            </>)}

            <div>
              <label style={labelStyle}>E-MAIL</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="seu@email.com" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>SENHA</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" minLength={6} style={inputStyle} />
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px', fontSize: '13px', color: '#fca5a5' }}>
                ✗ {error}
              </div>
            )}
            {success && (
              <div style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '10px', padding: '12px', fontSize: '13px', color: '#93c5fd' }}>
                ✓ {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? 'rgba(59,130,246,0.5)' : '#3B82F6',
                color: '#fff', border: 'none', padding: '14px',
                borderRadius: '12px', fontSize: '15px', fontWeight: 800,
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '4px',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(59,130,246,0.3)',
                fontFamily: 'inherit',
                transition: 'all .2s',
              }}
            >
              {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar no sistema' : 'Criar conta grátis'}
            </button>
          </form>
        </div>

        {mode === 'signup' && (
          <p style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '16px' }}>
            ✓ 14 dias grátis &nbsp;·&nbsp; ✓ Sem compromisso &nbsp;·&nbsp; ✓ Cancele quando quiser
          </p>
        )}

        {mode === 'login' && (
          <p style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.25)', marginTop: '16px' }}>
            Ainda não tem conta?{' '}
            <button
              onClick={() => setMode('signup')}
              style={{ background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer', fontSize: '12px', fontWeight: 700, fontFamily: 'inherit' }}
            >
              Criar grátis
            </button>
          </p>
        )}
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0B0B0F' }} />}>
      <LoginForm />
    </Suspense>
  )
}

const labelStyle: React.CSSProperties = {
  fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 600,
  letterSpacing: '0.5px', display: 'block', marginBottom: '6px',
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
  padding: '12px 14px', color: '#f1f5f9', fontSize: '14px',
  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
}
