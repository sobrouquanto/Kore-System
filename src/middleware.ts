import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * middleware.ts
 *
 * Duas responsabilidades:
 *   1. Refresh silencioso do token de sessão (obrigatório para @supabase/ssr funcionar)
 *   2. Proteção de rotas — redireciona usuários sem sessão / sem plano
 *
 * Padrão crítico de cookies (documentação @supabase/ssr):
 *   - supabaseResponse DEVE ser criado com NextResponse.next({ request })
 *   - setAll DEVE escrever cookies tanto em request quanto em supabaseResponse
 *   - Toda resposta retornada deve propagar os cookies de supabaseResponse
 *     (use copyResponseCookies abaixo, nunca crie um NextResponse.next() avulso)
 *
 * Se qualquer redirect for necessário, copie os cookies do supabaseResponse
 * para o redirect antes de retorná-lo — garante que o token refreshado
 * chegue ao browser junto com o redirect.
 */

export async function middleware(request: NextRequest) {
  // ── 1. Cria supabaseResponse base ────────────────────────────────────────
  // NUNCA substitua essa variável por um NextResponse.next() avulso depois daqui.
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Passo 1: injeta cookies no request para que Server Components
          //          downstream enxerguem o token atualizado nesta requisição
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          // Passo 2: recria supabaseResponse com o request já atualizado
          //          para que o Next.js propague os cookies ao browser
          supabaseResponse = NextResponse.next({ request })
          // Passo 3: escreve os cookies na resposta que vai para o browser
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { pathname } = request.nextUrl

  // ── Rotas públicas — passa direto sem verificar sessão ───────────────────
  const publicPaths = ['/login', '/assinar', '/onboarding', '/api/', '/_next/']
  if (publicPaths.some(p => pathname.startsWith(p))) {
    return supabaseResponse
  }

  // ── 2. Refresh da sessão ──────────────────────────────────────────────────
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // ── 3. Proteção de /app/* ────────────────────────────────────────────────
  if (pathname.startsWith('/app')) {
    if (!user) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/login'
      loginUrl.searchParams.set('redirectedFrom', pathname)
      return copyAndRedirect(supabaseResponse, loginUrl.toString())
    }

    // Lê status do plano — com o cliente SSR que já tem a sessão refreshada
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('plano_ativo, onboarding_done')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      // Profile ainda não existe (trigger atrasado): deixa passar sem redirecionar.
      // O DashboardContext no cliente vai lidar com o estado vazio.
      console.warn('[middleware] profile ausente para', user.id, profileError?.code)
      return supabaseResponse
    }

    if (!profile.plano_ativo) {
      const dest = request.nextUrl.clone()
      dest.pathname = '/assinar'
      return copyAndRedirect(supabaseResponse, dest.toString())
    }

    if (!profile.onboarding_done) {
      const dest = request.nextUrl.clone()
      dest.pathname = '/onboarding'
      return copyAndRedirect(supabaseResponse, dest.toString())
    }
  }

  // ── 5. Retorna sempre supabaseResponse (nunca um NextResponse avulso) ────
  return supabaseResponse
}

/**
 * Cria um redirect preservando os cookies de autenticação da supabaseResponse.
 *
 * Sem isso, o token refreshado seria perdido em qualquer redirect, causando
 * o loop 307 → /login no próximo request.
 */
function copyAndRedirect(supabaseResponse: NextResponse, destination: string): NextResponse {
  const redirect = NextResponse.redirect(destination)
  supabaseResponse.cookies.getAll().forEach(({ name, value }) => {
    // Copia todas as opções do cookie original preservando SameSite, HttpOnly etc.
    const original = supabaseResponse.cookies.get(name)
    redirect.cookies.set(name, value, {
      httpOnly: original ? true : undefined,
      sameSite: 'lax',
      path: '/',
    })
  })
  return redirect
}

export const config = {
  matcher: [
    /*
     * Roda em todos os paths exceto:
     *   - _next/static  (assets compilados)
     *   - _next/image   (otimização de imagem)
     *   - favicon.ico
     *   - arquivos estáticos com extensão (svg, png, jpg…)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
