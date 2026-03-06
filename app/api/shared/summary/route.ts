import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'
import { trackEventServer } from '@/lib/analytics-server'

const GOOGLE_API_KEY = process.env.GOOGLE_AI_STUDIO_KEY!

const SYSTEM_PROMPT = `Create a neutral joint summary. Do NOT take sides. Do NOT diagnose. Write neutrally.`

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServer()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const spaceId = request.nextUrl.searchParams.get('space_id')
  if (!spaceId) {
    return NextResponse.json({ error: 'space_id is required' }, { status: 400 })
  }

  const { data: summary, error } = await supabase
    .from('joint_summaries')
    .select('id, space_id, content, generation_mode, consent_a, consent_b, revoked_by, revoked_at, created_at')
    .eq('space_id', spaceId)
    .is('revoked_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  trackEventServer(user.id, 'joint_summary_viewed', { space_id: spaceId }).catch(() => {})

  const { data: members } = await supabase
    .from('shared_space_members')
    .select('user_id')
    .eq('space_id', spaceId)
    .order('joined_at', { ascending: true })

  const memberA = members?.[0]?.user_id
  const memberB = members?.[1]?.user_id
  const isA = user.id === memberA
  const isB = user.id === memberB

  return NextResponse.json({
    summary: summary
      ? {
          id: summary.id,
          content: summary.content,
          generation_mode: summary.generation_mode,
          consent_a: summary.consent_a,
          consent_b: summary.consent_b,
          revoked_at: summary.revoked_at,
          created_at: summary.created_at,
        }
      : null,
    current_user_consented: isA ? summary?.consent_a : isB ? summary?.consent_b : false,
    partner_consented: isA ? summary?.consent_b : isB ? summary?.consent_a : false,
    can_generate: summary?.consent_a && summary?.consent_b,
  })
}

const PENDING_PLACEHOLDER = '[Pending consent]'

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!GOOGLE_API_KEY) {
    return NextResponse.json({ error: 'AI not configured' }, { status: 500 })
  }

  let body: { space_id: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { space_id } = body
  if (!space_id) {
    return NextResponse.json({ error: 'space_id is required' }, { status: 400 })
  }

  const { data: members } = await supabase
    .from('shared_space_members')
    .select('user_id')
    .eq('space_id', space_id)
    .order('joined_at', { ascending: true })

  const memberIds = (members ?? []).map((m: { user_id: string }) => m.user_id)
  if (memberIds.length < 2) {
    return NextResponse.json({ error: 'Space must have 2 members' }, { status: 400 })
  }

  const memberA = memberIds[0]
  const memberB = memberIds[1]
  const isA = user.id === memberA
  const isB = user.id === memberB
  if (!isA && !isB) {
    return NextResponse.json({ error: 'Not a member of this space' }, { status: 403 })
  }

  const date = new Date().toISOString().slice(0, 10)
  const startOfDay = `${date}T00:00:00.000Z`
  const endOfDay = `${date}T23:59:59.999Z`

  const { data: existing } = await supabase
    .from('joint_summaries')
    .select('id, content, consent_a, consent_b')
    .eq('space_id', space_id)
    .gte('created_at', startOfDay)
    .lte('created_at', endOfDay)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existing && existing.content !== PENDING_PLACEHOLDER) {
    return NextResponse.json(existing)
  }

  if (existing && existing.content === PENDING_PLACEHOLDER) {
    const consentA = isA ? true : existing.consent_a
    const consentB = isB ? true : existing.consent_b

    if (!consentA || !consentB) {
      const { data: updated, error: updateErr } = await supabase
        .from('joint_summaries')
        .update({ consent_a: consentA, consent_b: consentB })
        .eq('id', existing.id)
        .select('id, content, consent_a, consent_b')
        .single()
      if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })
      return NextResponse.json({
        ...updated,
        status: 'pending',
        message: 'Waiting for partner to consent',
      })
    }

    const [{ data: checkIns }, { data: tasks }] = await Promise.all([
      supabase
        .from('check_ins')
        .select('user_id, score, word')
        .eq('space_id', space_id)
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay)
        .eq('is_shared', true),
      supabase
        .from('shared_tasks')
        .select('title, status')
        .eq('space_id', space_id)
        .order('updated_at', { ascending: false })
        .limit(10),
    ])

    const checkInText = (checkIns ?? [])
      .map((c: { user_id: string; score: number; word: string }) => {
        const who = c.user_id === memberA ? 'A' : 'B'
        return `User ${who}: score ${c.score}/10, word: ${c.word}`
      })
      .join('\n')
    const taskText = (tasks ?? [])
      .map((t: { title: string; status: string }) => `- ${t.title} (${t.status})`)
      .join('\n')
    const prompt = `Today's shared check-ins:\n${checkInText || 'None'}\n\nRecent shared tasks:\n${taskText || 'None'}\n\nCreate a brief neutral joint summary (2-4 sentences).`

    const geminiBody = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      generationConfig: { temperature: 0.5, maxOutputTokens: 256 },
    }
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_API_KEY}`
    const res = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiBody),
    })
    if (!res.ok) {
      const errText = await res.text()
      return NextResponse.json({ error: 'AI generation failed', details: errText }, { status: 502 })
    }
    const data = await res.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
    if (!content) return NextResponse.json({ error: 'No content from AI' }, { status: 502 })

    const { data: final, error: finalErr } = await supabase
      .from('joint_summaries')
      .update({ content })
      .eq('id', existing.id)
      .select('id, space_id, content, generation_mode, created_at')
      .single()
    if (finalErr) return NextResponse.json({ error: finalErr.message }, { status: 500 })
    return NextResponse.json(final)
  }

  const { data: inserted, error } = await supabase
    .from('joint_summaries')
    .insert({
      space_id,
      content: PENDING_PLACEHOLDER,
      generation_mode: 'consent',
      consent_a: isA,
      consent_b: isB,
    })
    .select('id, space_id, content, consent_a, consent_b, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    ...inserted,
    status: 'pending',
    message: inserted.consent_a && inserted.consent_b ? 'Generating...' : 'Waiting for partner to consent',
  })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createSupabaseServer()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { summary_id: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { summary_id } = body
  if (!summary_id) {
    return NextResponse.json({ error: 'summary_id is required' }, { status: 400 })
  }

  const { data: summary, error: fetchErr } = await supabase
    .from('joint_summaries')
    .select('space_id, revoked_at')
    .eq('id', summary_id)
    .single()

  if (fetchErr || !summary) {
    return NextResponse.json({ error: 'Summary not found' }, { status: 404 })
  }

  const { data: members } = await supabase
    .from('shared_space_members')
    .select('user_id')
    .eq('space_id', summary.space_id)

  const isMember = (members ?? []).some((m: { user_id: string }) => m.user_id === user.id)
  if (!isMember) {
    return NextResponse.json({ error: 'Not a member of this space' }, { status: 403 })
  }

  if (summary.revoked_at) {
    return NextResponse.json({ error: 'Summary already revoked' }, { status: 400 })
  }

  const { error } = await supabase
    .from('joint_summaries')
    .update({ revoked_by: user.id, revoked_at: new Date().toISOString() })
    .eq('id', summary_id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
