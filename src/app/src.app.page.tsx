'use client'
import { useRouter } from 'next/navigation'

const CHECKOUT = '/login' // Redireciona para criar conta antes de assinar

export default function LandingPage() {
  const router = useRouter()

  const goCheckout = () => { router.push('/login?next=assinar') }

  return (
    <div style={{ background: '#060a12', color: '#f1f5f9', fontFamily: "'Sora', sans-serif", minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500;600&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        :root{
          --bg:#060a12;--bg2:#0d1220;
          --card:rgba(255,255,255,0.04);--card-border:rgba(255,255,255,0.07);
          --green:#10b981;--green2:#059669;
          --green-dim:rgba(16,185,129,0.15);--green-border:rgba(16,185,129,0.25);
          --amber:#f59e0b;
          --text2:rgba(255,255,255,0.55);--text3:rgba(255,255,255,0.3);
          --mono:'DM Mono',monospace;--sans:'Sora',sans-serif;
        }
        body{background:var(--bg);font-family:var(--sans);}
        button{font-family:var(--sans);cursor:pointer;}
        .btn-ghost{background:transparent;border:1px solid var(--card-border);color:var(--text2);padding:9px 20px;border-radius:10px;font-size:14px;font-weight:600;transition:all .2s;}
        .btn-ghost:hover{border-color:var(--green);color:var(--green);}
        .btn-primary{background:linear-gradient(135deg,var(--green),var(--green2));color:#fff;border:none;padding:10px 22px;border-radius:10px;font-size:14px;font-weight:700;transition:all .2s;box-shadow:0 4px 20px rgba(16,185,129,0.25);}
        .btn-primary:hover{transform:translateY(-1px);box-shadow:0 6px 28px rgba(16,185,129,0.35);}
        .btn-hero{padding:16px 36px!important;border-radius:14px!important;font-size:16px!important;font-weight:800!important;}
        .btn-hero-outline{background:transparent;border:1px solid var(--card-border);color:var(--text2);padding:16px 28px;border-radius:14px;font-size:15px;font-weight:600;transition:all .2s;cursor:pointer;}
        .btn-hero-outline:hover{border-color:rgba(255,255,255,0.2);color:#f1f5f9;}
        .step{background:var(--card);border:1px solid var(--card-border);border-radius:20px;padding:28px;position:relative;overflow:hidden;transition:transform .2s,border-color .2s;}
        .step:hover{transform:translateY(-4px);border-color:var(--green-border);}
        .step::before{content:attr(data-n);position:absolute;top:-10px;right:16px;font-size:80px;font-weight:900;color:rgba(255,255,255,0.03);font-family:var(--mono);line-height:1;}
        .feature{background:var(--card);border:1px solid var(--card-border);border-radius:20px;padding:28px;transition:all .2s;}
        .feature:hover{border-color:var(--green-border);background:rgba(16,185,129,0.04);}
        .testimonial{background:var(--card);border:1px solid var(--card-border);border-radius:18px;padding:24px;}
        .pricing-feat{display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:14px;}
        .pricing-feat::before{content:'✓';color:var(--green);font-weight:800;flex-shrink:0;margin-top:1px;}
        .hero-proof span::before{content:'✓';color:var(--green);font-weight:700;margin-right:6px;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
        @keyframes pulse-dot{0%,100%{opacity:1;}50%{opacity:0.4;}}
        .fu0{animation:fadeUp .6s ease both;}
        .fu1{animation:fadeUp .6s .1s ease both;}
        .fu2{animation:fadeUp .6s .2s ease both;}
        .fu3{animation:fadeUp .6s .3s ease both;}
        .fu4{animation:fadeUp .6s .4s ease both;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:99px;}
        @media(max-width:900px){
          .nav-links{display:none!important;}
          .hero-section{padding:80px 20px 60px!important;}
          .section{padding:60px 20px!important;}
          .steps-grid,.testimonials-grid{grid-template-columns:1fr!important;}
          .features-grid{grid-template-columns:1fr!important;}
          .feature-span{grid-column:span 1!important;grid-template-columns:1fr!important;}
          .pricing-wrap{padding:20px 20px 60px!important;}
          .footer{flex-direction:column!important;gap:12px!important;text-align:center!important;padding:30px 20px!important;}
          .hero-actions{flex-direction:column!important;align-items:center!important;}
          .preview-grid{grid-template-columns:1fr 1fr!important;}
        }
      `}</style>

      {/* AMBIENT */}
      <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:0,overflow:'hidden'}}>
        <div style={{position:'absolute',width:'800px',height:'800px',top:'-300px',left:'20%',background:'radial-gradient(circle,rgba(16,185,129,0.055) 0%,transparent 70%)',borderRadius:'50%'}}/>
        <div style={{position:'absolute',width:'600px',height:'600px',bottom:'-200px',right:'5%',background:'radial-gradient(circle,rgba(59,130,246,0.04) 0%,transparent 70%)',borderRadius:'50%'}}/>
        <div style={{position:'absolute',width:'400px',height:'400px',top:'40%',left:'-100px',background:'radial-gradient(circle,rgba(139,92,246,0.03) 0%,transparent 70%)',borderRadius:'50%'}}/>
      </div>

      {/* NAV */}
      <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 60px',position:'sticky',top:0,zIndex:100,background:'rgba(6,10,18,0.85)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
        <div style={{fontSize:'18px',fontWeight:800,letterSpacing:'-0.5px'}}>MEI <span style={{color:'#10b981'}}>360</span> OS</div>
        <div className="nav-links" style={{display:'flex',gap:'32px'}}>
          {[['#como-funciona','Como funciona'],['#funcionalidades','Funcionalidades'],['#preco','Preço']].map(([h,l])=>(
            <a key={h} href={h} style={{color:'rgba(255,255,255,0.55)',textDecoration:'none',fontSize:'14px',fontWeight:500,transition:'color .2s'}}
              onMouseEnter={e=>(e.target as any).style.color='#f1f5f9'}
              onMouseLeave={e=>(e.target as any).style.color='rgba(255,255,255,0.55)'}>{l}</a>
          ))}
        </div>
        <div style={{display:'flex',gap:'12px',alignItems:'center'}}>
          <button className="btn-ghost" onClick={()=>router.push('/login')}>Entrar</button>
          <button className="btn-primary" onClick={goCheckout}>Assinar R$29/mês →</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero-section" style={{padding:'120px 60px 80px',textAlign:'center',maxWidth:'860px',margin:'0 auto',position:'relative',zIndex:1}}>
        <div className="fu0" style={{display:'inline-flex',alignItems:'center',gap:'8px',background:'var(--green-dim)',border:'1px solid var(--green-border)',color:'#10b981',padding:'6px 16px',borderRadius:'99px',fontSize:'12px',fontWeight:700,letterSpacing:'1px',textTransform:'uppercase',marginBottom:'28px'}}>
          <span style={{width:'6px',height:'6px',borderRadius:'50%',background:'#10b981',animation:'pulse-dot 2s infinite',display:'inline-block'}}/>
          🚀 Novo · IA financeira para MEI
        </div>
        <h1 className="fu1" style={{fontSize:'clamp(40px,6vw,72px)',fontWeight:900,lineHeight:1.08,letterSpacing:'-2px',marginBottom:'24px'}}>
          O <em style={{fontStyle:'normal',color:'#10b981'}}>sistema operacional</em><br/>inteligente do seu negócio
        </h1>
        <p className="fu2" style={{fontSize:'18px',color:'rgba(255,255,255,0.55)',lineHeight:1.7,maxWidth:'560px',margin:'0 auto 40px'}}>
          Você foca em trabalhar. O MEI 360 OS cuida do resto — finanças, cobranças, impostos e IA que fala a língua do empreendedor brasileiro.
        </p>
        <div className="fu3 hero-actions" style={{display:'flex',gap:'14px',justifyContent:'center',flexWrap:'wrap'}}>
          <button className="btn-primary btn-hero" onClick={goCheckout}>Assinar por R$29/mês →</button>
          <button className="btn-hero-outline" onClick={()=>router.push('/login')}>Ver o app →</button>
        </div>
        <div className="fu4" style={{display:'flex',alignItems:'center',gap:'20px',justifyContent:'center',marginTop:'32px',fontSize:'13px',color:'rgba(255,255,255,0.3)',flexWrap:'wrap'}}>
          <span className="hero-proof">Sem fidelidade</span>
          <span className="hero-proof">Cancele quando quiser</span>
          <span className="hero-proof">Suporte em português</span>
        </div>
      </section>

      {/* APP PREVIEW */}
      <div style={{maxWidth:'1000px',margin:'0 auto 100px',padding:'0 40px',position:'relative',zIndex:1}}>
        <div style={{background:'#0d1220',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'20px',overflow:'hidden',boxShadow:'0 40px 100px rgba(0,0,0,0.6),0 0 0 1px rgba(16,185,129,0.08),inset 0 1px 0 rgba(255,255,255,0.05)'}}>
          <div style={{background:'rgba(255,255,255,0.03)',padding:'12px 20px',borderBottom:'1px solid rgba(255,255,255,0.07)',display:'flex',alignItems:'center',gap:'10px'}}>
            <div style={{display:'flex',gap:'6px'}}>
              {['#ef4444','#f59e0b','#22c55e'].map(c=><div key={c} style={{width:'10px',height:'10px',borderRadius:'50%',background:c}}/>)}
            </div>
            <div style={{flex:1,textAlign:'center',background:'rgba(255,255,255,0.05)',borderRadius:'6px',padding:'4px 16px',fontSize:'12px',color:'rgba(255,255,255,0.3)',fontFamily:'DM Mono,monospace'}}>mei360os.vercel.app</div>
          </div>
          <div className="preview-grid" style={{padding:'24px',display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'14px'}}>
            <div style={{background:'var(--green-dim)',border:'1px solid var(--green-border)',borderRadius:'12px',padding:'16px'}}>
              <div style={{fontSize:'10px',color:'rgba(255,255,255,0.3)',letterSpacing:'1px',textTransform:'uppercase',marginBottom:'8px'}}>Saldo Hoje</div>
              <div style={{fontSize:'20px',fontWeight:800,fontFamily:'DM Mono,monospace',color:'#10b981'}}>R$4.820</div>
              <div style={{fontSize:'11px',color:'rgba(255,255,255,0.3)',marginTop:'4px'}}>↑ R$380 entrou hoje</div>
            </div>
            <div style={{background:'var(--card)',border:'1px solid var(--card-border)',borderRadius:'12px',padding:'16px'}}>
              <div style={{fontSize:'10px',color:'rgba(255,255,255,0.3)',letterSpacing:'1px',textTransform:'uppercase',marginBottom:'8px'}}>Lucro do Mês</div>
              <div style={{fontSize:'20px',fontWeight:800,fontFamily:'DM Mono,monospace',color:'#6ee7b7'}}>R$6.160</div>
              <div style={{fontSize:'11px',color:'rgba(255,255,255,0.3)',marginTop:'4px'}}>66% de margem 🎯</div>
            </div>
            <div style={{background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.2)',borderRadius:'12px',padding:'16px'}}>
              <div style={{fontSize:'10px',color:'rgba(255,255,255,0.3)',letterSpacing:'1px',textTransform:'uppercase',marginBottom:'8px'}}>Limite MEI</div>
              <div style={{fontSize:'20px',fontWeight:800,fontFamily:'DM Mono,monospace',color:'#f59e0b'}}>58%</div>
              <div style={{fontSize:'11px',color:'rgba(255,255,255,0.3)',marginTop:'4px'}}>R$47.200 / R$81.000</div>
            </div>
            <div style={{background:'var(--card)',border:'1px solid var(--card-border)',borderRadius:'12px',padding:'16px',gridColumn:'span 2'}}>
              <div style={{fontSize:'11px',color:'rgba(255,255,255,0.35)',letterSpacing:'1px',textTransform:'uppercase',marginBottom:'8px'}}>Receita × Despesas (6 meses)</div>
              <div style={{display:'flex',alignItems:'flex-end',gap:'5px',height:'60px',overflow:'hidden'}}>
                {[{r:45,e:28},{r:62,e:35},{r:55,e:30},{r:78,e:42},{r:70,e:38},{r:90,e:45}].map((d,i)=>(
                  <div key={i} style={{flex:1,display:'flex',gap:'3px',alignItems:'flex-end',height:'60px'}}>
                    <div style={{flex:1,borderRadius:'3px 3px 0 0',background:i===5?'linear-gradient(180deg,#6ee7b7,#10b981)':'rgba(255,255,255,0.12)',height:`${(d.r/90)*58}px`}}/>
                    <div style={{flex:1,borderRadius:'3px 3px 0 0',background:i===5?'rgba(239,68,68,0.6)':'rgba(239,68,68,0.25)',height:`${(d.e/90)*58}px`}}/>
                  </div>
                ))}
              </div>
            </div>
            <div style={{background:'linear-gradient(135deg,rgba(59,130,246,0.12),rgba(16,185,129,0.08))',border:'1px solid rgba(59,130,246,0.2)',borderRadius:'12px',padding:'16px'}}>
              <div style={{fontSize:'11px',color:'rgba(255,255,255,0.35)',letterSpacing:'1px',marginBottom:'10px'}}>🤖 IA ASSISTENTE</div>
              <div style={{fontSize:'12px',color:'rgba(255,255,255,0.7)',lineHeight:1.6,background:'rgba(255,255,255,0.05)',borderRadius:'8px',padding:'10px'}}>
                "Você pode retirar <strong style={{color:'#10b981'}}>R$4.300</strong> este mês sem comprometer o negócio." 💚
              </div>
              <div style={{fontSize:'11px',color:'rgba(255,255,255,0.35)',marginTop:'8px'}}>Perguntado: "Quanto posso retirar?"</div>
            </div>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section id="como-funciona" className="section" style={{padding:'80px 60px',maxWidth:'1100px',margin:'0 auto',position:'relative',zIndex:1}}>
        <div style={{fontSize:'11px',color:'#10b981',fontWeight:700,letterSpacing:'3px',textTransform:'uppercase',textAlign:'center',marginBottom:'14px'}}>Como funciona</div>
        <h2 style={{fontSize:'clamp(28px,4vw,44px)',fontWeight:800,letterSpacing:'-1px',textAlign:'center',marginBottom:'16px',lineHeight:1.15}}>Em 30 segundos você sabe<br/>como está seu negócio</h2>
        <p style={{fontSize:'16px',color:'rgba(255,255,255,0.55)',textAlign:'center',maxWidth:'520px',margin:'0 auto 60px'}}>Sem planilha, sem contador, sem complicação. Simples como deve ser.</p>
        <div className="steps-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'24px'}}>
          {[
            {n:'01',icon:'🔗',title:'Conecte suas ferramentas',text:'Mercado Pago, banco, WhatsApp, iFood. Tudo que você já usa entra automático — zero digitação manual.'},
            {n:'02',icon:'⚡',title:'A IA organiza tudo',text:'Cada venda, gasto e cobrança é categorizado e lançado automaticamente. O sistema pensa enquanto você trabalha.'},
            {n:'03',icon:'📊',title:'Decida com dados reais',text:'Veja lucro real, alerta do DAS, quando bate o limite e quanto pode retirar. Tudo em linguagem humana.'},
          ].map(s=>(
            <div key={s.n} className="step" data-n={s.n}>
              <div style={{fontSize:'32px',marginBottom:'16px'}}>{s.icon}</div>
              <div style={{fontSize:'16px',fontWeight:700,marginBottom:'8px'}}>{s.title}</div>
              <div style={{fontSize:'14px',color:'rgba(255,255,255,0.55)',lineHeight:1.6}}>{s.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="funcionalidades" className="section" style={{padding:'80px 60px',maxWidth:'1100px',margin:'0 auto',position:'relative',zIndex:1}}>
        <div style={{fontSize:'11px',color:'#10b981',fontWeight:700,letterSpacing:'3px',textTransform:'uppercase',textAlign:'center',marginBottom:'14px'}}>Funcionalidades</div>
        <h2 style={{fontSize:'clamp(28px,4vw,44px)',fontWeight:800,letterSpacing:'-1px',textAlign:'center',marginBottom:'16px',lineHeight:1.15}}>Tudo que um MEI precisa.<br/>Nada que não precisa.</h2>
        <p style={{fontSize:'16px',color:'rgba(255,255,255,0.55)',textAlign:'center',maxWidth:'520px',margin:'0 auto 60px'}}>Construído pensando no dia a dia de quem trabalha de verdade.</p>
        <div className="features-grid" style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'20px'}}>
          <div className="feature feature-span" style={{gridColumn:'span 2',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'28px',alignItems:'center'}}>
            <div>
              <div style={{display:'inline-block',background:'var(--green-dim)',color:'#10b981',border:'1px solid var(--green-border)',padding:'3px 10px',borderRadius:'99px',fontSize:'11px',fontWeight:700,marginBottom:'10px',letterSpacing:'.5px'}}>⭐ DESTAQUE</div>
              <div style={{fontSize:'28px',marginBottom:'12px'}}>🤖</div>
              <div style={{fontSize:'18px',fontWeight:700,marginBottom:'8px'}}>IA que fala brasileiro</div>
              <div style={{fontSize:'14px',color:'rgba(255,255,255,0.55)',lineHeight:1.65}}>Converse com a IA como se fosse um contador amigo. "Recebi R$800 do João" → lançado. "Quanto gastei este mês?" → resposta na hora. Sem jargão técnico, sem complicação.</div>
            </div>
            <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'14px',padding:'20px'}}>
              <div style={{fontSize:'11px',color:'rgba(255,255,255,0.3)',marginBottom:'12px',letterSpacing:'1px'}}>CONVERSA REAL COM A IA</div>
              <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                <div style={{background:'rgba(255,255,255,0.06)',padding:'10px 12px',borderRadius:'4px 12px 12px 12px',fontSize:'13px',maxWidth:'85%'}}>Quando vou bater o limite do MEI? 📊</div>
                <div style={{background:'linear-gradient(135deg,rgba(16,185,129,0.2),rgba(16,185,129,0.08))',border:'1px solid rgba(16,185,129,0.2)',padding:'10px 12px',borderRadius:'12px 12px 12px 4px',fontSize:'13px',lineHeight:1.5,color:'rgba(255,255,255,0.85)'}}>
                  No ritmo atual, você bate o limite em <strong style={{color:'#10b981'}}>~3 meses</strong>. Recomendo pesquisar migração para ME. Quer que eu simule? 🎯
                </div>
              </div>
            </div>
          </div>
          {[
            {icon:'🖥️',title:'Cockpit Diário',text:'Abra o app e em 30 segundos veja saldo, o que receber hoje, o que pagar e as 3 tarefas mais importantes geradas pela IA.'},
            {icon:'💰',title:'Financeiro Inteligente',text:'Fluxo de caixa automático, separação de lucro/custos/impostos e relatório mensal em linguagem simples. Sem planilha.'},
            {icon:'⚠️',title:'Alerta do DAS + Limite',text:'Nunca mais leve multa por esquecer o DAS. E saiba com antecedência quando vai bater o limite anual de faturamento do MEI.'},
            {icon:'🔗',title:'Hub de Integrações',text:'Mercado Pago, Pix, Nubank, Inter, WhatsApp Business, iFood, Shopee. Tudo que você já usa entra automático.'},
            {icon:'📈',title:'Inteligência de Negócio',text:'Simulador de preço, projeção de crescimento, análise de sazonalidade e ranking de clientes. Decida com dados, não no feeling.'},
          ].map(f=>(
            <div key={f.title} className="feature">
              <div style={{fontSize:'28px',marginBottom:'12px'}}>{f.icon}</div>
              <div style={{fontSize:'18px',fontWeight:700,marginBottom:'8px'}}>{f.title}</div>
              <div style={{fontSize:'14px',color:'rgba(255,255,255,0.55)',lineHeight:1.65}}>{f.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="preco" style={{padding:'80px 60px 20px',maxWidth:'1100px',margin:'0 auto',position:'relative',zIndex:1}}>
        <div style={{fontSize:'11px',color:'#10b981',fontWeight:700,letterSpacing:'3px',textTransform:'uppercase',textAlign:'center',marginBottom:'14px'}}>Preço</div>
        <h2 style={{fontSize:'clamp(28px,4vw,44px)',fontWeight:800,letterSpacing:'-1px',textAlign:'center',marginBottom:'16px',lineHeight:1.15}}>Um plano. Tudo incluído.<br/>Sem surpresa.</h2>
        <p style={{fontSize:'16px',color:'rgba(255,255,255,0.55)',textAlign:'center',maxWidth:'520px',margin:'0 auto'}}>Pelo preço de um café por semana, seu negócio nunca mais fica no escuro.</p>
      </section>
      <div className="pricing-wrap" style={{display:'flex',justifyContent:'center',padding:'40px 60px 80px',position:'relative',zIndex:1}}>
        <div style={{background:'linear-gradient(135deg,rgba(16,185,129,0.12),rgba(16,185,129,0.04))',border:'1px solid rgba(16,185,129,0.25)',borderRadius:'28px',padding:'48px 56px',maxWidth:'520px',width:'100%',textAlign:'center',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:0,left:0,right:0,height:'2px',background:'linear-gradient(90deg,transparent,#10b981,transparent)'}}/>
          <div style={{display:'inline-block',background:'#10b981',color:'#fff',padding:'5px 16px',borderRadius:'99px',fontSize:'11px',fontWeight:800,letterSpacing:'1px',textTransform:'uppercase',marginBottom:'24px'}}>✦ PLANO ÚNICO</div>
          <div style={{fontSize:'14px',color:'rgba(255,255,255,0.55)',fontWeight:600,letterSpacing:'2px',textTransform:'uppercase',marginBottom:'12px'}}>MEI 360 OS Completo</div>
          <div style={{fontSize:'64px',fontWeight:900,fontFamily:'DM Mono,monospace',lineHeight:1,color:'#10b981'}}>
            <sup style={{fontSize:'24px',verticalAlign:'top',marginTop:'12px',color:'rgba(255,255,255,0.55)',fontFamily:'Sora,sans-serif'}}>R$</sup>
            29
            <sub style={{fontSize:'16px',color:'rgba(255,255,255,0.55)',fontFamily:'Sora,sans-serif'}}>/mês</sub>
          </div>
          <div style={{fontSize:'13px',color:'rgba(255,255,255,0.3)',margin:'8px 0 28px'}}>Cancele quando quiser — sem burocracia</div>
          <div style={{textAlign:'left',marginBottom:'32px'}}>
            {[
              'Cockpit Diário com briefing da IA',
              'Financeiro automático + fluxo de caixa',
              'IA Assistente Gemini em linguagem natural',
              'Contas a receber + Orçamentos profissionais',
              'Alerta DAS + Limite MEI',
              'Histórico de DAS + Relatório DASN-SIMEI',
              'Hub de Integrações (MP, bancos, iFood...)',
              'Emissão de Nota Fiscal integrada',
              'Simulador de precificação e pró-labore',
              'Projeção de crescimento e limite',
              'Suporte em português 7 dias/semana',
            ].map(f=>(
              <div key={f} className="pricing-feat">{f}</div>
            ))}
          </div>
          <button
            style={{width:'100%',padding:'16px',borderRadius:'14px',fontSize:'16px',fontWeight:800,background:'linear-gradient(135deg,#10b981,#059669)',color:'#fff',border:'none',cursor:'pointer',boxShadow:'0 8px 32px rgba(16,185,129,0.3)',transition:'all .2s'}}
            onMouseEnter={e=>{(e.target as any).style.transform='translateY(-2px)';(e.target as any).style.boxShadow='0 12px 40px rgba(16,185,129,0.4)'}}
            onMouseLeave={e=>{(e.target as any).style.transform='';(e.target as any).style.boxShadow='0 8px 32px rgba(16,185,129,0.3)'}}
            onClick={goCheckout}
          >
            Assinar por R$29/mês →
          </button>
          <p style={{fontSize:'12px',color:'rgba(255,255,255,0.3)',marginTop:'12px'}}>Cancele quando quiser. Sem burocracia.</p>
        </div>
      </div>

      {/* TESTIMONIALS */}
      <section style={{padding:'0 60px 80px',maxWidth:'1100px',margin:'0 auto',position:'relative',zIndex:1}}>
        <div style={{fontSize:'11px',color:'#10b981',fontWeight:700,letterSpacing:'3px',textTransform:'uppercase',textAlign:'center',marginBottom:'14px'}}>Depoimentos</div>
        <h2 style={{fontSize:'clamp(28px,4vw,44px)',fontWeight:800,letterSpacing:'-1px',textAlign:'center',marginBottom:'48px',lineHeight:1.15}}>Quem já usa, não volta<br/>para a planilha</h2>
        <div className="testimonials-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'20px'}}>
          {[
            {text:'"Em 2 semanas já descobri que tava cobrando barato. A IA calculou minha margem real e sugeri aumentar 20%. Fechei o mês com R$1.400 a mais."',name:'Roberto Oliveira',role:'Eletricista MEI · SP',initials:'RO',grad:'linear-gradient(135deg,#10b981,#3b82f6)'},
            {text:'"Nunca soube se tava tendo lucro de verdade. Agora sei quanto posso retirar todo mês sem prejudicar o negócio. Isso não tem preço."',name:'Maria Costa',role:'Confeiteira MEI · MG',initials:'MC',grad:'linear-gradient(135deg,#8b5cf6,#ec4899)'},
            {text:'"O alerta do DAS me salvou de 3 multas só no primeiro mês. O sistema me avisa, já com o link pra pagar. Simples assim."',name:'João Santos',role:'Diarista MEI · RJ',initials:'JS',grad:'linear-gradient(135deg,#f59e0b,#ef4444)'},
          ].map(t=>(
            <div key={t.name} className="testimonial">
              <div style={{color:'#f59e0b',fontSize:'14px',marginBottom:'12px'}}>★★★★★</div>
              <div style={{fontSize:'14px',color:'rgba(255,255,255,0.55)',lineHeight:1.65,marginBottom:'16px'}}>{t.text}</div>
              <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                <div style={{width:'36px',height:'36px',borderRadius:'50%',background:t.grad,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',fontWeight:800,flexShrink:0}}>{t.initials}</div>
                <div><div style={{fontSize:'13px',fontWeight:700}}>{t.name}</div><div style={{fontSize:'11px',color:'rgba(255,255,255,0.3)'}}>{t.role}</div></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{padding:'0 60px 100px',maxWidth:'1100px',margin:'0 auto',textAlign:'center',position:'relative',zIndex:1}}>
        <h2 style={{fontSize:'clamp(32px,5vw,56px)',fontWeight:900,letterSpacing:'-1.5px',lineHeight:1.1,marginBottom:'16px'}}>Seu negócio merece<br/>um sistema inteligente</h2>
        <p style={{fontSize:'16px',color:'rgba(255,255,255,0.55)',maxWidth:'520px',margin:'0 auto 36px'}}>Apenas R$29/mês. Cancele quando quiser.</p>
        <button className="btn-primary btn-hero" onClick={goCheckout}>Assinar agora — R$29/mês →</button>
        <div style={{display:'flex',alignItems:'center',gap:'20px',justifyContent:'center',marginTop:'20px',fontSize:'13px',color:'rgba(255,255,255,0.3)',flexWrap:'wrap'}}>
          <span className="hero-proof">R$29/mês</span>
          <span className="hero-proof">Cancele quando quiser</span>
          <span className="hero-proof">Suporte em português</span>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer" style={{borderTop:'1px solid rgba(255,255,255,0.07)',padding:'40px 60px',display:'flex',justifyContent:'space-between',alignItems:'center',position:'relative',zIndex:1}}>
        <div style={{fontSize:'16px',fontWeight:800}}>MEI <span style={{color:'#10b981'}}>360</span> OS</div>
        <div style={{fontSize:'13px',color:'rgba(255,255,255,0.3)'}}>© 2026 MEI 360 OS. Todos os direitos reservados.</div>
        <div style={{fontSize:'13px',color:'rgba(255,255,255,0.3)'}}>Feito 🇧🇷 para o MEI brasileiro</div>
      </footer>
    </div>
  )
}
