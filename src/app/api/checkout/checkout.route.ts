// src/app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { email, userId } = await request.json()

    const secretKey = process.env.STRIPE_SECRET_KEY
    const priceId = process.env.STRIPE_PRICE_ID
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'

    const missing: string[] = []
    if (!secretKey) missing.push('STRIPE_SECRET_KEY')
    if (!priceId) missing.push('STRIPE_PRICE_ID')
    if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL')
    if (!serviceRoleKey) missing.push('SUPABASE_SERVICE_ROLE_KEY')
    if (!appUrl) missing.push('NEXT_PUBLIC_APP_URL ou NEXT_PUBLIC_URL')

    if (!email || !userId) {
      return NextResponse.json({ error: 'Payload inválido (email/userId).' }, { status: 400 })
    }

    if (missing.length) {
      return NextResponse.json(
        { error: `Configuração ausente no servidor: ${missing.join(', ')}` },
        { status: 500 }
      )
    }

    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(secretKey)

    // Cria ou busca customer no Stripe
    const existing = await stripe.customers.list({ email, limit: 1 })
    let customer = existing.data[0]
    if (!customer) {
      customer = await stripe.customers.create({ email, metadata: { userId } })
    }

    // Salva stripe_customer_id no Supabase
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      supabaseUrl!,
      serviceRoleKey!
    )
    const { error: supaErr } = await supabase.from('profiles').update({
      stripe_customer_id: customer.id
    }).eq('id', userId)
    if (supaErr) {
      console.error('Supabase profile update error:', supaErr)
      return NextResponse.json({ error: 'Erro ao atualizar perfil antes do checkout.' }, { status: 500 })
    }

    // Cria sessão com trial de 7 dias
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId!, quantity: 1 }],
      subscription_data: {
        trial_period_days: 7,
        metadata: { userId },
      },
      // Após pagamento vai para /onboarding
      success_url: `${appUrl}/onboarding?checkout=success`,
      cancel_url: `${appUrl}/assinar`,
      locale: 'pt-BR',
      client_reference_id: userId,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    const anyErr = err as any
    const msg =
      typeof anyErr?.message === 'string'
        ? anyErr.message
        : 'Erro ao criar checkout.'
    const code = typeof anyErr?.code === 'string' ? anyErr.code : undefined

    return NextResponse.json(
      { error: code ? `Stripe (${code}): ${msg}` : msg },
      { status: 500 }
    )
  }
}