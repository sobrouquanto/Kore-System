// src/app/api/webhook/route.ts
// Webhook do Stripe - ativa e cancela planos automaticamente
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature') || ''

  const secretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!secretKey || !webhookSecret) {
    return NextResponse.json({ error: 'Config error' }, { status: 500 })
  }

  let event: any
  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(secretKey)
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('Stripe webhook sig error:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const obj = event.data?.object

  // ✅ EVENTO PRINCIPAL: usuário acabou de pagar/iniciar trial no Stripe
  // Dispara imediatamente quando o checkout é concluído
  if (event.type === 'checkout.session.completed') {
    const customerId = obj?.customer
    const subscriptionId = obj?.subscription
    const userId = obj?.client_reference_id || obj?.metadata?.userId

    console.log('Checkout concluído:', { customerId, subscriptionId, userId })

    if (userId) {
      // Atualiza pelo userId (mais confiável — sempre temos o client_reference_id)
      await supabase.from('profiles').update({
        plano: 'completo',
        plano_ativo: true,
        plano_ativado_em: new Date().toISOString(),
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
      }).eq('id', userId)
    } else if (customerId) {
      // Fallback: atualiza pelo customer ID
      await supabase.from('profiles').update({
        plano: 'completo',
        plano_ativo: true,
        plano_ativado_em: new Date().toISOString(),
        stripe_subscription_id: subscriptionId,
      }).eq('stripe_customer_id', customerId)
    }

    console.log('Plano ativado via checkout:', customerId)
  }

  // Renovação de assinatura / reativação após trial
  if (event.type === 'invoice.payment_succeeded' || event.type === 'customer.subscription.updated') {
    const customerId = obj?.customer
    const status = obj?.status
    const subscriptionId = obj?.id || obj?.subscription

    if (status === 'active' || status === 'trialing') {
      await supabase.from('profiles').update({
        plano: 'completo',
        plano_ativo: true,
        plano_ativado_em: new Date().toISOString(),
        stripe_subscription_id: subscriptionId,
      }).eq('stripe_customer_id', customerId)
      console.log('Plano mantido ativo:', customerId)
    }
  }

  // Cancelamento ou falha de pagamento
  if (event.type === 'customer.subscription.deleted' || event.type === 'invoice.payment_failed') {
    const customerId = obj?.customer
    await supabase.from('profiles').update({
      plano: 'gratuito',
      plano_ativo: false,
    }).eq('stripe_customer_id', customerId)
    console.log('Plano cancelado:', customerId)
  }

  if (event.type === 'customer.subscription.trial_will_end') {
    // Aqui futuramente: enviar email de aviso (Resend)
    console.log('Trial acabando para:', obj?.customer)
  }

  return NextResponse.json({ received: true })
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ status: 'Kore System webhook ativo' })
}