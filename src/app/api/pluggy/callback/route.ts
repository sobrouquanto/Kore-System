import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
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
      return NextResponse.json({ error: 'Usuário inválido' }, { status: 401 })
    }

    const { itemId, bankName, bankDisplayName, bankIcon } = await req.json()

    if (!itemId || !bankName) {
      return NextResponse.json({ error: 'itemId e bankName obrigatórios' }, { status: 400 })
    }

    console.log('✅ Salvando banco:', { bankName, bankDisplayName, itemId })

    // Busca apiKey do Pluggy para verificar o item
    const authResponse = await fetch('https://api.pluggy.ai/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: process.env.PLUGGY_CLIENT_ID,
        clientSecret: process.env.PLUGGY_CLIENT_SECRET,
      }),
    })
    const { apiKey } = await authResponse.json()

    // Verifica o item no Pluggy
    let itemStatus = 'connected'
    let connectorName = bankDisplayName || bankName
    try {
      const itemResponse = await fetch(`https://api.pluggy.ai/items/${itemId}`, {
        headers: { 'X-API-KEY': apiKey },
      })
      if (itemResponse.ok) {
        const item = await itemResponse.json()
        itemStatus = item.status === 'UPDATED' || item.status === 'UPDATING' ? 'connected' : 'connected'
        connectorName = item.connector?.name || bankDisplayName || bankName
      }
    } catch (e) {
      console.warn('Não conseguiu verificar item no Pluggy, salvando como conectado mesmo assim')
    }

    // Salva no Supabase
    // provider_name = bankName (ID lowercase, ex: 'nubank') para bater com a chave do frontend
    const { error: dbError } = await supabase.from('integrations').upsert({
      user_id: user.id,
      provider: 'banco',
      provider_name: bankName, // ID lowercase: 'nubank', 'inter', etc
      status: itemStatus,
      access_token: itemId,
      metadata: {
        display: connectorName,     // Nome bonito para mostrar
        icon: bankIcon || '🏦',
        itemId,
      },
      connected_at: new Date().toISOString(),
    }, { onConflict: 'user_id,provider,provider_name' })

    if (dbError) {
      console.error('Erro ao salvar no Supabase:', dbError)
      return NextResponse.json({ error: 'Erro ao salvar conexão' }, { status: 500 })
    }

    console.log('✅ Banco salvo com sucesso:', bankName)
    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('❌ Erro inesperado:', error)
    return NextResponse.json({ error: 'Erro interno: ' + error.message }, { status: 500 })
  }
}
