'use client'

import Link from 'next/link'

// ─── K logo inline ────────────────────────────────────────────
function KLogo({ size = 28 }: { size?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <path d="M8 5 L8 27"   stroke="#3B82F6" strokeWidth="3.5" strokeLinecap="round"/>
        <path d="M8 16 L24 5"  stroke="#3B82F6" strokeWidth="3.5" strokeLinecap="round"/>
        <path d="M8 16 L24 27" stroke="#3B82F6" strokeWidth="3.5" strokeLinecap="round"/>
      </svg>
      <span style={{
        fontFamily: "'IBM Plex Sans', sans-serif",
        fontWeight: 800,
        fontSize: size * 0.65,
        letterSpacing: '-0.03em',
        color: '#fff',
      }}>
        Kore<span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 400, fontSize: size * 0.38, letterSpacing: '0.12em', textTransform: 'uppercase', marginLeft: 6 }}>System</span>
      </span>
    </div>
  )
}

// ─── Dashboard Preview — mock visual do produto ───────────────
function DashboardPreview() {
  const bars = [42, 68, 55, 80, 63, 90, 74]
  const months = ['Ago', 'Set', 'Out', 'Nov', 'Dez', 'Jan', 'Fev']

  return (
    <div style={{
      background: '#0d1117',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 16,
      overflow: 'hidden',
      fontFamily: "'IBM Plex Mono', monospace",
    }}>
      {/* Topbar do mock */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.02)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <KLogo size={20} />
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3B82F6', boxShadow: '0 0 8px #3B82F6' }} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>Silva Elétrica</span>
        </div>
      </div>

      <div style={{ display: 'flex', height: 360 }}>
        {/* Sidebar mock */}
        <div style={{
          width: 52, flexShrink: 0,
          borderRight: '1px solid rgba(255,255,255,0.05)',
          padding: '16px 0',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
        }}>
          {['⚡','📊','📝','👥','🤖','📈'].map((icon, i) => (
            <div key={i} style={{
              width: 32, height: 32, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: i === 0 ? 'rgba(59,130,246,0.15)' : 'transparent',
              fontSize: 14,
              border: i === 0 ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
            }}>
              {icon}
            </div>
          ))}
        </div>

        {/* Conteúdo principal */}
        <div style={{ flex: 1, padding: '18px 20px', overflow: 'hidden' }}>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
            {[
              { label: 'RECEITA / MÊS', value: 'R$ 8.240', color: '#fff', sub: '+12% vs anterior' },
              { label: 'LUCRO LÍQUIDO', value: 'R$ 3.100', color: '#34d399', sub: 'margem 37,6%' },
              { label: 'HEALTH SCORE', value: '84 / 100', color: '#3B82F6', sub: '↑ Estável' },
            ].map(({ label, value, color, sub }) => (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 10, padding: '12px 14px',
              }}>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '1.5px', fontWeight: 700, marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color, letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* Gráfico de barras */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: 10, padding: '14px 16px', marginBottom: 14,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', fontWeight: 700 }}>FATURAMENTO — 7 MESES</span>
              <span style={{ fontSize: 10, color: '#3B82F6', fontWeight: 700 }}>+31% YoY</span>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 70 }}>
              {bars.map((h, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: '100%', height: h * 0.7,
                    background: i === 6
                      ? 'linear-gradient(180deg,#3B82F6,#1d4ed8)'
                      : 'rgba(59,130,246,0.25)',
                    borderRadius: '3px 3px 0 0',
                    border: i === 6 ? '1px solid rgba(59,130,246,0.5)' : 'none',
                  }} />
                  <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>{months[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Transações recentes */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: 10, padding: '12px 16px',
          }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', fontWeight: 700, marginBottom: 10 }}>ÚLTIMAS TRANSAÇÕES</div>
            {[
              { desc: 'Serviço residencial — Rua das Flores', val: '+R$ 480', color: '#34d399', date: 'hoje' },
              { desc: 'Material elétrico — Casa do Parafuso', val: '-R$ 212', color: '#f87171', date: 'ontem' },
              { desc: 'Manutenção industrial — Fábrica ABC', val: '+R$ 1.200', color: '#34d399', date: '03/02' },
            ].map(({ desc, val, color, date }) => (
              <div key={desc} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '7px 0',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}>
                <div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', fontFamily: "'IBM Plex Sans', sans-serif" }}>{desc}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{date}</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────
export default function LandingPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html { scroll-behavior: smooth; }

        body {
          font-family: 'IBM Plex Sans', sans-serif;
          background: #0B0B0F;
          color: #f1f5f9;
          overflow-x: hidden;
        }

        .kore-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: #3B82F6;
          color: #fff;
          padding: 13px 28px;
          border-radius: 10px;
          font-size: 15px; font-weight: 700;
          text-decoration: none;
          border: none; cursor: pointer;
          transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
          font-family: inherit;
          box-shadow: 0 0 0 rgba(59,130,246,0);
        }
        .kore-btn-primary:hover {
          background: #2563eb;
          box-shadow: 0 8px 32px rgba(59,130,246,0.35);
          transform: translateY(-1px);
        }

        .kore-btn-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          background: transparent;
          color: rgba(255,255,255,0.6);
          padding: 13px 28px;
          border-radius: 10px;
          font-size: 15px; font-weight: 600;
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.12);
          cursor: pointer;
          transition: all 0.15s;
          font-family: inherit;
        }
        .kore-btn-ghost:hover {
          border-color: rgba(255,255,255,0.25);
          color: #fff;
          background: rgba(255,255,255,0.04);
        }

        .nav-link {
          color: rgba(255,255,255,0.5);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: color 0.15s;
        }
        .nav-link:hover { color: #fff; }

        .feature-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 24px;
          transition: border-color 0.2s, background 0.2s;
        }
        .feature-card:hover {
          border-color: rgba(59,130,246,0.3);
          background: rgba(59,130,246,0.04);
        }

        .stat-item {
          text-align: center;
          padding: 24px;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        .preview-float {
          animation: float 6s ease-in-out infinite;
        }

        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .features-grid { grid-template-columns: 1fr 1fr !important; }
          .nav-links { display: none !important; }
          .hero-actions { flex-direction: column; align-items: flex-start !important; }
        }

        @media (max-width: 480px) {
          .features-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ background: '#0B0B0F', minHeight: '100vh' }}>

        {/* ── Orbs de fundo ── */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', width: 900, height: 900,
            top: -400, left: '30%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 60%)',
            borderRadius: '50%',
          }} />
          <div style={{
            position: 'absolute', width: 600, height: 600,
            bottom: -200, right: '5%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 60%)',
            borderRadius: '50%',
          }} />
          {/* Grid pattern */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }} />
        </div>

        {/* ── NAV ── */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 40px', height: 64,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(11,11,15,0.88)',
          backdropFilter: 'blur(16px)',
        }}>
          <KLogo size={26} />

          <div className="nav-links" style={{ display: 'flex', gap: 32 }}>
            <a href="#funcionalidades" className="nav-link">Funcionalidades</a>
            <a href="#precos" className="nav-link">Preços</a>
            <a href="#como-funciona" className="nav-link">Como funciona</a>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Link href="/login" className="kore-btn-ghost" style={{ padding: '8px 18px', fontSize: 14 }}>
              Entrar
            </Link>
            <Link href="/login?mode=signup" className="kore-btn-primary" style={{ padding: '8px 18px', fontSize: 14 }}>
              Começar grátis
            </Link>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section style={{
          position: 'relative', zIndex: 1,
          maxWidth: 1200, margin: '0 auto',
          padding: '80px 40px 60px',
        }}>
          <div className="hero-grid" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 64,
            alignItems: 'center',
          }}>
            {/* Texto */}
            <div>
              {/* Pill */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(59,130,246,0.08)',
                border: '1px solid rgba(59,130,246,0.2)',
                borderRadius: 99, padding: '5px 14px',
                marginBottom: 28,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3B82F6', animation: 'float 2s ease-in-out infinite' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#93c5fd', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'IBM Plex Mono', monospace" }}>
                  Gestão financeira para MEI
                </span>
              </div>

              <h1 style={{
                fontSize: 'clamp(2.2rem, 4vw, 3.4rem)',
                fontWeight: 800,
                letterSpacing: '-0.04em',
                lineHeight: 1.06,
                marginBottom: 24,
                color: '#fff',
              }}>
                O núcleo financeiro<br />
                <span style={{
                  color: 'transparent',
                  backgroundImage: 'linear-gradient(135deg, #60a5fa, #3B82F6)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                }}>do seu negócio.</span>
              </h1>

              <p style={{
                fontSize: 17,
                color: 'rgba(255,255,255,0.52)',
                lineHeight: 1.7,
                marginBottom: 36,
                maxWidth: 460,
              }}>
                Sistema completo de gestão para MEI. Controle de caixa, IA financeira,
                alertas de DAS e relatórios — tudo integrado, tudo automático.
              </p>

              <div className="hero-actions" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <Link href="/login?mode=signup" className="kore-btn-primary" style={{ fontSize: 16, padding: '14px 32px' }}>
                  Começar gratuitamente →
                </Link>
                <a href="#como-funciona" className="kore-btn-ghost" style={{ fontSize: 16, padding: '14px 24px' }}>
                  Ver demo
                </a>
              </div>

              <div style={{ marginTop: 20, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {['14 dias grátis', 'Sem cartão de crédito', 'Cancele quando quiser'].map(t => (
                  <span key={t} style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ color: '#3B82F6', fontWeight: 700 }}>✓</span> {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="preview-float" style={{ position: 'relative' }}>
              {/* Glow atrás */}
              <div style={{
                position: 'absolute', inset: -40,
                background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.15) 0%, transparent 70%)',
                borderRadius: '50%',
                zIndex: -1,
              }} />
              <DashboardPreview />
            </div>
          </div>
        </section>

        {/* ── NÚMEROS ── */}
        <section style={{
          position: 'relative', zIndex: 1,
          borderTop: '1px solid rgba(255,255,255,0.05)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(255,255,255,0.015)',
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
              {[
                { n: 'R$ 81k', label: 'Limite MEI 2025', sub: 'Controlado automaticamente' },
                { n: '< 2min', label: 'Para lançar via IA', sub: 'Foto → transação categorizada' },
                { n: '100%', label: 'Rastreabilidade', sub: 'Entradas e saídas auditáveis' },
                { n: 'R$ 29', label: 'Por mês', sub: '14 dias de trial gratuito' },
              ].map(({ n, label, sub }) => (
                <div key={label} className="stat-item" style={{
                  borderRight: '1px solid rgba(255,255,255,0.05)',
                  padding: '32px 24px',
                }}>
                  <div style={{
                    fontSize: 32, fontWeight: 800,
                    letterSpacing: '-0.04em',
                    color: '#fff',
                    fontFamily: "'IBM Plex Mono', monospace",
                    marginBottom: 6,
                  }}>{n}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── COMO FUNCIONA ── */}
        <section id="como-funciona" style={{
          position: 'relative', zIndex: 1,
          maxWidth: 1200, margin: '0 auto',
          padding: '100px 40px',
        }}>
          <div style={{ maxWidth: 560, marginBottom: 60 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#3B82F6', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'IBM Plex Mono', monospace", marginBottom: 14 }}>
              COMO FUNCIONA
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
              Três passos para ter controle financeiro real.
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 2 }}>
            {[
              {
                n: '01',
                title: 'Crie sua conta',
                desc: 'Cadastro em 2 minutos. Sem burocracia, sem cartão. Você tem 14 dias para testar tudo.',
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
                  </svg>
                ),
              },
              {
                n: '02',
                title: 'Conecte seu banco',
                desc: 'Sincronização automática via Open Finance (Pluggy). Suas transações entram sem você digitar nada.',
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round">
                    <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                ),
              },
              {
                n: '03',
                title: 'Tome decisões',
                desc: 'Dashboard em tempo real, alertas de DAS, IA que responde dúvidas financeiras. Você vê tudo.',
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                ),
              },
            ].map(({ n, title, desc, icon }, i) => (
              <div key={n} style={{
                padding: '36px 32px',
                borderLeft: i === 0 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                borderRight: '1px solid rgba(255,255,255,0.07)',
                borderTop: '1px solid rgba(255,255,255,0.07)',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', top: 28, right: 28,
                  fontSize: 11, fontWeight: 700,
                  color: 'rgba(255,255,255,0.12)',
                  fontFamily: "'IBM Plex Mono', monospace",
                  letterSpacing: '0.1em',
                }}>{n}</div>

                <div style={{
                  width: 44, height: 44,
                  background: 'rgba(59,130,246,0.1)',
                  border: '1px solid rgba(59,130,246,0.2)',
                  borderRadius: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20,
                }}>
                  {icon}
                </div>

                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>{title}</div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>{desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FUNCIONALIDADES ── */}
        <section id="funcionalidades" style={{
          position: 'relative', zIndex: 1,
          background: 'rgba(255,255,255,0.015)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 40px' }}>
            <div style={{ maxWidth: 560, marginBottom: 60 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#3B82F6', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'IBM Plex Mono', monospace", marginBottom: 14 }}>
                FUNCIONALIDADES
              </div>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
                Tudo que você precisa.<br />Nada que você não vai usar.
              </h2>
            </div>

            <div className="features-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 16,
            }}>
              {[
                { icon: '📊', title: 'Fluxo de caixa em tempo real', desc: 'Entradas e saídas sincronizadas com seu banco. Saldo atualizado automaticamente.' },
                { icon: '🤖', title: 'IA Financeira integrada', desc: 'Lança transações por foto, responde perguntas financeiras, detecta anomalias no seu caixa.' },
                { icon: '📅', title: 'Alertas de DAS', desc: 'Nunca perca o vencimento do imposto. Valor calculado automaticamente todo mês.' },
                { icon: '📈', title: 'Relatórios anuais + DASN', desc: 'Tudo que o contador precisa, gerado em segundos. Faturamento por categoria, anual e mensal.' },
                { icon: '🔗', title: 'Open Finance (Pluggy)', desc: 'Conexão bancária segura sem compartilhar senha. Funciona com os principais bancos do Brasil.' },
                { icon: '👥', title: 'Clientes e orçamentos', desc: 'Cadastro de clientes, emissão de orçamentos e controle de cobranças em aberto.' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="feature-card">
                  <div style={{ fontSize: 26, marginBottom: 14 }}>{icon}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.02em' }}>{title}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', lineHeight: 1.7 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ANTI-PLANILHA ── */}
        <section style={{
          position: 'relative', zIndex: 1,
          maxWidth: 1200, margin: '0 auto',
          padding: '100px 40px',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#3B82F6', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'IBM Plex Mono', monospace", marginBottom: 14 }}>
                ANTI-PLANILHA
              </div>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 24 }}>
                Gestão financeira não é talento.<br />
                <span style={{ color: '#3B82F6' }}>É ferramenta.</span>
              </h2>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, marginBottom: 32 }}>
                Empresas grandes têm CFO, contador e ERP. O MEI tem a Kore. 
                Um sistema que alerta antes do problema virar crise e responde em segundos o que 
                antes levava uma tarde de planilha para descobrir.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  'Chega de planilha. Começa o controle.',
                  'Seu negócio merece um sistema. Não uma aba do Excel.',
                  'O dinheiro do seu negócio tem destino. A Kore mostra qual é.',
                ].map(t => (
                  <div key={t} style={{
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                    padding: '12px 16px',
                    background: 'rgba(59,130,246,0.04)',
                    border: '1px solid rgba(59,130,246,0.12)',
                    borderRadius: 10,
                  }}>
                    <span style={{ color: '#3B82F6', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>→</span>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Comparativo */}
            <div style={{
              background: '#0d1117',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, overflow: 'hidden',
              fontFamily: "'IBM Plex Mono', monospace",
            }}>
              {/* Header */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                background: 'rgba(255,255,255,0.04)',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
              }}>
                <div style={{ padding: '12px 16px', fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: '1px' }}>FUNCIONALIDADE</div>
                <div style={{ padding: '12px 16px', fontSize: 11, color: '#f87171', fontWeight: 700, letterSpacing: '1px', borderLeft: '1px solid rgba(255,255,255,0.07)' }}>PLANILHA</div>
                <div style={{ padding: '12px 16px', fontSize: 11, color: '#3B82F6', fontWeight: 700, letterSpacing: '1px', borderLeft: '1px solid rgba(255,255,255,0.07)' }}>KORE</div>
              </div>

              {[
                ['Sync bancário automático', '✗', '✓'],
                ['Alertas de imposto', '✗', '✓'],
                ['IA financeira', '✗', '✓'],
                ['Relatório anual', 'Manual', '✓ Auto'],
                ['Acesso mobile', 'Limitado', '✓ Full'],
                ['Tempo p/ lançar', '~10 min', '< 2 min'],
              ].map(([feat, sem, com], i) => (
                <div key={feat as string} style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                  borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}>
                  <div style={{ padding: '11px 16px', fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: "'IBM Plex Sans', sans-serif" }}>{feat}</div>
                  <div style={{ padding: '11px 16px', fontSize: 12, color: '#f87171', fontWeight: 700, borderLeft: '1px solid rgba(255,255,255,0.04)' }}>{sem}</div>
                  <div style={{ padding: '11px 16px', fontSize: 12, color: '#34d399', fontWeight: 700, borderLeft: '1px solid rgba(255,255,255,0.04)' }}>{com}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section id="precos" style={{
          position: 'relative', zIndex: 1,
          background: 'rgba(255,255,255,0.015)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          <div style={{ maxWidth: 480, margin: '0 auto', padding: '100px 40px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#3B82F6', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'IBM Plex Mono', monospace", marginBottom: 14 }}>
              PREÇO DIRETO
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 12 }}>
              Um plano. Acesso total.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 48, fontSize: 15 }}>Sem tier básico. Sem funcionalidade travada.</p>

            <div style={{
              background: '#0d1117',
              border: '1px solid rgba(59,130,246,0.3)',
              borderRadius: 20, padding: '40px 36px',
              boxShadow: '0 0 80px rgba(59,130,246,0.08), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#3B82F6', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'IBM Plex Mono', monospace", marginBottom: 16 }}>
                KORE SYSTEM
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 4, marginBottom: 6 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.5)', alignSelf: 'flex-start', marginTop: 10 }}>R$</span>
                <span style={{ fontSize: 56, fontWeight: 800, letterSpacing: '-0.05em', fontFamily: "'IBM Plex Mono', monospace" }}>29</span>
                <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>/mês</span>
              </div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 32 }}>Após os 14 dias de trial gratuito</p>

              <div style={{ textAlign: 'left', marginBottom: 32 }}>
                {[
                  'Fluxo de caixa em tempo real',
                  'IA Financeira ilimitada',
                  'Alertas de DAS automáticos',
                  'Relatórios anuais + DASN-SIMEI',
                  'Sincronização bancária (Open Finance)',
                  'Clientes, orçamentos e cobranças',
                ].map(f => (
                  <div key={f} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    fontSize: 14,
                  }}>
                    <span style={{ color: '#3B82F6', fontWeight: 700, fontSize: 13 }}>✓</span>
                    <span style={{ color: 'rgba(255,255,255,0.65)' }}>{f}</span>
                  </div>
                ))}
              </div>

              <Link href="/login?mode=signup" className="kore-btn-primary" style={{
                display: 'flex', justifyContent: 'center',
                width: '100%', padding: 16, fontSize: 16, borderRadius: 12,
              }}>
                Começar 14 dias grátis →
              </Link>

              <p style={{ marginTop: 14, fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
                Sem cartão agora · Cancele quando quiser
              </p>
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section style={{
          position: 'relative', zIndex: 1,
          maxWidth: 800, margin: '0 auto',
          padding: '100px 40px',
          textAlign: 'center',
        }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(59,130,246,0.06)',
            border: '1px solid rgba(59,130,246,0.15)',
            borderRadius: 20,
            padding: '60px 80px',
          }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 16 }}>
              Você não precisa de mais<br />cursos. Precisa de <span style={{ color: '#3B82F6' }}>dado.</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 36, fontSize: 16 }}>
              Comece hoje. Sem cartão. Sem complicação.
            </p>
            <Link href="/login?mode=signup" className="kore-btn-primary" style={{ fontSize: 17, padding: '16px 40px', boxShadow: '0 0 48px rgba(59,130,246,0.3)' }}>
              Começar gratuitamente →
            </Link>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{
          position: 'relative', zIndex: 1,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '28px 40px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 16,
          maxWidth: 1200, margin: '0 auto',
        }}>
          <KLogo size={22} />
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', fontFamily: "'IBM Plex Mono', monospace" }}>
            © 2025 Kore System · kore.app
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            {[['Privacidade', '/privacidade'], ['Termos', '/termos']].map(([label, href]) => (
              <Link key={label} href={href} style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>
                {label}
              </Link>
            ))}
          </div>
        </footer>
      </div>
    </>
  )
}
