/**
 * public/sw.js
 *
 * Service Worker para receber push notifications quando o app está fechado.
 *
 * Registrar no layout.tsx ou em um useEffect:
 *
 *   useEffect(() => {
 *     if ('serviceWorker' in navigator) {
 *       navigator.serviceWorker.register('/sw.js')
 *     }
 *   }, [])
 */

self.addEventListener('push', function (event) {
  if (!event.data) return

  let payload
  try {
    payload = event.data.json()
  } catch {
    payload = { title: 'Kore System', body: event.data.text() }
  }

  const options = {
    body: payload.body ?? '',
    icon: payload.icon ?? '/kore-logo.png',
    badge: '/kore-logo.png',
    data: payload.data ?? {},
    vibrate: [100, 50, 100],
    actions: payload.actions ?? [],
  }

  event.waitUntil(
    self.registration.showNotification(payload.title ?? 'Kore System', options)
  )
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()

  const data = event.notification.data ?? {}
  const url = data.url ?? '/app'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // Foca janela existente se já estiver aberta
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      // Abre nova janela
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    })
  )
})