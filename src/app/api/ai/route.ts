import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message, imageBase64, imageMediaType, financialContext } = body

    // ── Monta system prompt com contexto financeiro real do usuário ──────────
    const systemPrompt = `Você é a IA financeira do MEI 360 OS — assistente pessoal de negócios do ${financialContext.userName} (${financialContext.userBiz}).

DADOS FINANCEIROS ATUAIS DO USUÁRIO:
- Receita do mês: ${financialContext.monthRevenue}
- Despesas do mês: ${financialContext.monthExpenses}
- Lucro líquido: ${financialContext.monthProfit}
- Faturamento anual: ${financialContext.yearRevenue} (${financialContext.pctLimit}% do limite MEI de R$81.000)
- Clientes cadastrados: ${financialContext.clientCount}
- Margem de lucro: ${financialContext.margem}%
- Cobranças pendentes: ${financialContext.pendingReceivables} (total: ${financialContext.pendingReceivablesValue})
- Top cliente: ${financialContext.topClient}

REGRAS DE COMPORTAMENTO:
1. Responda sempre em português brasileiro, de forma direta, prática e amigável
2. Use os dados reais acima para responder perguntas financeiras — nunca invente números
3. Quando receber IMAGEM de nota, conta, recibo, boleto ou comprovante:
   - Extraia: tipo do documento, valor total, descrição do serviço/produto, data de vencimento ou emissão
   - Classifique automaticamente como entrada (serviço prestado, pagamento recebido) ou saída (conta, despesa, fornecedor)
   - Informe o que encontrou de forma clara antes de sugerir o lançamento
4. Quando o usuário mencionar que recebeu ou pagou algo (mesmo sem imagem), sugira lançar
5. Ao final da resposta, SE houver transação para lançar, inclua EXATAMENTE esta linha:
   ACTION:{"type":"in_or_out","value":0.00,"description":"descricao curta","category":"categoria"}
   Categorias válidas: Serviço, Produto, Fornecedor, Imposto, Fixo, Equipamento, Pessoal, Alimentação, Transporte, Outros
6. Se NÃO houver transação, NUNCA inclua a linha ACTION
7. Seja conciso — respostas curtas e diretas são melhores

EXEMPLOS DE ACTION:
- Conta de energia R$187: ACTION:{"type":"out","value":187.00,"description":"Energia elétrica","category":"Fixo"}
- Pix recebido R$350: ACTION:{"type":"in","value":350.00,"description":"Serviço recebido via Pix","category":"Serviço"}
- Nota fiscal fornecedor R$230: ACTION:{"type":"out","value":230.00,"description":"Material de fornecedor","category":"Fornecedor"}`

    // ── Monta conteúdo da mensagem (texto + imagem opcional) ─────────────────
    const userContent: Anthropic.MessageParam['content'] = []

    if (imageBase64 && imageMediaType) {
      userContent.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: imageMediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
          data: imageBase64,
        },
      })
    }

    userContent.push({
      type: 'text',
      text: message || 'Analise esta imagem e extraia os dados financeiros (valor, descrição, tipo). Sugira como lançar.',
    })

    // ── Chama Claude ─────────────────────────────────────────────────────────
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userContent }],
    })

    const rawText = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map(b => b.text)
      .join('')

    // ── Extrai ACTION se existir ──────────────────────────────────────────────
    const actionMatch = rawText.match(/ACTION:(\{[^\r\n]+\})/)
    let pendingAction = null
    let cleanText = rawText

    if (actionMatch) {
      try {
        pendingAction = JSON.parse(actionMatch[1])
        // Remove a linha ACTION do texto visível
        cleanText = rawText.substring(0, rawText.lastIndexOf('\nACTION:')).trim()
        if (cleanText === rawText) {
          cleanText = rawText.replace(/ACTION:\{[^\r\n]+\}/, '').trim()
        }
      } catch { /* mantém texto original se JSON inválido */ }
    }

    return NextResponse.json({ text: cleanText, pendingAction })

    } catch (err) {
      const error = err as any
      console.error('[/api/ai] error:', error)
      return NextResponse.json(
        { text: null, error: error?.message || 'Erro interno' },
        { status: 500 }
      )
    }
}
