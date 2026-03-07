'use client'
import { useState } from 'react'
import { useDashboard, fmt } from '@/context/DashboardContext'
import { ConfirmModal, HealthRing } from '@/components/ui'
import { KoreLogo } from '@/components/KoreLogo'

export type TabId =
  | 'cockpit' | 'financeiro' | 'lancamentos' | 'clientes'
  | 'orcamentos' | 'ia' | 'relatorios' | 'simuladores'
  | 'diagnostico' | 'integracoes' | 'configuracoes'

const NAV_ITEMS: { id: TabId; icon: string; label: string }[] = [
  { id: 'cockpit',       icon: '⚡',  label: 'Cockpit'       },
  { id: 'financeiro',    icon: '📊',  label: 'Financeiro'    },
  { id: 'lancamentos',   icon: '📝',  label: 'Lançamentos'   },
  { id: 'clientes',      icon: '👥',  label: 'Clientes'      },
  { id: 'orcamentos',    icon: '📋',  label: 'Orçamentos'    },
  { id: 'ia',            icon: '🤖',  label: 'IA Assistente' },
  { id: 'relatorios',    icon: '📈',  label: 'Relatórios'    },
  { id: 'simuladores',   icon: '🧮',  label: 'Simuladores'   },
  { id: 'diagnostico',   icon: '🩺',  label: 'Diagnóstico'   },
  { id: 'integracoes',   icon: '🔗',  label: 'Integrações'   },
  { id: 'configuracoes', icon: '⚙️', label: 'Configurações' },
]

const TAB_LABELS: Record<TabId, string> = Object.fromEntries(
  NAV_ITEMS.map(n => [n.id, n.label])
) as any

export default function DashboardLayout({
  activeTab,
  setActiveTab,
  children,
}: {
  activeTab: TabId
  setActiveTab: (tab: TabId) => void
  children: React.ReactNode
}) {
  const {
    userName, userBiz, stats,
    trialDaysLeft, trialExpired, planActive,
    confirmModal, setConfirmModal, doLogout,
  } = useDashboard()

  const [sidebarOpen, setSidebarOpen] = useState(false)

  const trialBannerColor =
    trialDaysLeft <= 1 ? 'var(--red)' :
    trialDaysLeft <= 3 ? 'var(--amber)' :
    'var(--blue)'

  return (
    <div className="layout">

      {/* ── SIDEBAR ──────────────────────────────────── */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>

        {/* LOGO */}
        <div className="sidebar-logo">
          <KoreLogo size={32} showName={true} variant="color" />
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
                <span style={{
                  marginLeft: 'auto', fontSize: '9px',
                  background: 'var(--primary-dim)',
                  border: '1px solid var(--primary-border)',
                  color: 'var(--primary)',
                  padding: '2px 6px', borderRadius: '99px', fontWeight: 700,
                }}>AI</span>
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

        {/* User footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user-avatar">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userBiz}</div>
          </div>
          <button onClick={doLogout}
            style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.25)', cursor: 'pointer', padding: '4px', flexShrink: 0 }}
            title="Sair">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* ── MAIN ───────────────────────────────────────── */}
      <main className="main">
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

          <div className="topbar-stats">
            <div className="topbar-stat">
              <span style={{ color: 'var(--blue)', fontFamily: 'var(--mono)', fontWeight: 800, fontSize: '15px' }}>{fmt(stats.monthRevenue)}</span>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1px' }}>Receita mês</span>
            </div>
            <div className="topbar-stat">
              <span style={{ color: '#93c5fd', fontFamily: 'var(--mono)', fontWeight: 800, fontSize: '15px' }}>{fmt(stats.monthProfit)}</span>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1px' }}>Lucro</span>
            </div>
            <div className="topbar-stat" style={{ alignItems: 'center' }}>
              <HealthRing score={stats.healthScore} />
            </div>
          </div>
        </div>

        <div className="page-content">
          {children}
        </div>
      </main>

      {confirmModal && (
        <ConfirmModal
          msg={confirmModal.msg}
          onOk={() => { confirmModal.onOk(); setConfirmModal(null) }}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </div>
  )
}
