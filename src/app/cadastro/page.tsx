// src/app/cadastro/page.tsx
// Redireciona /cadastro → /login?mode=signup
// Resolve o 404 quando usuário clica em "Começar grátis" na landing

import { redirect } from 'next/navigation'

export default function CadastroPage() {
  redirect('/login?mode=signup')
}
