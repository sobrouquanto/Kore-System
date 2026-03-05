'use client'
import { useRef, useState } from 'react'
import { useDashboard, fmt, pctOf, AiMessage } from '@/context/DashboardContext'

const AI_SUGGESTIONS = [
  'Quanto posso retirar esse mês?',
  'Quando vou bater o limite do MEI?',
  'Qual meu cliente mais valioso?',
  'Minha margem está boa?',
]

export default function IATab() {
  const {
    user, userName, userBiz, stats, clients, chartData,
    aiMessages, setAiMessages, aiTyping, setAiTyping, chatRef,
    addTransaction,
  } = useDashboard()

  const [aiInput, setAiInput] = useState('')
  const inputRef = useRef('')
  const imageRef = useRef<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Local state via refs to avoid re-render loops
  const [localInput, setLocalInput] = useLocalState('')
  const [localImage, setLocalImage] = useLocalState<string | null>(null)

  const margem = pctOf(stats.monthProfit, stats.monthRevenue)
  const pctLimit = pctOf(stats.yearRevenue, 81000)
  const limitColor = parseFloat(pctLimit) > 80 ? 'var(--red)' : parseFloat(pctLimit) > 60 ? 'var(--amber)' : 'var(--green)'

  function buildFallbackResponse(msg: string): string {
    const q = msg.toLowerCase()
    const { monthRevenue, monthExpenses, monthProfit, yearRevenue } = stats
    const margemNum = monthRevenue > 0 ? ((monthProfit / monthRevenue) * 100).toFixed(0) : '0'
    const mesesLimit = monthRevenue > 0 ? Math.max(0, (81000 - yearRevenue) / monthRevenue).toFixed(1) : '?'
    const top = [...clients].sort((a, b) => b.total_revenue - a.total_revenue)[0]

    if (q.includes('retirar') || q.includes('sacar') || q.includes('prolabore') || q.includes('pró-labore'))
      return `Com lucro real de **${fmt(monthProfit)}** este mês, você pode retirar com tranquilidade **${fmt(monthProfit * 0.5)}** (50%) sem comprometer o negócio. 💚`
    if (q.includes('limite') || q.includes('mei'))
      return `Faturamento acumulado: **${fmt(yearRevenue)}** (${pctLimit}% do limite). No ritmo atual, você ainda tem **${mesesLimit} meses** antes de ultrapassar os R$81.000. 📊`
    if (q.includes('cliente') || q.includes('valioso'))
      return top ? `Seu cliente mais valioso é **${top.name}**. Você tem ${clients.length} clientes cadastrados. 🏆` : `Nenhum cliente cadastrado ainda. Vá até a aba Clientes e cadastre! 👥`
    if (q.includes('margem') || q.includes('lucro') || q.includes('saldo'))
      return `Sua margem é **${margemNum}%** — ${Number(margemNum) >= 50 ? 'excelente! Acima da média.' : 'há espaço para melhorar.'} Receita: ${fmt(monthRevenue)} | Despesas: ${fmt(monthExpenses)} | Lucro: ${fmt(monthProfit)}. 💡`
    if (q.includes('das') || q.includes('imposto'))
      return `O DAS vence todo dia 20 do mês. Valor estimado: R$71–77 dependendo da sua atividade. Não esqueça! ⚠️`
    return `Posso te ajudar com: margem de lucro, limite do MEI, quanto retirar, clientes valiosos ou despesas. O que quer saber? 🤖`
  }

  async function sendAI(text?: string) {
    const msg = text || localInput
    if (!msg.trim() && !localImage) return
    const userMsg: AiMessage = { role: 'user', text: msg, image: localImage || undefined }
    setAiMessages((prev: AiMessage[]) => [...prev, userMsg])
    setLocalInput('')
    setLocalImage(null)
    setAiTyping(true)

    try {
      const context = `Você é a IA financeira do MEI 360 OS, assistente pessoal de negócios do ${userName} (${userBiz}). Dados financeiros atuais: receita do mês ${fmt(stats.monthRevenue)}, despesas ${fmt(stats.monthExpenses)}, lucro ${fmt(stats.monthProfit)}, faturamento anual ${fmt(stats.yearRevenue)} (${pctLimit}% do limite MEI de R$81.000), ${clients.length} clientes cadastrados. Responda em português brasileiro, de forma direta, amigável e prática. Se receber imagem de nota ou recibo, extraia valor, descrição e data e sugira o lançamento.`
      const actionContext = context + '\n\nIMPORTANTE: Se o usuario mencionar que recebeu ou pagou algo, ou se a imagem contiver uma nota/recibo, além de responder normalmente, inclua ao final da sua resposta uma linha especial no formato exato:\nACTION:{"type":"in","value":123.45,"description":"descricao","category":"categoria"}\nCategorias validas: Servico, Produto, Aluguel, Imposto, Alimentacao, Transporte, Material, Fixo, Outros\nSe nao houver transacao para lancar, NAO inclua a linha ACTION.'

      const openAiMessages: any[] = [{ role: 'system', content: actionContext }]
      const userContent: any[] = []
      if (userMsg.image) userContent.push({ type: 'image_url', image_url: { url: userMsg.image } })
      userContent.push({ type: 'text', text: msg || 'Analise esta imagem e extraia os dados financeiros (valor, descricao, data).' })
      openAiMessages.push({ role: 'user', content: userContent })

      const res = await fetch('/api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: openAiMessages }) })
      const data = await res.json()
      let rawText = data.text || buildFallbackResponse(msg)

      const actionMatch = rawText.match(/ACTION:(\{[^\r\n]+\})/)
      let pendingAction: any = null
      if (actionMatch) {
        try {
          pendingAction = JSON.parse(actionMatch[1])
          const idx = rawText.lastIndexOf('\nACTION:')
          if (idx > -1) rawText = rawText.substring(0, idx).trim()
        } catch { /* ignore */ }
      }

      if (pendingAction) {
        const sign = pendingAction.type === 'in' ? '+' : '-'
        const actionMsg = rawText + '\n\n💡 Quer que eu lance isso automaticamente?\nValor: ' + sign + 'R$' + Number(pendingAction.value).toFixed(2).replace('.', ',') + ' - ' + pendingAction.description
        setAiMessages((prev: AiMessage[]) => [...prev, { role: 'ai', text: actionMsg, pendingAction }])
      } else {
        setAiMessages((prev: AiMessage[]) => [...prev, { role: 'ai', text: rawText }])
      }
    } catch {
      setAiMessages((prev: AiMessage[]) => [...prev, { role: 'ai', text: buildFallbackResponse(msg) }])
    }
    setAiTyping(false)
    setTimeout(() => chatRef.current?.scrollTo({ top: 99999, behavior: 'smooth' }), 100)
  }

  async function launchAction(msg: AiMessage, idx: number) {
    if (!msg.pendingAction) return
    const { type, value, description, category } = msg.pendingAction
    await addTransaction(description, value, type, category, new Date().toISOString().split('T')[0])
    setAiMessages((prev: AiMessage[]) => prev.map((m, i) => i === idx ? { ...m, pendingAction: undefined, text: m.text + ' ✅ Lançado!' } : m))
  }

  return (
    <div className="grid-21">
      <div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--green),var(--blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🤖</div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700 }}>IA Assistente MEI 360</div>
              <div style={{ fontSize: '12px', color: 'var(--green)' }}>● Online · Treinada com seus dados reais</div>
            </div>
          </div>

          {/* Messages */}
          <div className="chat-messages" ref={chatRef}>
            {aiMessages.map((m, i) => (
              <div key={i} className={`msg msg-${m.role}`}>
                {m.role === 'ai' && <div className="msg-avatar">🤖</div>}
                <div>
                  <div className="msg-bubble" dangerouslySetInnerHTML={{ __html: m.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
                  {m.pendingAction && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <button onClick={() => launchAction(m, i)} style={{ background: 'var(--green-dim)', border: '1px solid var(--green-border)', color: 'var(--green)', padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                        Sim, registrar agora
                      </button>
                      <button onClick={() => setAiMessages((prev: AiMessage[]) => prev.map((x, j) => j === i ? { ...x, pendingAction: undefined } : x))} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'var(--text3)', padding: '7px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>
                        Não, obrigado
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
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

          {/* Suggestions */}
          <div className="ai-suggestions">
            {AI_SUGGESTIONS.map(s => <button key={s} className="ai-sug" onClick={() => sendAI(s)}>{s}</button>)}
          </div>

          {/* Input */}
          <div className="chat-input-wrap" style={{ flexDirection: 'column', gap: '8px' }}>
            {localImage && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'var(--green-dim)', border: '1px solid var(--green-border)', borderRadius: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--green)' }}>📎 Imagem anexada</span>
                <button onClick={() => setLocalImage(null)} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: '16px' }}>×</button>
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={e => {
                const file = e.target.files?.[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = ev => {
                  setLocalImage(ev.target?.result as string)
                  setLocalInput('Analise esta imagem e me diga os dados financeiros (valor, descrição, data). Sugira como lançar.')
                }
                reader.readAsDataURL(file)
                e.target.value = ''
              }} />
              <button onClick={() => fileInputRef.current?.click()} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'var(--text2)', padding: '10px 12px', borderRadius: '10px', cursor: 'pointer', fontSize: '16px' }} title="Enviar foto de nota/recibo">📎</button>
              <input className="chat-input" value={localInput} onChange={e => setLocalInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendAI()} placeholder="Pergunte qualquer coisa ou envie foto de uma nota..." />
              <button className="chat-send" onClick={() => sendAI()}>Enviar →</button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div className="card card-green">
          <div className="card-title">💡 INSIGHT DO MÊS</div>
          <div style={{ fontSize: '14px', lineHeight: '1.6', marginTop: '6px' }}>
            {parseFloat(margem) >= 60 ? `Margem de ${margem}% — excelente! Você está acima da média do mercado.` : parseFloat(margem) >= 40 ? `Margem de ${margem}% — dentro da média. Tente chegar a 60%.` : `Margem de ${margem}% — abaixo do ideal. Revise suas despesas.`}
          </div>
        </div>
        <div className="card">
          <div className="card-title">📊 RESUMO RÁPIDO</div>
          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              ['Receita do mês', fmt(stats.monthRevenue), 'var(--green)'],
              ['Despesas', fmt(stats.monthExpenses), 'var(--red)'],
              ['Lucro real', fmt(stats.monthProfit), '#6ee7b7'],
              ['Clientes', `${clients.length}`, 'var(--text)'],
              ['Limite MEI usado', `${pctLimit}%`, limitColor],
            ].map(([l, v, c], i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: 'var(--text3)' }}>{l}</span>
                <span style={{ fontWeight: 700, fontFamily: 'var(--mono)', color: c }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
          <div className="card-title">💬 COMO USAR</div>
          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--text2)', lineHeight: '1.6' }}>
            <div>💬 Escreva em linguagem natural</div>
            <div>📸 Envie foto de notas e recibos</div>
            <div>⚡ Transações detectadas são lançadas automaticamente</div>
            <div>🎯 Use as sugestões rápidas acima</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Simple local state hook using useState
function useLocalState<T>(initial: T): [T, (v: T | ((prev: T) => T)) => void] {
  return useState(initial)
}
