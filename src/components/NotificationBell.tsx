'use client'

/**
 * src/components/NotificationBell.tsx
 *
 * Sino de notificações para o topbar.
 * Usa Supabase Realtime para receber notificações em tempo real.
 *
 * Uso no topbar:
 *   import NotificationBell from '@/components/NotificationBell'
 *   <NotificationBell userId={user.id} />
 */

import { useEffect, useState, useRef } from 'react'
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  subscribeToNotifications,
  getNotificationIcon,
  getNotificationColor,
  type KoreNotification,
} from '@/lib/notifications'

interface Props {
  userId: string
}

export default function NotificationBell({ userId }: Props) {
  const [notifications, setNotifications] = useState<KoreNotification[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const panelRef = useRef<HTMLDivElement>(null)

  const unread = notifications.filter(n => !n.read).length

  // Carrega notificações iniciais
  useEffect(() => {
    getNotifications().then(data => {
      setNotifications(data)
      setLoading(false)
    })
  }, [])

  // Realtime — novas notificações
  useEffect(() => {
    const unsub = subscribeToNotifications(userId, (notification) => {
      setNotifications(prev => [notification, ...prev])
      // Notificação nativa do browser se permitido
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.body,
          icon: '/kore-logo.png',
        })
      }
    })
    return unsub
  }, [userId])

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  async function handleMarkRead(id: string) {
    await markAsRead(id)
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  async function handleMarkAll() {
    await markAllAsRead()
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  function formatTime(dateStr: string) {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
    if (diff < 60) return 'agora'
    if (diff < 3600) return `${Math.floor(diff / 60)}min`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      {/* Botão sino */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'relative',
          background: open ? 'var(--primary-dim)' : 'var(--card)',
          border: `1px solid ${open ? 'var(--primary-border)' : 'var(--card-border)'}`,
          borderRadius: 10,
          width: 36, height: 36,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          color: open ? 'var(--primary)' : 'var(--text2)',
          transition: 'all 0.15s',
          flexShrink: 0,
        }}
        title="Notificações"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {/* Badge de não lidos */}
        {unread > 0 && (
          <div style={{
            position: 'absolute',
            top: -4, right: -4,
            minWidth: 16, height: 16,
            background: 'var(--red)',
            borderRadius: 99,
            fontSize: 9,
            fontWeight: 800,
            color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 4px',
            border: '2px solid var(--bg)',
          }}>
            {unread > 9 ? '9+' : unread}
          </div>
        )}
      </button>

      {/* Painel dropdown */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 44, right: 0,
          width: 340,
          background: '#111827',
          border: '1px solid var(--card-border)',
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          zIndex: 500,
          overflow: 'hidden',
        }}>
          {/* Header do painel */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px',
            borderBottom: '1px solid var(--card-border)',
          }}>
            <div style={{ fontWeight: 800, fontSize: 14 }}>
              Notificações
              {unread > 0 && (
                <span style={{
                  marginLeft: 8,
                  background: 'var(--red-dim)',
                  color: 'var(--red)',
                  borderRadius: 99,
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 8px',
                }}>
                  {unread} nova{unread > 1 ? 's' : ''}
                </span>
              )}
            </div>
            {unread > 0 && (
              <button
                onClick={handleMarkAll}
                style={{
                  background: 'none', border: 'none',
                  color: 'var(--primary)', fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Marcar todas
              </button>
            )}
          </div>

          {/* Lista */}
          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            {loading && (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
                Carregando...
              </div>
            )}

            {!loading && notifications.length === 0 && (
              <div style={{ padding: 32, textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🔔</div>
                <div style={{ color: 'var(--text3)', fontSize: 13 }}>Nenhuma notificação ainda</div>
              </div>
            )}

            {notifications.map(n => (
              <div
                key={n.id}
                onClick={() => !n.read && handleMarkRead(n.id)}
                style={{
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                  padding: '12px 16px',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  background: n.read ? 'transparent' : 'rgba(255,255,255,0.02)',
                  cursor: n.read ? 'default' : 'pointer',
                  transition: 'background 0.15s',
                }}
              >
                {/* Ícone */}
                <div style={{
                  width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid rgba(255,255,255,0.08)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16,
                }}>
                  {getNotificationIcon(n.event)}
                </div>

                {/* Conteúdo */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: n.read ? 500 : 700,
                    color: n.read ? 'var(--text2)' : 'var(--text)',
                    lineHeight: 1.3,
                  }}>
                    {n.title}
                  </div>
                  <div style={{
                    fontSize: 12, color: 'var(--text3)', marginTop: 3, lineHeight: 1.4,
                  }}>
                    {n.body}
                  </div>
                  <div style={{
                    fontSize: 11, marginTop: 4,
                    color: getNotificationColor(n.event),
                    fontWeight: 600,
                  }}>
                    {formatTime(n.created_at)}
                  </div>
                </div>

                {/* Ponto não lido */}
                {!n.read && (
                  <div style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: 'var(--primary)',
                    flexShrink: 0, marginTop: 4,
                  }} />
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div style={{
              padding: '10px 16px',
              borderTop: '1px solid var(--card-border)',
              textAlign: 'center',
            }}>
              <button
                style={{
                  background: 'none', border: 'none',
                  color: 'var(--text3)', fontSize: 12,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Ver histórico completo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
