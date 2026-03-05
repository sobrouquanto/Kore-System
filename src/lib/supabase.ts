/**
 * src/lib/supabase.ts
 *
 * IMPORTANTE: usa createBrowserClient de @supabase/ssr, NÃO createClient de @supabase/supabase-js.
 *
 * Por quê isso importa:
 *   - createClient       → persiste tokens em localStorage (invisível ao servidor)
 *   - createBrowserClient → persiste tokens em cookies HTTP (lidos pelo middleware e Server Components)
 *
 * Essa distinção é o que permite o middleware.ts ler a sessão após o login
 * e evitar o redirect 307 infinito para /login.
 */
import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)