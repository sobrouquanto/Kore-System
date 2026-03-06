// KoreLogo.tsx — Logo oficial Kore System
// K angular com cor sólida #3B82F6 (Azul Kore) + wordmark "Kore" / "System"
// Props:
//   size     — altura do K em px (default 32)
//   showName — exibir wordmark (default true)
//   variant  — 'color' usa Azul Kore (#3B82F6), 'white' usa branco puro

interface KoreLogoProps {
  size?: number
  showName?: boolean
  variant?: 'color' | 'white'
}

export function KoreLogo({ size = 32, showName = true, variant = 'color' }: KoreLogoProps) {
  const kColor = variant === 'white' ? '#ffffff' : '#3B82F6'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: Math.round(size * 0.35) }}>
      {/* Ícone K — 3 traços angulares conforme identidade visual */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Barra vertical esquerda */}
        <path d="M8 5 L8 27"   stroke={kColor} strokeWidth="3.5" strokeLinecap="round" />
        {/* Diagonal superior */}
        <path d="M8 16 L24 5"  stroke={kColor} strokeWidth="3.5" strokeLinecap="round" />
        {/* Diagonal inferior */}
        <path d="M8 16 L24 27" stroke={kColor} strokeWidth="3.5" strokeLinecap="round" />
      </svg>

      {showName && (
        <div style={{ lineHeight: 1, userSelect: 'none' }}>
          <div style={{
            fontSize: Math.round(size * 0.56),
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#ffffff',
            lineHeight: 1.1,
            fontFamily: 'Inter, sans-serif',
          }}>
            Kore
          </div>
          <div style={{
            fontSize: Math.round(size * 0.28),
            fontWeight: 500,
            letterSpacing: '0.12em',
            textTransform: 'uppercase' as const,
            color: 'rgba(255,255,255,0.38)',
            marginTop: '1px',
            fontFamily: 'Inter, sans-serif',
          }}>
            System
          </div>
        </div>
      )}
    </div>
  )
}
