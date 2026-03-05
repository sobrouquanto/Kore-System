import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    // 1. Verifica o usuário logado
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Usuário inválido' }, { status: 401 })
    }

    console.log('✅ Usuário autenticado:', user.id)
    console.log('🔑 Pluggy CLIENT_ID:', process.env.PLUGGY_CLIENT_ID?.slice(0, 8) + '...')

    // 2. Pede o apiKey temporário ao Pluggy
    const authResponse = await fetch('https://api.pluggy.ai/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: process.env.PLUGGY_CLIENT_ID,
        clientSecret: process.env.PLUGGY_CLIENT_SECRET,
      }),
    })

    const authText = await authResponse.text()
    console.log('📡 Pluggy auth status:', authResponse.status)
    console.log('📡 Pluggy auth body:', authText.slice(0, 200))

    if (!authResponse.ok) {
      return NextResponse.json({ error: 'Falha ao autenticar no Pluggy', detail: authText }, { status: 500 })
    }

    const { apiKey } = JSON.parse(authText)

    // 3. Cria o connectToken
    const connectResponse = await fetch('https://api.pluggy.ai/connect_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey,
      },
      body: JSON.stringify({
        clientUserId: user.id,
      }),
    })

    const connectText = await connectResponse.text()
    console.log('📡 Connect token status:', connectResponse.status)
    console.log('📡 Connect token body:', connectText.slice(0, 300))

    if (!connectResponse.ok) {
      return NextResponse.json({ error: 'Falha ao criar connect token', detail: connectText }, { status: 500 })
    }

    const connectData = JSON.parse(connectText)
    const accessToken = connectData.accessToken || connectData.connectToken

    if (!accessToken) {
      console.error('❌ Token não encontrado:', connectData)
      return NextResponse.json({ error: 'Token não encontrado', detail: connectData }, { status: 500 })
    }

    console.log('✅ Connect token gerado!')
    return NextResponse.json({ accessToken })

  } catch (error: any) {
    console.error('❌ Erro inesperado:', error)
    return NextResponse.json({ error: 'Erro interno: ' + error.message }, { status: 500 })
  }
}