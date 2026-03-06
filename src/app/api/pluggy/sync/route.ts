import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { syncItem } from './_syncItem'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: 'Usuário inválido' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const bankName: string | undefined = body.bankName

    let query = supabase
      .from('integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', 'banco')
      .eq('status', 'connected')

    if (bankName) query = query.eq('provider_name', bankName)

    const { data: integrations, error: dbErr } = await query
    if (dbErr) return NextResponse.json({ error: 'Erro DB' }, { status: 500 })

    if (!integrations || integrations.length === 0) {
      return NextResponse.json({ success: true, message: 'Nenhum banco conectado', results: [] })
    }

    const results = []
    for (const intg of integrations) {
      results.push(await syncItem(supabase, user.id, intg as any))
    }

    return NextResponse.json({
      success: true,
      totalImported: results.reduce((s, r) => s + r.imported, 0),
      totalSkipped: results.reduce((s, r) => s + r.skipped, 0),
      results,
    })

  } catch (err: any) {
    return NextResponse.json({ error: 'Erro interno: ' + err.message }, { status: 500 })
  }
}