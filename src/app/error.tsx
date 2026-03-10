'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Kore Error]', error)
  }, [error])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#060a12',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Sora', sans-serif",
      color: '#f1f5f9',
      padding: 20,
      position: 'relative',
    }}>
      {/* Ambient red */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', width: 500, height: 500,
          top: -150, left: '25%',
          background: 'radial-gradient(circle, rgba(239,68,68,0.04) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
      </div>

      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, maxWidth: 420 }}>
        {/* Ícone */}
        <div style={{
          width: 64, height: 64,
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, margin: '0 auto 20px',
        }}>
          ⚠️
        </div>

        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, marginBottom: 8 }}>
          Algo deu errado
        </div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginBottom: 8, lineHeight: 1.6 }}>
          Ocorreu um erro inesperado. Você pode tentar novamente ou voltar ao dashboard.
        </div>

        {/* Detalhes do erro em dev */}
        {process.env.NODE_ENV === 'development' && error?.message && (
          <div style={{
            margin: '16px 0',
            padding: '12px 14px',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 10,
            fontSize: 11,
            fontFamily: "'DM Mono', monospace",
            color: '#fca5a5',
            textAlign: 'left',
            wordBreak: 'break-word',
          }}>
            {error.message}
            {error.digest && (
              <div style={{ marginTop: 4, opacity: 0.5 }}>digest: {error.digest}</div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 24 }}>
          <button
            onClick={reset}
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: '#fff',
              border: 'none',
              padding: '11px 24px',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Tentar novamente
          </button>
          <a
            href="/app"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.6)',
              padding: '11px 24px',
              borderRadius: 10,
              fontWeight: 600,
              fontSize: 13,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            ← Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
