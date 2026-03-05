import { Suspense } from 'react'
import OnboardingContent from './OnboardingContent'

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex',
        alignItems: 'center', justifyContent: 'center', color: '#fff',
        fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>
        Carregando...
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  )
}