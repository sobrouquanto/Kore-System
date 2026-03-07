'use client'
import Image from 'next/image'

interface KoreLogoProps {
  size?: number
  showName?: boolean
  variant?: 'color' | 'white'
}

export function KoreLogo({ size = 32, showName = false }: KoreLogoProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <Image
        src="/kore-logo.png"
        alt="Kore Logo"
        width={size}
        height={size}
        style={{ background: 'transparent' }}
        priority
      />
      {showName && (
        <span style={{
          fontSize: '16px',
          fontWeight: 800,
          color: '#f1f5f9',
          letterSpacing: '-0.5px',
        }}>
          Kore<span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 400, fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', marginLeft: '5px' }}>System</span>
        </span>
      )}
    </div>
  )
}
