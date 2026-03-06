import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'

const GOOGLE_API_KEY = process.env.GOOGLE_AI_STUDIO_KEY!

const SYSTEM_PROMPT = `Transform this personal journal entry into a safe, 1-3 sentence share card. Include: the feeling/state + need/boundary/request. Do NOT include: private details, blame, or accusations. Be neutral and constructive.`

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!GOOGLE_API_KEY) {
    return NextResponse.json({ error: 'Gemini API not configured' }, { status: 500 })
  }

  let body: { content: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { content } = body
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return NextResponse.json({ error: 'content is required' }, { status: 400 })
  }

  const geminiBody = {
    contents: [
      {
        role: 'user',
        parts: [{ text: content.trim() }],
      },
    ],
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT }],
    },
    generationConfig: {
      temperature: 0.5,
      maxOutputTokens: 256,
    },
  }

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_API_KEY}`

  const res = await fetch(geminiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(geminiBody),
  })

  if (!res.ok) {
    const errText = await res.text()
    return NextResponse.json(
      { error: 'Gemini request failed', details: errText },
      { status: 502 }
    )
  }

  const data = await res.json()
  const textPart = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!textPart) {
    return NextResponse.json({ error: 'No content in Gemini response' }, { status: 502 })
  }

  return NextResponse.json({ safe_content: textPart.trim() })
}
