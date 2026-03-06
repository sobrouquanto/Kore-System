'use client'

import { useState, useEffect, Suspense, lazy } from 'react'
import { DashboardProvider, useDashboard } from '@/context/DashboardContext'
import DashboardLayout, { TabId } from '@/app/app/DashboardLayout'
import { ErrorBoundary } from '@/components/ErrorBoundary'

// ── Lazy-loaded tabs ──────────────────────────────────────────────────────────
const CockpitTab       = lazy(() => import('@/app/app/tabs/CockpitTab'))
const FinanceiroTab    = lazy(() => import('@/app/app/tabs/FinanceiroTab'))
const LancamentosTab   = lazy(() => import('@/app/app/tabs/LancamentosTab'))
const ClientesTab      = lazy(() => import('@/app/app/tabs/ClientesTab'))
const OrcamentosTab    = lazy(() => import('@/app/app/tabs/OrcamentosTab'))
const IATab            = lazy(() => import('@/app/app/tabs/IATab'))
const RelatoriosTab    = lazy(() => import('@/app/app/tabs/RelatoriosTab'))
const SimuladoresTab   = lazy(() => import('@/app/app/tabs/SimuladoresTab'))
const IntegracoesTab   = lazy(() => import('@/app/app/tabs/IntegracoesTab'))
const ConfiguracoesTab = lazy(() => import('@/app/app/tabs/ConfiguracoesTab'))

// ── Loading skeleton ──────────────────────────────────────────────────────────
function TabSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {[1, 2, 3].map(i => (
        <div key={i} className="card" style={{ height: '120px', animation: 'pulse 1.5s ease-in-out infinite' }} />
      ))}
    </div>
  )
}

// ── Inner dashboard (has access to context) ───────────────────────────────────
function Dashboard() {
  const { loading, registerActiveTabSetter } = useDashboard()
  const [activeTab, setActiveTab] = useState<TabId>('cockpit')

  // Register the real setter so context-level setActiveTab() works inside tabs
  useEffect(() => {
    registerActiveTabSetter(setActiveTab as (tab: string) => void)
  }, [registerActiveTabSetter])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)', flexDirection: 'column', gap: '16px' }}>
        <div style={{ fontSize: '32px', animation: 'spin 1s linear infinite' }}>⚡</div>
        <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Carregando seu dashboard...</div>
      </div>
    )
  }

  function renderTab() {
    switch (activeTab) {
      case 'cockpit':       return <CockpitTab />
      case 'financeiro':    return <FinanceiroTab />
      case 'lancamentos':   return <LancamentosTab />
      case 'clientes':      return <ClientesTab />
      case 'orcamentos':    return <OrcamentosTab />
      case 'ia':            return <IATab />
      case 'relatorios':    return <RelatoriosTab />
      case 'simuladores':   return <SimuladoresTab />
      // Sprint 3: bug fix — case duplicado removido; ErrorBoundary mantido
      case 'integracoes':   return (
        <ErrorBoundary>
          <IntegracoesTab />
        </ErrorBoundary>
      )
      case 'configuracoes': return <ConfiguracoesTab />
      default:              return <CockpitTab />
    }
  }

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <Suspense fallback={<TabSkeleton />}>
        {renderTab()}
      </Suspense>
    </DashboardLayout>
  )
}

// ── Page export ───────────────────────────────────────────────────────────────
export default function AppPage() {
  return (
    <DashboardProvider>
      <Dashboard />
    </DashboardProvider>
  )
}
