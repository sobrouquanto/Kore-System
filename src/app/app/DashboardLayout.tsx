'use client'

import { useState, useEffect } from 'react'
import { useDashboard, fmt, Toast } from '@/context/DashboardContext'
import { ConfirmModal, HealthRing } from '@/components/ui'

export type TabId =
  | 'cockpit' | 'financeiro' | 'lancamentos' | 'clientes'
  | 'orcamentos' | 'ia' | 'relatorios' | 'simuladores'
  | 'integracoes' | 'configuracoes'

const NAV_ITEMS: { id: TabId; icon: string; label: string }[] = [
  { id: 'cockpit',       icon: '⚡',  label: 'Cockpit' },
  { id: 'financeiro',    icon: '📊',  label: 'Financeiro' },
  { id: 'lancamentos',   icon: '📝',  label: 'Lançamentos' },
  { id: 'clientes',      icon: '👥',  label: 'Clientes' },
  { id: 'orcamentos',    icon: '📋',  label: 'Orçamentos' },
  { id: 'ia',            icon: '🤖',  label: 'IA Assistente' },
  { id: 'relatorios',    icon: '📈',  label: 'Relatórios' },
  { id: 'simuladores',   icon: '🧮',  label: 'Simuladores' },
  { id: 'integracoes',   icon: '🔗',  label: 'Integrações' },
  { id: 'configuracoes', icon: '⚙️', label: 'Configurações' },
]

const TAB_LABELS: Record<TabId, string> = Object.fromEntries(
  NAV_ITEMS.map(n => [n.id, n.label])
) as any

// ── Toast item animado ────────────────────────────────────────────────────────
function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Pequeno delay para triggar a animação de entrada
    const t = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(t)
  }, [])

  const configs = {
    success: { icon: '✓', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', color: '#6ee7b7' },
    error:   { icon: '✕', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)',  color: '#fca5a5' },
    warning: { icon: '⚠', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', color: '#fcd34d' },
    info:    { icon: 'i', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.3)',  color: '#93c5fd' },
  }
  const c = configs[toast.type]

  return (
    <div
      onClick={onDismiss}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '12px 16px', borderRadius: '12px',
        background: c.bg, border: `1px solid ${c.border}`,
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        cursor: 'pointer', minWidth: '260px', maxWidth: '360px',
        transform: visible ? 'translateX(0) scale(1)' : 'translateX(60px) scale(0.95)',
        opacity: visible ? 1 : 0,
        transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
      }}
    >
      {/* Ícone */}
      <div style={{
        width: '24px', height: '24px', borderRadius: '50%',
        background: c.border, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '11px', fontWeight: 900,
        color: c.color, flexShrink: 0,
      }}>
        {c.icon}
      </div>
      {/* Mensagem */}
      <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.9)', flex: 1, lineHeight: '1.4' }}>
        {toast.message}
      </span>
      {/* Fechar */}
      <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.25)', flexShrink: 0 }}>×</span>
    </div>
  )
}

// ── Container de toasts ───────────────────────────────────────────────────────
function ToastContainer() {
  const { toasts, dismissToast } = useDashboard()

  return (
    <div style={{
      position: 'fixed', top: '20px', right: '20px',
      display: 'flex', flexDirection: 'column', gap: '8px',
      zIndex: 9999, pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{ pointerEvents: 'all' }}>
          <ToastItem toast={t} onDismiss={() => dismissToast(t.id)} />
        </div>
      ))}
    </div>
  )
}

// ── LogoutButton com confirmação ──────────────────────────────────────────────
function LogoutButton() {
  const { doLogout } = useDashboard()
  const [hovered, setHovered] = useState(false)
  const [confirming, setConfirming] = useState(false)

  if (confirming) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '6px 8px', borderRadius: '8px',
        background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
      }}>
        <span style={{ fontSize: '11px', color: '#fca5a5', fontWeight: 600 }}>Sair?</span>
        <button
          onClick={doLogout}
          style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
        >Sim</button>
        <button
          onClick={() => setConfirming(false)}
          style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.35)', padding: '2px 6px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' }}
        >Não</button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title="Sair da conta"
      style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        background: hovered ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.04)',
        border: hovered ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(255,255,255,0.08)',
        color: hovered ? '#fca5a5' : 'rgba(255,255,255,0.35)',
        padding: '6px 10px', borderRadius: '8px',
        cursor: 'pointer', fontSize: '12px', fontWeight: 600,
        transition: 'all 0.15s', fontFamily: 'inherit', flexShrink: 0,
      }}
    >
      {/* SVG power icon — sem dependência de emoji */}
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
        <line x1="12" y1="2" x2="12" y2="12" />
      </svg>
      <span style={{ fontSize: '11px' }}>Sair</span>
    </button>
  )
}

