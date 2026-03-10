import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--sans)',
      color: 'var(--text)',
      padding: 20,
      position: 'relative',
    }}>
      {/* Ambient */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', width: 600, height: 600,
          top: -200, left: '20%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
      </div>

      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{
          fontSize: 96,
          fontWeight: 900,
          letterSpacing: -4,
          background: 'linear-gradient(135deg, var(--primary), rgba(59,130,246,0.3))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1,
          marginBottom: 16,
        }}>
          404
        </div>

        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
          Página não encontrada
        </div>
        <div style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 32, maxWidth: 320 }}>
          A rota que você tentou acessar não existe ou foi movida.
        </div>

        <Link href="/app" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'linear-gradient(135deg, var(--primary), var(--primary2))',
          color: '#fff',
          padding: '11px 24px',
          borderRadius: 10,
          fontWeight: 700,
          fontSize: 13,
          textDecoration: 'none',
        }}>
          ← Voltar ao Dashboard
        </Link>
      </div>
    </div>
  )
}
