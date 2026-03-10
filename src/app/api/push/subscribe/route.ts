/**
 * src/app/api/push/subscribe/route.ts
 *
 * Salva a PushSubscription do browser no Supabase.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { subscription } = body

  if (!subscription) {
    return NextResponse.json({ error: 'Missing subscription' }, { status: 400 })
  }

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(
      { user_id: user.id, subscription },
      { onConflict: 'user_id' }
    )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}


/**
 * ─── src/app/api/push/send/route.ts ──────────────────────────────────────────
 *
 * Envia uma push notification para um usuário específico.
 * Chamado por webhooks (Kirvano, Stripe) ou por Supabase Edge Functions.
 *
 * Instalar: npm install web-push @types/web-push
 *
 * Separar em arquivo próprio em produção:
 *   src/app/api/push/send/route.ts
 */

// import { NextRequest, NextResponse } from 'next/server'
// import webpush from 'web-push'
// import { createClient } from '@supabase/supabase-js'
//
// webpush.setVapidDetails(
//   'mailto:suporte@koresystem.com.br',
//   process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
//   process.env.VAPID_PRIVATE_KEY!
// )
//
// export async function POST(request: NextRequest) {
//   // Valida secret interno para chamadas de webhook
//   const authHeader = request.headers.get('x-internal-secret')
//   if (authHeader !== process.env.INTERNAL_SECRET) {
//     return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
//   }
//
//   const { user_id, title, body, event, data } = await request.json()
//
//   const supabase = createClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.SUPABASE_SERVICE_ROLE_KEY!
//   )
//
//   // 1. Salva no banco (in-app)
//   await supabase.from('notifications').insert({
//     user_id, title, body, event, data,
//   })
//
//   // 2. Envia push se tiver subscription
//   const { data: sub } = await supabase
//     .from('push_subscriptions')
//     .select('subscription')
//     .eq('user_id', user_id)
//     .single()
//
//   if (sub?.subscription) {
//     try {
//       await webpush.sendNotification(
//         sub.subscription,
//         JSON.stringify({ title, body, icon: '/kore-logo.png', data: { event, ...data } })
//       )
//     } catch (err) {
//       // Subscription expirada — remove
//       await supabase.from('push_subscriptions').delete().eq('user_id', user_id)
//     }
//   }
//
//   return NextResponse.json({ ok: true })
// }