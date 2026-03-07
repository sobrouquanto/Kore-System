'use client'

import Link from 'next/link'

// ─── K logo inline ────────────────────────────────────────────
function KLogo({ size = 28 }: { size?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <img
        src="/kore-logo.png"
        alt="Kore"
        width={size}
        height={size}
        style={{ borderRadius: '6px', objectFit: 'contain' }}
      />
      <span
        style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontWeight: 800,
          fontSize: size * 0.65,
          letterSpacing: '-0.03em',
          color: '#fff',
          display: 'flex',
          alignItems: 'baseline',
        }}
      >
        Kore
        <span
          style={{
            color: 'rgba(255,255,255,0.35)',
            fontWeight: 400,
            fontSize: size * 0.38,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginLeft: 6,
          }}
        >
          System
        </span>
      </span>
    </div>
  )
}

// ─── Dashboard Preview — mock visual do produto ───────────────
function DashboardPreview() {
  const bars = [42, 68, 55, 80, 63, 90, 74]
  const months = ['Ago', 'Set', 'Out', 'Nov', 'Dez', 'Jan', 'Fev']

  return (
    <div
      style={{
        background:
          'linear-gradient(180deg, rgba(13,17,23,0.98) 0%, rgba(10,14,20,0.98) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        overflow: 'hidden',
        fontFamily: "'IBM Plex Mono', monospace",
        boxShadow:
          '0 30px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.02) inset',
      }}
    >
      {/* Topbar do mock */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.02)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <KLogo size={20} />
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#3B82F6',
              boxShadow: '0 0 8px #3B82F6',
            }}
          />
          <span
            style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.4)',
              letterSpacing: '0.05em',
            }}
          >
            Silva Elétrica
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', height: 360 }}>
        {/* Sidebar mock */}
        <div
          style={{
            width: 52,
            flexShrink: 0,
            borderRight: '1px solid rgba(255,255,255,0.05)',
            padding: '16px 0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20,
          }}
        >
          {['⚡', '📊', '📝', '👥', '🤖', '📈'].map((icon, i) => (
            <div
              key={i}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: i === 0 ? 'rgba(59,130,246,0.15)' : 'transparent',
                fontSize: 14,
                border:
                  i === 0
                    ? '1px solid rgba(59,130,246,0.3)'
                    : '1px solid transparent',
              }}
            >
              {icon}
            </div>
          ))}
        </div>

        {/* Conteúdo principal */}
        <div style={{ flex: 1, padding: '18px 20px', overflow: 'hidden' }}>
          {/* KPIs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3,1fr)',
              gap: 10,
              marginBottom: 16,
            }}
          >
            {[
              {
                label: 'RECEITA / MÊS',
                value: 'R$ 8.240',
                color: '#fff',
                sub: '+12% vs anterior',
              },
              {
                label: 'LUCRO LÍQUIDO',
                value: 'R$ 3.100',
                color: '#34d399',
                sub: 'margem 37,6%',
              },
              {
                label: 'HEALTH SCORE',
                value: '84 / 100',
                color: '#3B82F6',
                sub: '↑ Estável',
              },
            ].map(({ label, value, color, sub }) => (
              <div
                key={label}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 10,
                  padding: '12px 14px',
                }}
              >
                <div
                  style={{
                    fontSize: 9,
                    color: 'rgba(255,255,255,0.3)',
                    letterSpacing: '1.5px',
                    fontWeight: 700,
                    marginBottom: 6,
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color,
                    letterSpacing: '-0.03em',
                    lineHeight: 1,
                  }}
                >
                  {value}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: 'rgba(255,255,255,0.3)',
                    marginTop: 4,
                  }}
                >
                  {sub}
                </div>
              </div>
            ))}
          </div>

          {/* Gráfico de barras */}
          <div
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 10,
              padding: '14px 16px',
              marginBottom: 14,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  color: 'rgba(255,255,255,0.4)',
                  letterSpacing: '1px',
                  fontWeight: 700,
                }}
              >
                FATURAMENTO — 7 MESES
              </span>
              <span
                style={{
                  fontSize: 10,
                  color: '#3B82F6',
                  fontWeight: 700,
                }}
              >
                +31% YoY
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                gap: 6,
                alignItems: 'flex-end',
                height: 70,
              }}
            >
              {bars.map((h, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: h * 0.7,
                      background:
                        i === 6
                          ? 'linear-gradient(180deg,#3B82F6,#1d4ed8)'
                          : 'rgba(59,130,246,0.25)',
                      borderRadius: '3px 3px 0 0',
                      border:
                        i === 6
                          ? '1px solid rgba(59,130,246,0.5)'
                          : 'none',
                    }}
                  />
                  <span
                    style={{
                      fontSize: 8,
                      color: 'rgba(255,255,255,0.3)',
                    }}
                  >
                    {months[i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Transações recentes */}
          <div
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 10,
              padding: '12px 16px',
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: 'rgba(255,255,255,0.4)',
                letterSpacing: '1px',
                fontWeight: 700,
                marginBottom: 10,
              }}
            >
              ÚLTIMAS TRANSAÇÕES
            </div>
            {[
              {
                desc: 'Serviço residencial — Rua das Flores',
                val: '+R$ 480',
                color: '#34d399',
                date: 'hoje',
              },
              {
                desc: 'Material elétrico — Casa do Parafuso',
                val: '-R$ 212',
                color: '#f87171',
                date: 'ontem',
              },
              {
                desc: 'Manutenção industrial — Fábrica ABC',
                val: '+R$ 1.200',
                color: '#34d399',
                date: '03/02',
              },
            ].map(({ desc, val, color, date }, idx, arr) => (
              <div
                key={desc}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '7px 0',
                  borderBottom:
                    idx < arr.length - 1
                      ? '1px solid rgba(255,255,255,0.04)'
                      : 'none',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'rgba(255,255,255,0.75)',
                      fontFamily: "'IBM Plex Sans', sans-serif",
                    }}
                  >
                    {desc}
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      color: 'rgba(255,255,255,0.3)',
                      marginTop: 2,
                    }}
                  >
                    {date}
                  </div>
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
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #3B82F6;
          color: #fff;
          padding: 13px 28px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 700;
          text-decoration: none;
          border: none;
          cursor: pointer;
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
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          color: rgba(255,255,255,0.6);
          padding: 13px 28px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
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
          transition: border-color 0.2s, background 0.2s, transform 0.2s;
        }

        .feature-card:hover {
          border-color: rgba(59,130,246,0.3);
          background: rgba(59,130,246,0.04);
          transform: translateY(-2px);
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

        @media (max-width: 1024px) {
          .hero-grid,
          .anti-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .features-grid { grid-template-columns: 1fr 1fr !important; }
          .nav-links { display: none !important; }
          .hero-actions { flex-direction: column; align-items: flex-start !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: 1fr !important; }
          .pricing-wrap { padding: 80px 24px !important; }
          .section-wrap { padding-left: 24px !important; padding-right: 24px !important; }
          .nav-wrap { padding: 0 20px !important; }
          .cta-box { padding: 40px 24px !important; width: 100%; }
        }

        @media (max-width: 480px) {
          .features-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div
        style={{
          background: 'linear-gradient(180deg, #0B0B0F 0%, #0D1117 100%)',
          minHeight: '100vh',
        }}
      >
        {/* ── Background premium ── */}
        <div
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 0,
            overflow: 'hidden',
            background: `
              radial-gradient(circle at 15% 20%, rgba(59,130,246,0.18) 0%, transparent 32%),
              radial-gradient(circle at 85% 15%, rgba(59,130,246,0.10) 0%, transparent 28%),
              radial-gradient(circle at 50% 75%, rgba(29,78,216,0.10) 0%, transparent 30%),
              linear-gradient(180deg, #0B0B0F 0%, #0B0B0F 45%, #0E1118 100%)
            `,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backdropFilter: 'blur(2px)',
            }}
          />
        </div>

        {/* ── NAV ── */}
        <nav
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 40px',
            height: 64,
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(11,11,15,0.72)',
            backdropFilter: 'blur(16px)',
          }}
          className="nav-wrap"
        >
          <KLogo size={26} />

          <div className="nav-links" style={{ display: 'flex', gap: 32 }}>
            <a href="#funcionalidades" className="nav-link">
              Funcionalidades
            </a>
            <a href="#precos" className="nav-link">
              Preços
            </a>
            <a href="#como-funciona" className="nav-link">
              Como funciona
            </a>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Link
              href="/login"
              className="kore-btn-ghost"
              style={{ padding: '8px 18px', fontSize: 14 }}
            >
              Entrar
            </Link>
            <Link
              href="/login?mode=signup"
              className="kore-btn-primary"
              style={{ padding: '8px 18px', fontSize: 14 }}
            >
              Começar grátis
            </Link>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section
          style={{
            position: 'relative',
            zIndex: 1,
            maxWidth: 1200,
            margin: '0 auto',
            padding: '80px 40px 60px',
          }}
          className="section-wrap"
        >
          <div
            className="hero-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 64,
              alignItems: 'center',
            }}
          >
            {/* Texto */}
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(59,130,246,0.08)',
                  border: '1px solid rgba(59,130,246,0.2)',
                  borderRadius: 99,
                  padding: '5px 14px',
                  marginBottom: 28,
                  boxShadow: '0 0 40px rgba(59,130,246,0.08)',
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#3B82F6',
                    animation: 'float 2s ease-in-out infinite',
                  }}
                />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#93c5fd',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    fontFamily: "'IBM Plex Mono', monospace",
                  }}
                >
                  Gestão financeira para MEI
                </span>
              </div>

              <h1
                style={{
                  fontSize: 'clamp(2.2rem, 4vw, 3.4rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.04em',
                  lineHeight: 1.06,
                  marginBottom: 24,
                  color: '#fff',
                }}
              >
                O Núcleo Financeiro
                <br />
                <span
                  style={{
                    color: 'transparent',
                    backgroundImage: 'linear-gradient(135deg, #60a5fa, #3B82F6)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                  }}
                >
                  Do Seu Negócio.
                </span>
              </h1>

              <p
                style={{
                  fontSize: 17,
                  color: 'rgba(255,255,255,0.52)',
                  lineHeight: 1.7,
                  marginBottom: 36,
                  maxWidth: 460,
                }}
              >
                Sistema completo de gestão para MEI. Controle de caixa, IA
                financeira, alertas de DAS e relatórios — tudo integrado, tudo
                automático.
              </p>

              <div
                className="hero-actions"
                style={{
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <Link
                  href="/login?mode=signup"
                  className="kore-btn-primary"
                  style={{ fontSize: 16, padding: '14px 32px' }}
                >
                  Começar gratuitamente →
                </Link>
                <a
                  href="#como-funciona"
                  className="kore-btn-ghost"
                  style={{ fontSize: 16, padding: '14px 24px' }}
                >
                  Ver demo
                </a>
              </div>

              <div
                style={{
                  marginTop: 20,
                  display: 'flex',
                  gap: 20,
                  flexWrap: 'wrap',
                }}
              >
                {[
                  '7 dias grátis',
                  'Sem cartão de crédito',
                  'Cancele quando quiser',
                ].map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: 12,
                      color: 'rgba(255,255,255,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <span style={{ color: '#3B82F6', fontWeight: 700 }}>✓</span>{' '}
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="preview-float" style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  inset: -40,
                  background:
                    'radial-gradient(ellipse at center, rgba(59,130,246,0.15) 0%, transparent 70%)',
                  borderRadius: '50%',
                  zIndex: -1,
                }}
              />
              <DashboardPreview />
            </div>
          </div>
        </section>

        {/* ── NÚMEROS ── */}
        <section
          style={{
            position: 'relative',
            zIndex: 1,
            borderTop: '1px solid rgba(255,255,255,0.05)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(255,255,255,0.015)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px' }}>
            <div
              className="stats-grid"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}
            >
              {[
                {
                  n: 'R$ 81k',
                  label: 'Limite MEI 2025',
                  sub: 'Controlado automaticamente',
                },
                {
                  n: '< 2min',
                  label: 'Para lançar via IA',
                  sub: 'Foto → transação categorizada',
                },
                {
                  n: '100%',
                  label: 'Rastreabilidade',
                  sub: 'Entradas e saídas auditáveis',
                },
                {
                  n: 'R$ 29',
                  label: 'Por mês',
                  sub: '7 dias de trial gratuito',
                },
              ].map(({ n, label, sub }, idx, arr) => (
                <div
                  key={label}
                  className="stat-item"
                  style={{
                    borderRight:
                      idx < arr.length - 1
                        ? '1px solid rgba(255,255,255,0.05)'
                        : 'none',
                    padding: '32px 24px',
                  }}
                >
                  <div
                    style={{
                      fontSize: 32,
                      fontWeight: 800,
                      letterSpacing: '-0.04em',
                      color: '#fff',
                      fontFamily: "'IBM Plex Mono', monospace",
                      marginBottom: 6,
                    }}
                  >
                    {n}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: 'rgba(255,255,255,0.6)',
                      marginBottom: 4,
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}
                  >
                    {sub}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── COMO FUNCIONA ── */}
        <section
          id="como-funciona"
          style={{
            position: 'relative',
            zIndex: 1,
            maxWidth: 1200,
            margin: '0 auto',
            padding: '100px 40px',
          }}
          className="section-wrap"
        >
          <div style={{ maxWidth: 560, marginBottom: 60 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#3B82F6',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontFamily: "'IBM Plex Mono', monospace",
                marginBottom: 14,
              }}
            >
              COMO FUNCIONA
            </div>
            <h2
              style={{
                fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
                fontWeight: 800,
                letterSpacing: '-0.04em',
                lineHeight: 1.1,
              }}
            >
              Três passos para ter controle financeiro real.
            </h2>
          </div>

          <div
            className="steps-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 2 }}
          >
            {[
              {
                n: '01',
                title: 'Crie sua conta',
                desc: 'Cadastro em 2 minutos. Sem burocracia, sem cartão. Você tem 7 dias para testar tudo.',
                icon: (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" y1="8" x2="19" y2="14" />
                    <line x1="22" y1="11" x2="16" y2="11" />
                  </svg>
                ),
              },
              {
                n: '02',
                title: 'Conecte seu banco',
                desc: 'Sincronização automática via Open Finance (Pluggy). Suas transações entram sem você digitar nada.',
                icon: (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <rect x="1" y="4" width="22" height="16" rx="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                ),
              },
              {
                n: '03',
                title: 'Tome decisões',
                desc: 'Dashboard em tempo real, alertas de DAS, IA que responde dúvidas financeiras. Você vê tudo.',
                icon: (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                ),
              },
            ].map(({ n, title, desc, icon }, i) => (
              <div
                key={n}
                style={{
                  padding: '36px 32px',
                  borderLeft:
                    i === 0 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                  borderRight: '1px solid rgba(255,255,255,0.07)',
                  borderTop: '1px solid rgba(255,255,255,0.07)',
                  borderBottom: '1px solid rgba(255,255,255,0.07)',
                  position: 'relative',
                  background: 'rgba(255,255,255,0.01)',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 28,
                    right: 28,
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.12)',
                    fontFamily: "'IBM Plex Mono', monospace",
                    letterSpacing: '0.1em',
                  }}
                >
                  {n}
                </div>

                <div
                  style={{
                    width: 44,
                    height: 44,
                    background: 'rgba(59,130,246,0.1)',
                    border: '1px solid rgba(59,130,246,0.2)',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 20,
                  }}
                >
                  {icon}
                </div>

                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>
                  {title}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: 'rgba(255,255,255,0.45)',
                    lineHeight: 1.7,
                  }}
                >
                  {desc}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FUNCIONALIDADES ── */}
        <section
          id="funcionalidades"
          style={{
            position: 'relative',
            zIndex: 1,
            background: 'rgba(255,255,255,0.015)',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <div
            style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 40px' }}
            className="section-wrap"
          >
            <div style={{ maxWidth: 560, marginBottom: 60 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#3B82F6',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  fontFamily: "'IBM Plex Mono', monospace",
                  marginBottom: 14,
                }}
              >
                FUNCIONALIDADES
              </div>
              <h2
                style={{
                  fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.04em',
                  lineHeight: 1.1,
                }}
              >
                Tudo que você precisa.
                <br />
                Nada que você não vai usar.
              </h2>
            </div>

            <div
              className="features-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 16,
              }}
            >
              {[
                {
                  icon: '📊',
                  title: 'Fluxo de caixa em tempo real',
                  desc: 'Entradas e saídas sincronizadas com seu banco. Saldo atualizado automaticamente.',
                },
                {
                  icon: '🤖',
                  title: 'IA Financeira integrada',
                  desc: 'Lança transações por foto, responde perguntas financeiras, detecta anomalias no seu caixa.',
                },
                {
                  icon: '📅',
                  title: 'Alertas de DAS',
                  desc: 'Nunca perca o vencimento do imposto. Valor calculado automaticamente todo mês.',
                },
                {
                  icon: '📈',
                  title: 'Relatórios anuais + DASN',
                  desc: 'Tudo que o contador precisa, gerado em segundos. Faturamento por categoria, anual e mensal.',
                },
                {
                  icon: '🔗',
                  title: 'Open Finance (Pluggy)',
                  desc: 'Conexão bancária segura sem compartilhar senha. Funciona com os principais bancos do Brasil.',
                },
                {
                  icon: '👥',
                  title: 'Clientes e orçamentos',
                  desc: 'Cadastro de clientes, emissão de orçamentos e controle de cobranças em aberto.',
                },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="feature-card">
                  <div style={{ fontSize: 26, marginBottom: 14 }}>{icon}</div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      marginBottom: 8,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {title}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: 'rgba(255,255,255,0.42)',
                      lineHeight: 1.7,
                    }}
                  >
                    {desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ANTI-PLANILHA ── */}
        <section
          style={{
            position: 'relative',
            zIndex: 1,
            maxWidth: 1200,
            margin: '0 auto',
            padding: '100px 40px',
          }}
          className="section-wrap"
        >
          <div
            className="anti-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 80,
              alignItems: 'center',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#3B82F6',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  fontFamily: "'IBM Plex Mono', monospace",
                  marginBottom: 14,
                }}
              >
                ANTI-PLANILHA
              </div>
              <h2
                style={{
                  fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.04em',
                  lineHeight: 1.1,
                  marginBottom: 24,
                }}
              >
                Gestão financeira não é talento.
                <br />
                <span style={{ color: '#3B82F6' }}>É ferramenta.</span>
              </h2>
              <p
                style={{
                  fontSize: 15,
                  color: 'rgba(255,255,255,0.45)',
                  lineHeight: 1.8,
                  marginBottom: 32,
                }}
              >
                Empresas grandes têm CFO, contador e ERP. O MEI tem a Kore. Um
                sistema que alerta antes do problema virar crise e responde em
                segundos o que antes levava uma tarde de planilha para descobrir.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  'Chega de planilha. Começa o controle.',
                  'Seu negócio merece um sistema. Não uma aba do Excel.',
                  'O dinheiro do seu negócio tem destino. A Kore mostra qual é.',
                ].map((t) => (
                  <div
                    key={t}
                    style={{
                      display: 'flex',
                      gap: 12,
                      alignItems: 'flex-start',
                      padding: '12px 16px',
                      background: 'rgba(59,130,246,0.04)',
                      border: '1px solid rgba(59,130,246,0.12)',
                      borderRadius: 10,
                    }}
                  >
                    <span
                      style={{
                        color: '#3B82F6',
                        fontWeight: 700,
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      →
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        color: 'rgba(255,255,255,0.65)',
                        lineHeight: 1.5,
                      }}
                    >
                      {t}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Comparativo */}
            <div
              style={{
                background:
                  'linear-gradient(180deg, rgba(13,17,23,0.96) 0%, rgba(10,14,20,0.96) 100%)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16,
                overflow: 'hidden',
                fontFamily: "'IBM Plex Mono', monospace",
                boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  background: 'rgba(255,255,255,0.04)',
                  borderBottom: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <div
                  style={{
                    padding: '12px 16px',
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.3)',
                    fontWeight: 700,
                    letterSpacing: '1px',
                  }}
                >
                  FUNCIONALIDADE
                </div>
                <div
                  style={{
                    padding: '12px 16px',
                    fontSize: 11,
                    color: '#f87171',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    borderLeft: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  PLANILHA
                </div>
                <div
                  style={{
                    padding: '12px 16px',
                    fontSize: 11,
                    color: '#3B82F6',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    borderLeft: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  KORE
                </div>
              </div>

              {[
                ['Sync bancário automático', '✗', '✓'],
                ['Alertas de imposto', '✗', '✓'],
                ['IA financeira', '✗', '✓'],
                ['Relatório anual', 'Manual', '✓ Auto'],
                ['Acesso mobile', 'Limitado', '✓ Full'],
                ['Tempo p/ lançar', '~10 min', '< 2 min'],
              ].map(([feat, sem, com], i) => (
                <div
                  key={feat as string}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    borderBottom:
                      i < 5 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  }}
                >
                  <div
                    style={{
                      padding: '11px 16px',
                      fontSize: 12,
                      color: 'rgba(255,255,255,0.5)',
                      fontFamily: "'IBM Plex Sans', sans-serif",
                    }}
                  >
                    {feat}
                  </div>
                  <div
                    style={{
                      padding: '11px 16px',
                      fontSize: 12,
                      color: '#f87171',
                      fontWeight: 700,
                      borderLeft: '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    {sem}
                  </div>
                  <div
                    style={{
                      padding: '11px 16px',
                      fontSize: 12,
                      color: '#34d399',
                      fontWeight: 700,
                      borderLeft: '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    {com}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CALCULADORA MEI ── */}
        <section
          id="calculadora"
          style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '100px 40px' }}
          className="section-wrap"
        >
          <div style={{ maxWidth: 560, marginBottom: 60 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#3B82F6', letterSpacing: '0.12em', textTransform: 'uppercase' as const, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 14 }}>CALCULADORA MEI</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 16 }}>
              Quanto você pode retirar<br /><span style={{ color: '#3B82F6' }}>este mês?</span>
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>Simule agora, sem precisar criar conta. O Kore faz isso automaticamente todo mês com seus dados reais.</p>
          </div>
          <div className="anti-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'start' }}>
            <div style={{ background: 'linear-gradient(180deg,rgba(13,17,23,0.98),rgba(10,14,20,0.98))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 36, boxShadow: '0 20px 60px rgba(0,0,0,0.35)' }}>
              {([
                { id: 'calc-receita', label: 'Receita bruta do mês', min: 500, max: 6750, step: 100, def: 4000 },
                { id: 'calc-despesas', label: 'Despesas do mês', min: 0, max: 4000, step: 100, def: 1200 },
                { id: 'calc-anual', label: 'Faturamento acumulado no ano', min: 0, max: 81000, step: 1000, def: 28000 },
              ] as {id:string;label:string;min:number;max:number;step:number;def:number}[]).map(({ id, label, min, max, step, def }) => (
                <div key={id} style={{ marginBottom: 28 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase' as const }}>{label}</span>
                    <span id={`${id}-val`} style={{ fontSize: 14, fontWeight: 700, color: '#60a5fa', fontFamily: "'IBM Plex Mono', monospace" }}>R$ {def.toLocaleString('pt-BR')}</span>
                  </div>
                  <input type="range" id={id} min={min} max={max} step={step} defaultValue={def} style={{ width: '100%', accentColor: '#3B82F6', cursor: 'pointer' }}
                    onChange={() => {
                      const r = (document.getElementById('calc-receita') as HTMLInputElement)?.valueAsNumber || 4000
                      const d = (document.getElementById('calc-despesas') as HTMLInputElement)?.valueAsNumber || 1200
                      const a = (document.getElementById('calc-anual') as HTMLInputElement)?.valueAsNumber || 28000
                      const fmt = (v: number) => 'R$ ' + Math.round(v).toLocaleString('pt-BR')
                      const lucro = r - d; const das = Math.round(r * 0.06); const reserva = Math.round((lucro - das) * 0.2); const retirada = Math.max(0, lucro - das - reserva); const limite = ((a / 81000) * 100).toFixed(1)
                      ;(document.getElementById('calc-receita-val') as HTMLElement).textContent = fmt(r)
                      ;(document.getElementById('calc-despesas-val') as HTMLElement).textContent = fmt(d)
                      ;(document.getElementById('calc-anual-val') as HTMLElement).textContent = fmt(a)
                      ;(document.getElementById('res-lucro') as HTMLElement).textContent = fmt(lucro)
                      ;(document.getElementById('res-das') as HTMLElement).textContent = fmt(das)
                      ;(document.getElementById('res-reserva') as HTMLElement).textContent = fmt(reserva)
                      ;(document.getElementById('res-retirada') as HTMLElement).textContent = fmt(retirada)
                      const limEl = document.getElementById('res-limite') as HTMLElement
                      limEl.textContent = limite + '%'
                      limEl.style.color = +limite > 80 ? '#f87171' : +limite > 60 ? '#f59e0b' : '#34d399'
                    }}
                  />
                </div>
              ))}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden' }}>
                {([
                  { label: 'Lucro bruto', id: 'res-lucro', def: 'R$ 2.800', color: '#34d399', big: false },
                  { label: 'DAS estimado (6%)', id: 'res-das', def: 'R$ 240', color: '#f59e0b', big: false },
                  { label: 'Reserva segura (20%)', id: 'res-reserva', def: 'R$ 512', color: 'rgba(255,255,255,0.4)', big: false },
                  { label: 'Retirada recomendada', id: 'res-retirada', def: 'R$ 2.048', color: '#60a5fa', big: true },
                  { label: 'Limite MEI usado', id: 'res-limite', def: '34.6%', color: '#f59e0b', big: false },
                ] as {label:string;id:string;def:string;color:string;big:boolean}[]).map(({ label, id, def, color, big }, idx, arr) => (
                  <div key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', borderBottom: idx < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', background: big ? 'rgba(59,130,246,0.05)' : 'transparent' }}>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: big ? 700 : 400 }}>{label}</span>
                    <span id={id} style={{ fontSize: big ? 18 : 13, fontWeight: 700, color, fontFamily: "'IBM Plex Mono', monospace" }}>{def}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ paddingTop: 8 }}>
              <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 14, padding: 28, marginBottom: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#3B82F6', letterSpacing: '0.1em', fontFamily: "'IBM Plex Mono', monospace", marginBottom: 12 }}>COMO CALCULAMOS</div>
                {([['Lucro bruto','Receita − Despesas'],['DAS','6% da receita bruta (estimativa)'],['Reserva','20% do lucro após DAS'],['Retirada','O que sobra com segurança']] as string[][]).map(([k,v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 13 }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>{k}</span>
                    <span style={{ color: 'rgba(255,255,255,0.7)', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>{v}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.8, marginBottom: 28 }}>No Kore, esse cálculo é feito automaticamente todo mês com seus dados reais — receitas sincronizadas do banco, DAS calculado e reserva sugerida. Você abre o app e já sabe o número.</p>
              <Link href="/login?mode=signup" className="kore-btn-primary">Quero ver meu número real →</Link>
            </div>
          </div>
        </section>

        {/* ── SCORE DE SAÚDE ── */}
        <section style={{ position: 'relative', zIndex: 1, background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(6px)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 40px' }} className="section-wrap">
            <div style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 60px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#3B82F6', letterSpacing: '0.12em', textTransform: 'uppercase' as const, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 14 }}>SCORE DE SAÚDE</div>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 16 }}>
                Seu negócio está<br /><span style={{ color: '#3B82F6' }}>saudável?</span>
              </h2>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>O Kore calcula um score de 0 a 100 baseado nos seus dados financeiros reais — e explica cada fator.</p>
            </div>
            <div className="anti-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}>
              <div style={{ background: 'linear-gradient(180deg,rgba(13,17,23,0.98),rgba(10,14,20,0.98))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '40px 36px', boxShadow: '0 20px 60px rgba(0,0,0,0.35)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', fontFamily: "'IBM Plex Mono', monospace", marginBottom: 6 }}>HEALTH SCORE</div>
                    <div style={{ fontSize: 56, fontWeight: 800, fontFamily: "'IBM Plex Mono', monospace", color: '#3B82F6', lineHeight: 1, letterSpacing: '-0.04em' }}>72</div>
                    <div style={{ fontSize: 12, color: '#60a5fa', marginTop: 6, fontWeight: 600 }}>Atenção necessária ⚠️</div>
                  </div>
                  <svg width="80" height="80" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>
                    <circle cx="40" cy="40" r="34" fill="none" stroke="#3B82F6" strokeWidth="8" strokeDasharray={`${2*Math.PI*34*0.72} ${2*Math.PI*34}`} strokeLinecap="round" transform="rotate(-90 40 40)"/>
                    <text x="40" y="44" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="11" fontFamily="IBM Plex Mono">72/100</text>
                  </svg>
                </div>
                {([
                  { label: 'Margem de lucro', score: 68, detail: '42% de margem · ideal ≥ 40%', weight: '35%' },
                  { label: 'Uso do limite MEI', score: 85, detail: '34% usado · restam R$53.580', weight: '25%' },
                  { label: 'Obrigações fiscais', score: 100, detail: 'DAS pago este mês ✓', weight: '20%' },
                  { label: 'Cobranças em dia', score: 50, detail: '2 cobranças vencidas', weight: '10%' },
                  { label: 'Tendência de lucro', score: 60, detail: '-8% vs mês anterior', weight: '10%' },
                ] as {label:string;score:number;detail:string;weight:string}[]).map(({ label, score, detail, weight }) => {
                  const barColor = score >= 70 ? '#34d399' : score >= 40 ? '#f59e0b' : '#f87171'
                  return (
                    <div key={label} style={{ marginBottom: 18 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <div><span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span><span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginLeft: 6, fontFamily: "'IBM Plex Mono', monospace" }}>({weight})</span></div>
                        <span style={{ fontSize: 13, fontWeight: 800, color: barColor, fontFamily: "'IBM Plex Mono', monospace" }}>{score}</span>
                      </div>
                      <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.06)' }}>
                        <div style={{ height: '100%', width: `${score}%`, background: barColor, borderRadius: 99 }} />
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4, fontFamily: "'IBM Plex Mono', monospace" }}>{detail}</div>
                    </div>
                  )
                })}
              </div>
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {([
                    { icon: '📊', title: 'Baseado nos seus dados reais', desc: 'Margem de lucro, limite MEI, DAS em dia, cobranças vencidas e tendência mensal. Não é um número genérico.' },
                    { icon: '🔔', title: 'Alertas antes do problema', desc: 'O score cai antes de você perceber. O Kore te avisa quando algo muda — margem caindo, despesas subindo, DAS esquecido.' },
                    { icon: '📈', title: 'Acompanhe a evolução', desc: 'Veja como seu score evoluiu ao longo dos meses e o que fez a diferença. Visualização histórica completa.' },
                  ] as {icon:string;title:string;desc:string}[]).map(({ icon, title, desc }) => (
                    <div key={title} style={{ display: 'flex', gap: 18, padding: '20px 24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14 }}>
                      <span style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{icon}</span>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{title}</div>
                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', lineHeight: 1.7 }}>{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 32 }}>
                  <Link href="/login?mode=signup" className="kore-btn-primary">Ver meu score agora →</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section
          id="precos"
          style={{
            position: 'relative',
            zIndex: 1,
            background: 'rgba(255,255,255,0.015)',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <div
            style={{
              maxWidth: 480,
              margin: '0 auto',
              padding: '100px 40px',
              textAlign: 'center',
            }}
            className="pricing-wrap"
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#3B82F6',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontFamily: "'IBM Plex Mono', monospace",
                marginBottom: 14,
              }}
            >
              PREÇO DIRETO
            </div>
            <h2
              style={{
                fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
                fontWeight: 800,
                letterSpacing: '-0.04em',
                marginBottom: 12,
              }}
            >
              Um plano. Acesso total.
            </h2>
            <p
              style={{
                color: 'rgba(255,255,255,0.4)',
                marginBottom: 48,
                fontSize: 15,
              }}
            >
              Sem tier básico. Sem funcionalidade travada.
            </p>

            <div
              style={{
                background:
                  'linear-gradient(180deg, rgba(13,17,23,0.98) 0%, rgba(10,14,20,0.98) 100%)',
                border: '1px solid rgba(59,130,246,0.3)',
                borderRadius: 20,
                padding: '40px 36px',
                boxShadow:
                  '0 0 80px rgba(59,130,246,0.08), inset 0 1px 0 rgba(255,255,255,0.06)',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#3B82F6',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  fontFamily: "'IBM Plex Mono', monospace",
                  marginBottom: 16,
                }}
              >
                KORE SYSTEM
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  gap: 4,
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.5)',
                    alignSelf: 'flex-start',
                    marginTop: 10,
                  }}
                >
                  R$
                </span>
                <span
                  style={{
                    fontSize: 56,
                    fontWeight: 800,
                    letterSpacing: '-0.05em',
                    fontFamily: "'IBM Plex Mono', monospace",
                  }}
                >
                  29
                </span>
                <span
                  style={{
                    fontSize: 15,
                    color: 'rgba(255,255,255,0.35)',
                    marginBottom: 6,
                  }}
                >
                  /mês
                </span>
              </div>
              <p
                style={{
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.3)',
                  marginBottom: 32,
                }}
              >
                Após os 7 dias de trial gratuito
              </p>

              <div style={{ textAlign: 'left', marginBottom: 32 }}>
                {[
                  'Fluxo de caixa em tempo real',
                  'IA Financeira ilimitada',
                  'Alertas de DAS automáticos',
                  'Relatórios anuais + DASN-SIMEI',
                  'Sincronização bancária (Open Finance)',
                  'Clientes, orçamentos e cobranças',
                ].map((f, idx, arr) => (
                  <div
                    key={f}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '9px 0',
                      borderBottom:
                        idx < arr.length - 1
                          ? '1px solid rgba(255,255,255,0.05)'
                          : 'none',
                      fontSize: 14,
                    }}
                  >
                    <span
                      style={{ color: '#3B82F6', fontWeight: 700, fontSize: 13 }}
                    >
                      ✓
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.65)' }}>{f}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/login?mode=signup"
                className="kore-btn-primary"
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  width: '100%',
                  padding: 16,
                  fontSize: 16,
                  borderRadius: 12,
                }}
              >
                Começar 7 dias grátis →
              </Link>

              <p
                style={{
                  marginTop: 14,
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.25)',
                }}
              >
                Sem cartão agora · Cancele quando quiser
              </p>
            </div>
          </div>
        </section>

        {/* ── DEPOIMENTOS ── */}
        <section style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '100px 40px' }} className="section-wrap">
          <div style={{ maxWidth: 560, marginBottom: 60 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#3B82F6', letterSpacing: '0.12em', textTransform: 'uppercase' as const, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 14 }}>QUEM USA</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
              MEIs que passaram a entender<br /><span style={{ color: '#3B82F6' }}>as próprias finanças.</span>
            </h2>
          </div>
          <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {([
              { stars: 5, text: 'Antes eu não sabia nem quanto estava lucrando de verdade. Agora vejo tudo no Cockpit e sei exatamente o que posso retirar.', name: 'Camila R.', biz: 'Designer freelancer · SP', bg: 'rgba(59,130,246,0.15)', color: '#60a5fa', initial: 'C' },
              { stars: 5, text: 'A IA me avisou que ia bater o limite do MEI em 2 meses. Consegui me planejar a tempo e abrir uma ME sem susto.', name: 'Rafael M.', biz: 'Dev freelancer · RJ', bg: 'rgba(16,185,129,0.15)', color: '#34d399', initial: 'R' },
              { stars: 5, text: 'Fotografei os recibos e a IA lançou tudo automaticamente. Economizo umas 3 horas por mês que eu gastava com planilha.', name: 'Ana L.', biz: 'Confeiteira · MG', bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', initial: 'A' },
            ] as {stars:number;text:string;name:string;biz:string;bg:string;color:string;initial:string}[]).map(({ stars, text, name, biz, bg, color, initial }) => (
              <div key={name} className="feature-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ color: '#f59e0b', fontSize: 13, letterSpacing: 2, marginBottom: 14 }}>{'★'.repeat(stars)}</div>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, fontStyle: 'italic', flex: 1, marginBottom: 20 }}>"{text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color, flexShrink: 0 }}>{initial}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{name}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{biz}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section style={{ position: 'relative', zIndex: 1, background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(6px)' }}>
          <div style={{ maxWidth: 760, margin: '0 auto', padding: '100px 40px' }} className="section-wrap">
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#3B82F6', letterSpacing: '0.12em', textTransform: 'uppercase' as const, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 14 }}>PERGUNTAS FREQUENTES</div>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1 }}>Dúvidas comuns.</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {([
                { q: 'Precisa de conhecimento contábil para usar?', a: 'Não. O Kore foi feito para MEIs que não são contadores. Tudo em linguagem simples e a IA responde suas dúvidas do dia a dia.' },
                { q: 'O Kore substitui o contador?', a: 'Não substitui — complementa. O Kore cuida da gestão diária: lançamentos, controle de caixa, limite do MEI. O contador faz a parte legal e fiscal. Muitos usuários mostram os relatórios do Kore para o contador e economizam tempo.' },
                { q: 'O DAS é calculado automaticamente?', a: 'O Kore calcula e avisa quando o DAS está próximo do vencimento (dia 20). O pagamento é feito no portal do PGMEI — o Kore te lembra e mostra o valor estimado.' },
                { q: 'Posso cancelar a qualquer momento?', a: 'Sim. Sem fidelidade, sem multa, sem burocracia. Cancele pelo próprio dashboard em menos de 1 minuto.' },
                { q: 'Meus dados financeiros ficam seguros?', a: 'Sim. Usamos Supabase com criptografia em repouso e em trânsito. Seus dados nunca são vendidos ou compartilhados com terceiros.' },
                { q: 'Funciona com qualquer banco?', a: 'A sincronização via Open Finance (Pluggy) funciona com os principais bancos do Brasil: Itaú, Bradesco, Nubank, Banco do Brasil, Caixa, Santander e outros.' },
              ] as {q:string;a:string}[]).map(({ q, a }, i) => (
                <details key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden' }}>
                  <summary style={{ padding: '20px 24px', fontSize: 15, fontWeight: 600, cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, userSelect: 'none' as const }}>
                    {q}<span style={{ color: '#3B82F6', fontSize: 18, flexShrink: 0, fontWeight: 400 }}>+</span>
                  </summary>
                  <div style={{ padding: '0 24px 20px', fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8 }}>{a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto', padding: '100px 40px', textAlign: 'center' }} className="section-wrap">
          <div className="cta-box" style={{ background: 'linear-gradient(135deg,rgba(59,130,246,0.12),rgba(29,78,216,0.08))', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 24, padding: '80px 60px', boxShadow: '0 0 80px rgba(59,130,246,0.08)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#3B82F6', letterSpacing: '0.12em', textTransform: 'uppercase' as const, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 20 }}>// COMECE AGORA</div>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.4rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: 20 }}>
              7 dias para entender<br />seu negócio de verdade.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 40, fontSize: 16, lineHeight: 1.7 }}>
              Sem cartão de crédito. Sem configuração complicada.<br />Cancele quando quiser.
            </p>
            <Link href="/login?mode=signup" className="kore-btn-primary" style={{ fontSize: 17, padding: '16px 44px', boxShadow: '0 0 48px rgba(59,130,246,0.35)' }}>
              Criar conta grátis →
            </Link>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.06)', padding: '28px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, maxWidth: 1200, margin: '0 auto' }} className="section-wrap">
          <KLogo size={22} />
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', fontFamily: "'IBM Plex Mono', monospace" }}>© 2026 Kore System · kore.app</div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <a href="https://wa.me/5521984150001" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Suporte</a>
            {([['Privacidade','/privacidade'],['Termos','/termos']] as string[][]).map(([label, href]) => (
              <Link key={label} href={href} style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>{label}</Link>
            ))}
          </div>
        </footer>

        {/* ── BOTÃO FLUTUANTE WHATSAPP ── */}
        <a
          href="https://wa.me/5521984150001?text=Olá!%20Preciso%20de%20ajuda%20com%20o%20Kore%20System."
          target="_blank"
          rel="noopener noreferrer"
          title="Falar com suporte"
          style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 999, width: 56, height: 56, borderRadius: '50%', background: '#25d366', boxShadow: '0 4px 24px rgba(37,211,102,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform='scale(1.1)';(e.currentTarget as HTMLAnchorElement).style.boxShadow='0 6px 32px rgba(37,211,102,0.55)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform='scale(1)';(e.currentTarget as HTMLAnchorElement).style.boxShadow='0 4px 24px rgba(37,211,102,0.4)' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>

      </div>
    </>
  )
}
