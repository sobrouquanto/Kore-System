/**
 * src/lib/notifications.ts
 *
 * Push Notifications para o Kore System.
 *
 * Estratégia:
 *   1. Web Push API (VAPID) — notificações mesmo com o app fechado
 *   2. Supabase Realtime — fallback em tempo real quando o app está aberto
 *
 * Setup necessário:
 *   1. Gerar chaves VAPID:
 *      npx web-push generate-vapid-keys
 *
 *   2. Adicionar ao .env:
 *      NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
 *      VAPID_PRIVATE_KEY=...
 *
 *   3. Criar tabela no Supabase:
 *      Ver SQL ao final deste arquivo (comentário)
 *
 *   4. Criar API Route:
 *      src/app/api/push/subscribe/route.ts  — salva subscription
 *      src/app/api/push/send/route.ts       — envia notificação
 */

import { supabase } from '@/lib/supabase'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type NotificationEvent =
  | 'das_vencendo'
  | 'receber_vencendo'
  | 'limite_mei'
  | 'pagamento_recebido'

export interface KoreNotification {
  id: string
  title: string
  body: string
  event: NotificationEvent
  read: boolean
  created_at: string
  data?: Record<string, unknown>
}

// ─── Permissão e Subscription ────────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false

  const result = await Notification.requestPermission()
  return result === 'granted'
}

export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null

  const granted = await requestNotificationPermission()
  if (!granted) return null

  const registration = await navigator.serviceWorker.ready

  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  if (!vapidKey) {
    console.warn('[notifications] NEXT_PUBLIC_VAPID_PUBLIC_KEY não configurada')
    return null
  }

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidKey),
  })

  // Salva no backend
  await savePushSubscription(subscription)

  return subscription
}

async function savePushSubscription(subscription: PushSubscription) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: user.id,
      subscription: subscription.toJSON(),
    }),
  })
}

export async function unsubscribeFromPush(): Promise<void> {
  if (!('serviceWorker' in navigator)) return

  const registration = await navigator.serviceWorker.getRegistration()
  if (!registration) return

  const subscription = await registration.pushManager.getSubscription()
  if (!subscription) return

  await subscription.unsubscribe()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', user.id)
}

// ─── Notificações in-app (Supabase) ──────────────────────────────────────────

export async function getNotifications(): Promise<KoreNotification[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return (data ?? []) as KoreNotification[]
}

export async function markAsRead(id: string): Promise<void> {
  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id)
}

export async function markAllAsRead(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', user.id)
    .eq('read', false)
}

export async function getUnreadCount(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0

  const { count } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('read', false)

  return count ?? 0
}

// ─── Realtime subscription ────────────────────────────────────────────────────

export function subscribeToNotifications(
  userId: string,
  onNew: (notification: KoreNotification) => void
) {
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onNew(payload.new as KoreNotification)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const buffer = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) {
    buffer[i] = rawData.charCodeAt(i)
  }
  return buffer.buffer
}

export function getNotificationIcon(event: NotificationEvent): string {
  const icons: Record<NotificationEvent, string> = {
    das_vencendo: '🏛️',
    receber_vencendo: '⏰',
    limite_mei: '⚠️',
    pagamento_recebido: '💰',
  }
  return icons[event] ?? '🔔'
}

export function getNotificationColor(event: NotificationEvent): string {
  const colors: Record<NotificationEvent, string> = {
    das_vencendo: 'var(--amber)',
    receber_vencendo: 'var(--amber)',
    limite_mei: 'var(--red)',
    pagamento_recebido: 'var(--green)',
  }
  return colors[event] ?? 'var(--primary)'
}

/*
─── SQL: Tabelas necessárias no Supabase ─────────────────────────────────────

-- Notificações in-app
CREATE TABLE notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       text NOT NULL,
  body        text NOT NULL,
  event       text NOT NULL,
  read        boolean NOT NULL DEFAULT false,
  data        jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_notifications" ON notifications
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX notifications_user_unread ON notifications(user_id, read)
  WHERE read = false;

-- Push subscriptions
CREATE TABLE push_subscriptions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription jsonb NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_push_subs" ON push_subscriptions
  FOR ALL USING (auth.uid() = user_id);
*/