// ── Layout principal ──────────────────────────────────────────────────────────
export default function DashboardLayout({
  activeTab,
  setActiveTab,
  children,
}: {
  activeTab: TabId
  setActiveTab: (tab: TabId) => void
  children: React.ReactNode
}) {
  const { userName, userBiz, stats, trialDaysLeft, trialExpired, planActive, confirmModal, setConfirmModal } = useDashboard()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const trialBannerColor = trialDaysLeft <= 1 ? 'var(--red)' : trialDaysLeft <= 3 ? 'var(--amber)' : 'var(--blue)'

  return (
    <div className="layout">

      {/* ── SIDEBAR ─────────────────────────────────────── */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>

        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">M</div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 900, letterSpacing: '-0.5px' }}>MEI 360</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', textTransform: 'uppercase' }}>OS</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'nav-item-active' : ''}`}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false) }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.id === 'ia' && (
                <span style={{ marginLeft: 'auto', fontSize: '9px', background: 'var(--green-dim)', border: '1px solid var(--green-border)', color: 'var(--green)', padding: '2px 6px', borderRadius: '99px', fontWeight: 700 }}>AI</span>
              )}
            </button>
          ))}
        </nav>

        {/* Trial banner */}
        {trialExpired ? (
          <div className="sidebar-trial" style={{ borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--red)', marginBottom: '4px' }}>🚨 Trial expirado</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '10px' }}>Assine para continuar usando</div>
            <button className="btn-add" style={{ width: '100%', fontSize: '12px', padding: '8px' }} onClick={() => window.open('/assinar', '_blank')}>
              Assinar agora →
            </button>
          </div>
        ) : !planActive && trialDaysLeft <= 7 && (
          <div className="sidebar-trial" style={{ borderColor: `rgba(${trialDaysLeft <= 1 ? '239,68,68' : trialDaysLeft <= 3 ? '245,158,11' : '59,130,246'},0.3)` }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: trialBannerColor, marginBottom: '4px' }}>
              {trialDaysLeft === 0 ? '🚨 Último dia' : `⏳ ${trialDaysLeft} dia${trialDaysLeft > 1 ? 's' : ''} restante${trialDaysLeft > 1 ? 's' : ''}`}
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '10px' }}>Período de avaliação</div>
            <button className="btn-add" style={{ width: '100%', fontSize: '12px', padding: '8px' }} onClick={() => window.open('/assinar', '_blank')}>
              Assinar R$29/mês →
            </button>
          </div>
        )}

        {/* User footer — logout bonito */}
        <div className="sidebar-footer">
          <div className="sidebar-user-avatar">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userBiz}</div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── MAIN ────────────────────────────────────────── */}
      <main className="main">

        {/* Topbar */}
        <div className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.5px' }}>
                {NAV_ITEMS.find(n => n.id === activeTab)?.icon} {TAB_LABELS[activeTab]}
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '1px' }}>
                {userBiz} · {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="topbar-stats">
            <div className="topbar-stat">
              <span style={{ color: 'var(--green)', fontFamily: 'var(--mono)', fontWeight: 800, fontSize: '15px' }}>{fmt(stats.monthRevenue)}</span>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1px' }}>Receita mês</span>
            </div>
            <div className="topbar-stat">
              <span style={{ color: '#6ee7b7', fontFamily: 'var(--mono)', fontWeight: 800, fontSize: '15px' }}>{fmt(stats.monthProfit)}</span>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1px' }}>Lucro</span>
            </div>
            <div className="topbar-stat" style={{ alignItems: 'center' }}>
              <HealthRing score={stats.healthScore} />
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="page-content">
          {children}
        </div>
      </main>

      {/* ── CONFIRM MODAL ───────────────────────────────── */}
      {confirmModal && (
        <ConfirmModal
          msg={confirmModal.msg}
          onOk={() => { confirmModal.onOk(); setConfirmModal(null) }}
          onCancel={() => setConfirmModal(null)}
        />
      )}

      {/* ── TOASTS ──────────────────────────────────────── */}
      <ToastContainer />
    </div>
  )
}
