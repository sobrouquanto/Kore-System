'use client'
import { useRef, useState } from 'react'
import { useDashboard, fmt, pctOf, AiMessage } from '@/context/DashboardContext'

const AI_SUGGESTIONS = [
  'Quanto posso retirar esse mês?',
  'Quando vou bater o limite do MEI?',
  'Qual meu cliente mais valioso?',
  'Minha margem está boa?',
]

// ── Renderiza texto com markdown simples ──────────────────────────────────────
function MsgText({ text }: { text: string }) {
  const html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
  return <span dangerouslySetInnerHTML={{ __html: html }} />
}

export default function IATab() {
  const {
    user, userName, userBiz, stats, clients, receivables,
    aiMessages, setAiMessages, aiTyping, setAiTyping, chatRef,
    addTransaction,
  } = useDashboard()

  const [localInput, setLocalInput] = useState('')
  const [localImage, setLocalImage]   = useState<string | null>(null)     // data URL completa (para preview)
  const [imageBase64, setImageBase64] = useState<string | null>(null)      // só o base64 (para API)
  const [imageMediaType, setImageMediaType] = useState<string>('image/jpeg')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Métricas para sidebar e contexto ─────────────────────────────────────
  const margem    = pctOf(stats.monthProfitNet ?? stats.monthProfit, stats.monthRevenueNet ?? stats.monthRevenue)
  const pctLimit  = pctOf(stats.yearRevenue, 81000)
  const limitColor = parseFloat(pctLimit) > 80 ? 'var(--red)' : parseFloat(pctLimit) > 60 ? 'var(--amber)' : 'var(--green)'
  const topClient = [...clients].sort((a, b) => b.total_revenue - a.total_revenue)[0]
  const pendingReceivables = receivables.filter(r => r.status === 'pending')
  const pendingValue = pendingReceivables.reduce((s, r) => s + r.value, 0)

  // ── Fallback local quando API falha ──────────────────────────────────────
  // Retorna { text, pendingAction? } para que lançamentos também funcionem offline
  function buildFallback(msg: string): { text: string; pendingAction?: AiMessage['pendingAction'] } {
    const q = msg.toLowerCase()
    const { monthRevenue, monthExpenses, monthProfit, yearRevenue } = stats
    const profit  = stats.monthProfitNet  ?? monthProfit
    const revenue = stats.monthRevenueNet ?? monthRevenue
    const margemNum   = revenue > 0 ? ((profit / revenue) * 100).toFixed(0) : '0'
    const mesesLimit  = monthRevenue > 0 ? Math.max(0, (81000 - yearRevenue) / monthRevenue).toFixed(1) : '?'

    // ── Detecção de valor monetário na mensagem ───────────────────────────
    // Aceita: "181 reais", "R$181", "181,50", "181.50", "R$ 181,50"
    const valueMatch = msg.match(/R?\$?\s*(\d{1,6}(?:[.,]\d{1,2})?)\s*(?:reais?|BRL)?/i)
    const detectedValue = valueMatch
      ? parseFloat(valueMatch[1].replace(',', '.'))
      : null

    // ── Detecção de tipo (entrada ou saída) ───────────────────────────────
    const isOut = /pagu|gastei|despesa|conta\s|luz|água|internet|aluguel|fornec|material|imposto|das|comprei|débito|saída/i.test(q)
    const isIn  = /recebi|entrada|faturei|vendi|pix\s*receb|serviço\s*pago|cliente\s*pag/i.test(q)

    // ── Detecção de categoria ─────────────────────────────────────────────
    function detectCategory(): string {
      if (/luz|energia|enel|cemig|elektro|cpfl|light|eletric/i.test(q))  return 'Fixo'
      if (/água|saneamento|sabesp|copasa|cagece/i.test(q))               return 'Fixo'
      if (/internet|net |vivo|tim |claro|oi |telefon|banda larga/i.test(q)) return 'Fixo'
      if (/aluguel|condomín/i.test(q))                                   return 'Fixo'
      if (/fornec|material|insumo|estoque|compra/i.test(q))              return 'Fornecedor'
      if (/das|simples|imposto|inss|irpf|tribut/i.test(q))              return 'Imposto'
      if (/ifood|rappi|uber\s*eat|restaur|aliment|lanche|refei/i.test(q)) return 'Alimentação'
      if (/uber|99|taxi|gasolina|combustív|ônibus|transport/i.test(q))  return 'Transporte'
      if (/serviço|pix|cliente|trabalho|freela|projeto/i.test(q))        return 'Serviço'
      if (/equipament|notebook|computad|celular|ferramenta/i.test(q))   return 'Equipamento'
      return 'Outros'
    }

    // ── Extrai descrição curta da mensagem ────────────────────────────────
    function detectDescription(): string {
      if (/luz|energia|enel|cemig|elektro|cpfl|light/i.test(q))  return 'Conta de energia'
      if (/água|saneamento/i.test(q))                             return 'Conta de água'
      if (/internet|banda larga/i.test(q))                        return 'Internet'
      if (/aluguel/i.test(q))                                     return 'Aluguel'
      if (/das/i.test(q))                                         return 'DAS Mensal'
      if (/fornec|material/i.test(q))                             return 'Compra de material'
      if (/ifood|rappi/i.test(q))                                 return 'Alimentação'
      if (/uber|99|taxi/i.test(q))                                return 'Transporte'
      // Tenta extrair o nome do serviço/empresa da mensagem
      const empresaMatch = msg.match(/(?:da|do|de|pela?|na?o?)\s+([A-Z][a-zA-ZÀ-ú]{2,20})/i)
      if (empresaMatch) return empresaMatch[1]
      return isIn ? 'Receita recebida' : 'Despesa'
    }

    // ── Se detectou valor + intenção de lançar ────────────────────────────
    if (detectedValue && (isOut || isIn)) {
      const type     = isIn ? 'in' : 'out'
      const category = detectCategory()
      const description = detectDescription()
      const sign = type === 'in' ? '+' : '-'
      return {
        text: `Entendi! Detectei um lançamento de **${sign}${fmt(detectedValue)}** — ${description}. Confirma o registro?`,
        pendingAction: { type, value: detectedValue, description, category },
      }
    }

    // ── Perguntas informativas ────────────────────────────────────────────
    if (q.includes('retirar') || q.includes('sacar') || q.includes('labore'))
      return { text: `Com lucro de **${fmt(profit)}** este mês, você pode retirar **${fmt(profit * 0.5)}** com segurança. 💚` }
    if (q.includes('limite') || q.includes('mei'))
      return { text: `Você usou **${pctLimit}%** do limite anual. No ritmo atual, tem ainda **${mesesLimit} meses** antes de ultrapassar R$81.000. 📊` }
    if (q.includes('cliente') || q.includes('valioso'))
      return { text: topClient
        ? `Seu cliente mais valioso é **${topClient.name}**. Você tem ${clients.length} clientes no total. 🏆`
        : `Nenhum cliente cadastrado ainda. Vá até a aba Clientes! 👥` }
    if (q.includes('margem') || q.includes('lucro') || q.includes('saldo'))
      return { text: `Margem de **${margemNum}%** — ${Number(margemNum) >= 50 ? 'excelente! Acima da média.' : 'há espaço para melhorar.'} Receita: ${fmt(revenue)} | Despesas: ${fmt(stats.monthExpensesNet ?? monthExpenses)} | Lucro: ${fmt(profit)}. 💡` }
    if (q.includes('das') || q.includes('imposto'))
      return { text: `O DAS vence todo dia 20 do mês. Valor estimado: R$71–77 dependendo da atividade. Não esqueça! ⚠️` }
    if (q.includes('cobrança') || q.includes('pendente'))
      return { text: pendingReceivables.length > 0
        ? `Você tem **${pendingReceivables.length} cobranças** pendentes totalizando **${fmt(pendingValue)}**. Vá à aba Clientes para acompanhar. 💰`
        : `Nenhuma cobrança pendente. Tudo em dia! ✅` }

    // ── Detectou valor mas sem intenção clara — pergunta o tipo ──────────
    if (detectedValue) {
      return { text: `Detectei o valor **${fmt(detectedValue)}**. Foi uma entrada ou saída? Me diga mais detalhes para eu lançar. 💡` }
    }

    return { text: `Posso te ajudar com: margem de lucro, limite do MEI, quanto retirar, lançar despesas ou receitas. Tente: *"lancei R$300 de serviço"* ou *"paguei R$181 de luz"*. 🤖` }
  }

  // ── Processa arquivo de imagem ────────────────────────────────────────────
  function handleFile(file: File) {
    const mediaType = file.type || 'image/jpeg'
    setImageMediaType(mediaType)

    const reader = new FileReader()
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string
      setLocalImage(dataUrl) // preview

      // Extrai só o base64 (remove "data:image/jpeg;base64,")
      const base64 = dataUrl.split(',')[1]
      setImageBase64(base64)

      // Preenche input com instrução padrão se estiver vazio
      setLocalInput(prev => prev || 'Analise esta imagem e extraia os dados financeiros.')
    }
    reader.readAsDataURL(file)
  }

  // ── Envia mensagem para a IA ──────────────────────────────────────────────
  async function sendAI(text?: string) {
    const msg = text || localInput
    if (!msg.trim() && !imageBase64) return

    const userMsg: AiMessage = {
      role: 'user',
      text: msg,
      image: localImage || undefined,
    }

    setAiMessages((prev: AiMessage[]) => [...prev, userMsg])
    setLocalInput('')
    setLocalImage(null)
    const currentBase64    = imageBase64
    const currentMediaType = imageMediaType
    setImageBase64(null)
    setAiTyping(true)

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          imageBase64: currentBase64,
          imageMediaType: currentMediaType,
          financialContext: {
            userName,
            userBiz,
            monthRevenue:          fmt(stats.monthRevenueNet  ?? stats.monthRevenue),
            monthExpenses:         fmt(stats.monthExpensesNet ?? stats.monthExpenses),
            monthProfit:           fmt(stats.monthProfitNet   ?? stats.monthProfit),
            yearRevenue:           fmt(stats.yearRevenue),
            pctLimit,
            margem,
            clientCount:           clients.length,
            topClient:             topClient ? topClient.name : 'nenhum cadastrado',
            pendingReceivables:    pendingReceivables.length,
            pendingReceivablesValue: fmt(pendingValue),
          },
        }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()
      const responseText    = data.text || buildFallback(msg)
      const pendingAction   = data.pendingAction || null

      setAiMessages((prev: AiMessage[]) => [
        ...prev,
        { role: 'ai', text: responseText, pendingAction: pendingAction || undefined },
      ])

    } catch (err) {
      const fallback = buildFallback(msg)
      setAiMessages((prev: AiMessage[]) => [
        ...prev,
        { role: 'ai', text: fallback.text, pendingAction: fallback.pendingAction },
      ])
    }

    setAiTyping(false)
    setTimeout(() => chatRef.current?.scrollTo({ top: 99999, behavior: 'smooth' }), 100)
  }

  // ── Confirma e lança transação sugerida pela IA ───────────────────────────
  const [launching, setLaunching] = useState<number | null>(null)

  async function launchAction(msg: AiMessage, idx: number) {
    if (!msg.pendingAction || launching === idx) return
    setLaunching(idx)
    // Remove pendingAction imediatamente para bloquear novo clique
    setAiMessages((prev: AiMessage[]) =>
      prev.map((m, i) => i === idx ? { ...m, pendingAction: undefined } : m)
    )
    const { type, value, description, category } = msg.pendingAction
    await addTransaction(description, value, type, category, new Date().toISOString().split('T')[0])
    setAiMessages((prev: AiMessage[]) =>
      prev.map((m, i) => i === idx
        ? { ...m, text: m.text + '\n\n✅ **Lançado com sucesso!**' }
        : m
      )
    )
    setLaunching(null)
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", alignItems: "stretch" }}>

      {/* ── Chat ─────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>

          {/* Header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--green),var(--blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>🤖</div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700 }}>IA Assistente MEI 360</div>
              <div style={{ fontSize: '12px', color: 'var(--green)' }}>● Online · Treinada com seus dados reais</div>
            </div>
          </div>

          {/* Messages — scroll interno */}
          <div className="chat-messages" ref={chatRef} style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            {aiMessages.map((m, i) => (
              <div key={i} className={`msg msg-${m.role}`}>
                {m.role === 'ai' && <div className="msg-avatar">🤖</div>}
                <div style={{ maxWidth: '100%' }}>

                  {/* Imagem enviada pelo usuário */}
                  {m.image && (
                    <div style={{ marginBottom: '8px' }}>
                      <img
                        src={m.image}
                        alt="Imagem enviada"
                        style={{ maxWidth: '200px', maxHeight: '160px', borderRadius: '8px', border: '1px solid var(--card-border)', objectFit: 'cover' }}
                      />
                    </div>
                  )}

                  <div className="msg-bubble">
                    <MsgText text={m.text} />
                  </div>

                  {/* Card de confirmação de lançamento */}
                  {m.pendingAction && (
                    <div style={{ marginTop: '10px', padding: '12px 14px', background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '8px', fontWeight: 700, letterSpacing: '0.5px' }}>LANÇAMENTO DETECTADO</div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: m.pendingAction.type === 'in' ? 'var(--green)' : 'var(--red)', fontFamily: 'var(--mono)' }}>
                          {m.pendingAction.type === 'in' ? '+' : '-'} {fmt(m.pendingAction.value)}
                        </span>
                        <span style={{ fontSize: '13px', color: 'var(--text2)' }}>· {m.pendingAction.description}</span>
                        <span className={`badge badge-${m.pendingAction.type === 'in' ? 'green' : 'red'}`} style={{ fontSize: '10px' }}>{m.pendingAction.category}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => launchAction(m, i)}
                          disabled={launching === i}
                          style={{ background: 'var(--green-dim)', border: '1px solid var(--green-border)', color: 'var(--green)', padding: '7px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: launching === i ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: launching === i ? 0.6 : 1 }}
                        >
                          {launching === i ? 'Lançando...' : '✓ Confirmar lançamento'}
                        </button>
                        <button
                          onClick={() => setAiMessages((prev: AiMessage[]) => prev.map((x, j) => j === i ? { ...x, pendingAction: undefined } : x))}
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--card-border)', color: 'var(--text3)', padding: '7px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}
                        >
                          Ignorar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {aiTyping && (
              <div className="msg msg-ai">
                <div className="msg-avatar">🤖</div>
                <div className="msg-bubble" style={{ padding: '14px 18px' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sugestões */}
          <div className="ai-suggestions" style={{ flexShrink: 0 }}>
            {AI_SUGGESTIONS.map(s => (
              <button key={s} className="ai-sug" onClick={() => sendAI(s)}>{s}</button>
            ))}
          </div>

          {/* Input */}
          <div className="chat-input-wrap" style={{ flexDirection: 'column', gap: '8px', flexShrink: 0 }}>

            {/* Preview da imagem anexada */}
            {localImage && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '8px' }}>
                <img src={localImage} alt="preview" style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--card-border)' }} />
                <span style={{ fontSize: '12px', color: 'var(--green)', flex: 1 }}>Imagem pronta para análise</span>
                <button onClick={() => { setLocalImage(null); setImageBase64(null) }} style={{ background: 'transparent', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '18px', padding: 0, lineHeight: 1 }}>×</button>
              </div>
            )}

            {/* Input row */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) handleFile(file)
                  e.target.value = ''
                }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Enviar foto de nota, conta ou recibo"
                style={{ background: localImage ? 'var(--green-dim)' : 'rgba(255,255,255,0.05)', border: localImage ? '1px solid var(--green-border)' : '1px solid var(--card-border)', color: localImage ? 'var(--green)' : 'var(--text2)', padding: '10px 12px', borderRadius: '10px', cursor: 'pointer', fontSize: '16px', flexShrink: 0 }}
              >
                📎
              </button>
              <input
                className="chat-input"
                value={localInput}
                onChange={e => setLocalInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendAI()}
                placeholder="Pergunte qualquer coisa ou envie foto de uma nota..."
              />
              <button
                className="chat-send"
                onClick={() => sendAI()}
                disabled={aiTyping}
                style={{ opacity: aiTyping ? 0.5 : 1 }}
              >
                {aiTyping ? '...' : 'Enviar →'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

        {/* Insight do mês */}
        <div className="card card-green">
          <div className="card-title">💡 INSIGHT DO MÊS</div>
          <div style={{ fontSize: '14px', lineHeight: '1.6', marginTop: '6px' }}>
            {parseFloat(margem) >= 60
              ? `Margem de ${margem}% — excelente! Você está acima da média do mercado.`
              : parseFloat(margem) >= 40
              ? `Margem de ${margem}% — dentro da média. Tente chegar a 60%.`
              : `Margem de ${margem}% — abaixo do ideal. Revise suas despesas.`}
          </div>
        </div>

        {/* Resumo rápido */}
        <div className="card">
          <div className="card-title">📊 RESUMO RÁPIDO</div>
          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              ['Receita do mês',    fmt(stats.monthRevenueNet  ?? stats.monthRevenue),  'var(--green)'],
              ['Despesas',          fmt(stats.monthExpensesNet ?? stats.monthExpenses), 'var(--red)'],
              ['Lucro real',        fmt(stats.monthProfitNet   ?? stats.monthProfit),   '#6ee7b7'],
              ['Clientes',          `${clients.length}`,                                'var(--text)'],
              ['Cobranças abertas', `${pendingReceivables.length} · ${fmt(pendingValue)}`, pendingReceivables.length > 0 ? 'var(--amber)' : 'var(--green)'],
              ['Limite MEI usado',  `${pctLimit}%`,                                     limitColor],
            ].map(([l, v, c], i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: 'var(--text3)' }}>{l}</span>
                <span style={{ fontWeight: 700, fontFamily: 'var(--mono)', color: c as string }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Como usar */}
        <div className="card" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
          <div className="card-title">💬 COMO USAR</div>
          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--text2)', lineHeight: '1.6' }}>
            <div>💬 Escreva em linguagem natural</div>
            <div>📸 Envie foto de notas, contas e recibos</div>
            <div>⚡ A IA extrai valor e descrição automaticamente</div>
            <div>✓ Confirme para lançar direto no sistema</div>
          </div>
        </div>
      </div>
    </div>
  )
}
