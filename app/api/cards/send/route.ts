import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'
import { trackEventServer } from '@/lib/analytics-server'

async function checkDvLock(supabase: Awaited<ReturnType<typeof createSupabaseServer>>, userId: string, spaceId: string) {
  const { data } = await supabase
    .from('dv_locks')
    .select('id')
    .eq('user_id', userId)
    .eq('space_id', spaceId)
    .eq('is_active', true)
    .maybeSingle()
  return !!data
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: {
    space_id: string
    source_journal_id?: string
    original_content: string
    safe_content: string
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { space_id, source_journal_id, original_content, safe_content } = body
  if (!space_id || !original_content || !safe_content) {
    return NextResponse.json({
      error: 'space_id, original_content and safe_content are required',
    }, { status: 400 })
  }

  const locked = await checkDvLock(supabase, user.id, space_id)
  if (locked) {
    return NextResponse.json({
      error: 'DV_LOCK',
      message: 'Shared space actions are temporarily unavailable',
    }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('share_cards')
    .insert({
      sender_id: user.id,
      space_id,
      source_journal_id: source_journal_id || null,
      original_content: original_content.trim(),
      safe_content: safe_content.trim(),
      status: 'sent',
    })
    .select('id, sender_id, space_id, source_journal_id, safe_content, status, created_at')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  trackEventServer(user.id, 'share_card_sent', { space_id }).catch(() => {})
  return NextResponse.json(data)
}

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

  const { data: cards, error } = await supabase
    .from('share_cards')
    .select('id, sender_id, space_id, source_journal_id, safe_content, status, reply_conversation_id, revoked_at, created_at')
    .eq('space_id', spaceId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const senderIds = [...new Set((cards ?? []).map((c: { sender_id: string }) => c.sender_id))]
  const names: Record<string, string> = {}
  if (senderIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name')
      .in('id', senderIds)
    for (const p of profiles ?? []) {
      names[p.id] = p.display_name || ''
    }
  }

  const cardsWithNames = (cards ?? []).map((c: Record<string, unknown> & { sender_id: string }) => ({
    ...c,
    sender_name: names[c.sender_id] || null,
  }))

  return NextResponse.json({ cards: cardsWithNames })
}
