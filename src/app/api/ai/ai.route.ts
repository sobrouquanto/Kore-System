// src/app/api/ai/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { messages } = await request.json()

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ text: 'IA nao configurada. Fale com o suporte.' }, { status: 500 })
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('OpenAI error:', err)
      return NextResponse.json({ text: 'Erro na IA. Tente novamente.' })
    }

    const data = await res.json()
    const text = data.choices?.[0]?.message?.content || 'Nao consegui processar. Tente novamente.'
    return NextResponse.json({ text })
  } catch (err) {
    console.error('AI route error:', err)
    return NextResponse.json({ text: 'Erro interno.' })
  }
}