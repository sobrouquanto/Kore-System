// GET /api/pluggy/sync-all
// Chamado pelo Vercel Cron a cada 6 horas (vercel.json).
// Sincroniza todos os usuários com bancos conectados.
// Protegido por CRON_SECRET.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { syncItem } from '../sync/_syncItem'

export const maxDuration = 300 // 5 min (Vercel Pro)

export async function GET(req: NextRequest) {
  // Valida CRON_SECRET
  const auth = req.headers.get('Authorization')
  const secret = process.env.CRON_SECRET
  if (secret && auth !== `Bearer ${secret}`) {
    console.warn('[sync-all] Acesso negado — secret inválido')
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const t0 = Date.now()
  console.log('[sync-all] Iniciando...')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Busca todas as integrações bancárias ativas (todos os usuários)
  const { data: integrations, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('provider', 'banco')
    .eq('status', 'connected')

  if (error) {
    console.error('[sync-all] Erro DB:', error)
    return NextResponse.json({ error: 'Erro DB' }, { status: 500 })
  }

  if (!integrations || integrations.length === 0) {
    return NextResponse.json({ success: true, processed: 0 })
  }

  // Filtra integrações não sincronizadas nas últimas 5h (evita overlap)
  const cutoff = new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  const toSync = integrations.filter((i: any) => {
    const ls = i.metadata?.last_sync
    return !ls || ls < cutoff
  })

  console.log(`[sync-all] ${integrations.length} total | ${toSync.length} elegíveis`)

  let totalImported = 0
  let totalErrors = 0
  const users = new Set<string>()

  for (const intg of toSync) {
    try {
      const r = await syncItem(supabase, intg.user_id, intg as any)
      totalImported += r.imported
      if (r.errors.length) totalErrors++
      users.add(intg.user_id)
    } catch (e: any) {
      console.error(`[sync-all] Erro em ${intg.user_id}/${intg.provider_name}:`, e.message)
      totalErrors++
    }
  }

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1)
  console.log(`[sync-all] Concluído em ${elapsed}s | imported=${totalImported} errors=${totalErrors} users=${users.size}`)

  return NextResponse.json({
    success: true,
    processed: toSync.length,
    usersUpdated: users.size,
    totalImported,
    totalErrors,
    elapsedSeconds: parseFloat(elapsed),
  })
}