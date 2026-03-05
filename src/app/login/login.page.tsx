'use client'
import { useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginForm() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [business, setBusiness] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  // Middleware grava "redirectedFrom"; suporte legado a "next" também
  const redirectedFrom = searchParams.get('redirectedFrom') || searchParams.get('next') || null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error

        // Busca perfil para saber para onde redirecionar
        const { data: profile } = await supabase
          .from('profiles')
          .select('plano_ativo, onboarding_done')
          .eq('id', data.user.id)
          .single()

        // router.refresh() primeiro: força o Next.js a revalidar os Server Components
        // com os cookies de sessão recém-gravados pelo createBrowserClient.
        // Se vier push() antes, o middleware ainda não vê os cookies e redireciona de volta.
        router.refresh()

        // Aguarda um tick para o refresh propagar antes de navegar
        await new Promise(r => setTimeout(r, 50))

        if (redirectedFrom && profile?.plano_ativo && profile?.onboarding_done) {
          router.push(redirectedFrom)
        } else if (profile?.plano_ativo && profile?.onboarding_done) {
          router.push('/app')
        } else if (!profile?.plano_ativo) {
          router.push('/assinar')
        } else {
          router.push('/onboarding')
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            // Passa business_name no metadata para o trigger handle_new_user capturar
            data: { full_name: name, name: name, business_name: business }
          }
        })
        if (error) throw error

        if (data.user) {
          // Upsert em vez de update: garante que o profile existe mesmo se o
          // trigger handle_new_user ainda não rodou (race condition no Supabase)
          await supabase
            .from('profiles')
            .upsert(
              { id: data.user.id, email: data.user.email, nome_empresa: business },
              { onConflict: 'id' }
            )

          // Confirmação de email DESATIVADA no Supabase → vai direto pro checkout
          router.push('/assinar')
          router.refresh()
        }
      }
    } catch (err: any) {
      if (err.message.includes('Invalid login')) setError('E-mail ou senha incorretos.')
      else if (err.message.includes('already registered')) setError('Este e-mail já possui cadastro.')
      else if (err.message.includes('Password')) setError('A senha precisa ter no mínimo 6 caracteres.')
      else setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{minHeight:'100vh',background:'#060a12',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Arial, sans-serif',padding:'20px'}}>
      <div style={{width:'100%',maxWidth:'420px'}}>
        <div style={{textAlign:'center',marginBottom:'32px'}}>
          <div style={{fontSize:'24px',fontWeight:800,color:'#f1f5f9',letterSpacing:'-0.5px'}}>
            MEI <span style={{color:'#10b981'}}>360</span> OS
          </div>
          <div style={{fontSize:'14px',color:'rgba(255,255,255,0.4)',marginTop:'6px'}}>
            O sistema operacional do seu negócio
          </div>
        </div>

        <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'20px',padding:'32px'}}>
          <div style={{display:'flex',gap:'4px',background:'rgba(255,255,255,0.05)',borderRadius:'10px',padding:'4px',marginBottom:'24px'}}>
            {(['login','signup'] as const).map(m=>(
              <button key={m} type="button" onClick={()=>{setMode(m);setError('');setSuccess('')}} style={{
                flex:1,padding:'8px',borderRadius:'8px',border:'none',cursor:'pointer',
                background:mode===m?'#10b981':'transparent',
                color:mode===m?'#fff':'rgba(255,255,255,0.5)',
                fontWeight:700,fontSize:'14px',transition:'all .2s',
              }}>
                {m==='login'?'Entrar':'Criar conta'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'14px'}}>
            {mode==='signup'&&(<>
              <div>
                <label style={labelStyle}>SEU NOME</label>
                <input value={name} onChange={e=>setName(e.target.value)} required placeholder="João Silva" style={inputStyle}/>
              </div>
              <div>
                <label style={labelStyle}>NOME DO NEGÓCIO</label>
                <input value={business} onChange={e=>setBusiness(e.target.value)} required placeholder="Silva Elétrica" style={inputStyle}/>
              </div>
            </>)}
            <div>
              <label style={labelStyle}>E-MAIL</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="seu@email.com" style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>SENHA</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="••••••••" minLength={6} style={inputStyle}/>
            </div>
            {error&&<div style={{background:'rgba(239,68,68,0.12)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:'10px',padding:'12px',fontSize:'13px',color:'#fca5a5'}}>❌ {error}</div>}
            {success&&<div style={{background:'rgba(16,185,129,0.12)',border:'1px solid rgba(16,185,129,0.3)',borderRadius:'10px',padding:'12px',fontSize:'13px',color:'#6ee7b7'}}>✅ {success}</div>}
            <button type="submit" disabled={loading} style={{
              background:'linear-gradient(135deg,#10b981,#059669)',color:'#fff',border:'none',
              padding:'14px',borderRadius:'12px',fontSize:'15px',fontWeight:800,
              cursor:loading?'not-allowed':'pointer',opacity:loading?0.7:1,
              marginTop:'4px',boxShadow:'0 4px 20px rgba(16,185,129,0.3)',
            }}>
              {loading?'Aguarde...':mode==='login'?'Entrar no sistema':'Criar conta grátis'}
            </button>
          </form>
        </div>
        {mode==='signup'&&(
          <p style={{textAlign:'center',fontSize:'12px',color:'rgba(255,255,255,0.3)',marginTop:'16px'}}>
            ✓ 7 dias grátis &nbsp;·&nbsp; ✓ Sem compromisso &nbsp;·&nbsp; ✓ Cancele quando quiser
          </p>
        )}
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{minHeight:'100vh',background:'#060a12'}}/>}>
      <LoginForm />
    </Suspense>
  )
}

const labelStyle: React.CSSProperties = {fontSize:'12px',color:'rgba(255,255,255,0.5)',fontWeight:600,letterSpacing:'0.5px',display:'block',marginBottom:'6px'}
const inputStyle: React.CSSProperties = {width:'100%',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',padding:'12px 14px',color:'#f1f5f9',fontSize:'14px',outline:'none',boxSizing:'border-box'}