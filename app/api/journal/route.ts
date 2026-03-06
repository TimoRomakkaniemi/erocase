import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServer()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
  const moodScore = searchParams.get('mood_score')
  const mode = searchParams.get('mode')
  const offset = (page - 1) * limit

  let query = supabase
    .from('journal_entries')
    .select('id, user_id, conversation_id, content, mood_score, mode, auto_delete_at, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (moodScore != null && moodScore !== '') {
    const score = parseInt(moodScore, 10)
    if (!isNaN(score) && score >= 0 && score <= 10) {
      query = query.eq('mood_score', score)
    }
  }
  if (mode != null && mode !== '') {
    query = query.eq('mode', mode)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ entries: data })
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { content: string; mood_score?: number; mode?: string; conversation_id?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { content, mood_score, mode, conversation_id } = body
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return NextResponse.json({ error: 'content is required' }, { status: 400 })
  }

  let auto_delete_at: string | null = null

  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('auto_delete_days')
    .eq('user_id', user.id)
    .single()

  const autoDeleteDays = prefs?.auto_delete_days ?? 0
  if (autoDeleteDays > 0) {
    const d = new Date()
    d.setDate(d.getDate() + autoDeleteDays)
    auto_delete_at = d.toISOString()
  }

  const { data, error } = await supabase
    .from('journal_entries')
    .insert({
      user_id: user.id,
      conversation_id: conversation_id || null,
      content: content.trim(),
      mood_score: mood_score != null && mood_score >= 0 && mood_score <= 10 ? mood_score : null,
      mode: mode || null,
      auto_delete_at,
    })
    .select('id, user_id, conversation_id, content, mood_score, mode, auto_delete_at, created_at')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest) {
  const supabase = await createSupabaseServer()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = request.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createSupabaseServer()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = request.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  let body: { content?: string; mood_score?: number }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}
  if (typeof body.content === 'string' && body.content.trim().length > 0) {
    updates.content = body.content.trim()
  }
  if (body.mood_score != null && body.mood_score >= 0 && body.mood_score <= 10) {
    updates.mood_score = body.mood_score
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid updates' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('journal_entries')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select('id, user_id, conversation_id, content, mood_score, mode, auto_delete_at, created_at')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
