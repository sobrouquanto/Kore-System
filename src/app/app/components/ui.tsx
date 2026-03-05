'use client'
import { fmt } from '@/context/DashboardContext'

// ─── HealthRing ───────────────────────────────────────────────────────────────

export function HealthRing({ score }: { score: number }) {
  const c = 2 * Math.PI * 36
  const offset = c - (score / 100) * c
  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444'
  return (
    <svg width="90" height="90" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx="45" cy="45" r="36" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="7" />
      <circle cx="45" cy="45" r="36" fill="none" stroke={color} strokeWidth="7"
        strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s ease' }} />
      <text x="45" y="45" fill={color} fontFamily="DM Mono, monospace" fontSize="15"
        fontWeight="800" textAnchor="middle" dominantBaseline="middle"
        transform="rotate(90,45,45)">{score}</text>
    </svg>
  )
}

// ─── StatsCard ────────────────────────────────────────────────────────────────

type StatsCardProps = {
  title: string
  value: string
  sub?: string
  color?: string
  variant?: 'default' | 'green' | 'blue' | 'red' | 'amber'
  children?: React.ReactNode
}

export function StatsCard({ title, value, sub, color, variant = 'default', children }: StatsCardProps) {
  const variantClass = variant === 'green' ? 'card-green' : variant === 'blue' ? 'card-blue' : variant === 'red' ? 'card-red' : variant === 'amber' ? 'card-amber' : ''
  return (
    <div className={`card ${variantClass}`}>
      <div className="card-title">{title}</div>
      <div className="card-value" style={{ color: color }}>{value}</div>
      {sub && <div className="card-sub">{sub}</div>}
      {children}
    </div>
  )
}

// ─── LimitBar ─────────────────────────────────────────────────────────────────

export function LimitBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className="limit-bar">
      <div className="limit-bar-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg,var(--green),${color})` }} />
    </div>
  )
}

// ─── Chart6Months ─────────────────────────────────────────────────────────────

type ChartMonth = { month: string; revenue: number; expenses: number }

export function Chart6Months({ data }: { data: ChartMonth[] }) {
  const maxVal = Math.max(...data.map(d => d.revenue), 1)
  return (
    <div className="chart-container">
      {data.map((d, i) => (
        <div key={i} className="chart-bar-group">
          <div className="chart-bars" style={{ alignItems: 'flex-end', height: '110px' }}>
            <div className="cb" style={{
              height: `${Math.min((d.revenue / maxVal) * 105, 105)}px`,
              background: i === data.length - 1 ? 'linear-gradient(180deg,#6ee7b7,#10b981)' : 'rgba(255,255,255,0.12)'
            }} />
            <div className="cb" style={{
              height: `${Math.min((d.expenses / maxVal) * 105, 105)}px`,
              background: i === data.length - 1 ? 'rgba(239,68,68,0.6)' : 'rgba(239,68,68,0.25)'
            }} />
          </div>
          <div className="chart-label">{d.month}</div>
        </div>
      ))}
    </div>
  )
}

// ─── TransactionRow ───────────────────────────────────────────────────────────

import { formatDateBR } from '@/context/DashboardContext'

export function TransactionRow({ t, onDelete }: { t: any; onDelete?: () => void }) {
  return (
    <tr>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '7px',
            background: t.type === 'in' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px'
          }}>{t.type === 'in' ? '↑' : '↓'}</div>
          <span style={{ fontSize: '13px', fontWeight: 500 }}>{t.description}</span>
        </div>
      </td>
      <td><span className={`badge badge-${t.type === 'in' ? 'green' : 'red'}`}>{t.category}</span></td>
      <td style={{ color: 'var(--text3)', fontSize: '12px' }}>{formatDateBR(t.date)}</td>
      <td className={t.type === 'in' ? 'tx-in' : 'tx-out'}>{t.type === 'in' ? '+' : '-'}{fmt(t.value)}</td>
      {onDelete && (
        <td>
          <button onClick={onDelete} style={{
            background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.25)',
            color: 'var(--red)', padding: '4px 9px', borderRadius: '7px',
            fontSize: '11px', fontWeight: 700, cursor: 'pointer'
          }}>×</button>
        </td>
      )}
    </tr>
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────────

export function Badge({ variant, children }: { variant: 'green' | 'red' | 'amber' | 'blue' | 'gray'; children: React.ReactNode }) {
  const styles: Record<string, React.CSSProperties> = {
    green: { background: 'rgba(16,185,129,0.15)', color: 'var(--green)' },
    red: { background: 'rgba(239,68,68,0.15)', color: 'var(--red)' },
    amber: { background: 'rgba(245,158,11,0.15)', color: 'var(--amber)' },
    blue: { background: 'rgba(59,130,246,0.15)', color: 'var(--blue)' },
    gray: { background: 'rgba(255,255,255,0.07)', color: 'var(--text3)' },
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 700,
      ...styles[variant]
    }}>{children}</span>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export function Modal({ children, onClose, maxWidth = 480 }: { children: React.ReactNode; onClose: () => void; maxWidth?: number }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth }} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

// ─── ConfirmModal ─────────────────────────────────────────────────────────────

export function ConfirmModal({ msg, onOk, onCancel }: { msg: string; onOk: () => void; onCancel: () => void }) {
  return (
    <Modal onClose={onCancel} maxWidth={400}>
      <div style={{ fontSize: '20px', marginBottom: '12px', textAlign: 'center' }}>⚠️</div>
      <div style={{ fontSize: '15px', fontWeight: 700, textAlign: 'center', marginBottom: '8px' }}>Confirmar ação</div>
      <div style={{ fontSize: '14px', color: 'var(--text2)', textAlign: 'center', marginBottom: '24px', lineHeight: '1.5' }}>{msg}</div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button className="btn-ghost-sm" onClick={onCancel} style={{ flex: 1 }}>Cancelar</button>
        <button className="btn-add" style={{ flex: 1, background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--red)' }} onClick={onOk}>Confirmar</button>
      </div>
    </Modal>
  )
}

// ─── FormGroup ────────────────────────────────────────────────────────────────

export function FormGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="form-group-sm">
      <label>{label}</label>
      {children}
    </div>
  )
}

// ─── SectionHeader ────────────────────────────────────────────────────────────

export function SectionHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
      <div>
        <div style={{ fontSize: '14px', fontWeight: 700 }}>{title}</div>
        {sub && <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '2px' }}>{sub}</div>}
      </div>
      {action}
    </div>
  )
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

export function EmptyState({ text, action }: { text: string; action?: React.ReactNode }) {
  return (
    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)', fontSize: '13px' }}>
      {text}
      {action && <div style={{ marginTop: '12px' }}>{action}</div>}
    </div>
  )
}
