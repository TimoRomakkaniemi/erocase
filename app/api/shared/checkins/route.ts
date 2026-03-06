import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServer()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const spaceId = request.nextUrl.searchParams.get('space_id')
  const dateParam = request.nextUrl.searchParams.get('date')
  if (!spaceId) {
    return NextResponse.json({ error: 'space_id is required' }, { status: 400 })
  }

  const date = dateParam || new Date().toISOString().slice(0, 10)
  const startOfDay = `${date}T00:00:00.000Z`
  const endOfDay = `${date}T23:59:59.999Z`

  const { data: members } = await supabase
    .from('shared_space_members')
    .select('user_id')
    .eq('space_id', spaceId)

  const memberIds = (members ?? []).map((m: { user_id: string }) => m.user_id)
  if (memberIds.length === 0) {
    return NextResponse.json({ mine: null, partner: null })
  }

  const { data: checkIns, error } = await supabase
    .from('check_ins')
    .select('id, user_id, score, word, is_shared, created_at')
    .eq('space_id', spaceId)
    .gte('created_at', startOfDay)
    .lte('created_at', endOfDay)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const mine = (checkIns ?? []).find((c: { user_id: string }) => c.user_id === user.id)
  const partnerIds = memberIds.filter((id) => id !== user.id)
  const partnerCheckIns = (checkIns ?? []).filter(
    (c: { user_id: string; is_shared: boolean }) =>
      partnerIds.includes(c.user_id) && c.is_shared
  )

  let partner: (typeof checkIns)[0] & { display_name?: string } | null = null
  if (mine && mine.is_shared && partnerCheckIns.length > 0) {
    partner = partnerCheckIns[0]
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', partner.user_id)
      .single()
    if (profile) {
      partner = { ...partner, display_name: profile.display_name ?? undefined }
    }
  }

  return NextResponse.json({
    mine: mine
      ? {
          id: mine.id,
          user_id: mine.user_id,
          score: mine.score,
          word: mine.word,
          is_shared: mine.is_shared,
          created_at: mine.created_at,
        }
      : null,
    partner,
  })
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { space_id: string; score: number; word: string; is_shared?: boolean }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { space_id, score, word, is_shared } = body
  if (!space_id || typeof score !== 'number' || !word || typeof word !== 'string') {
    return NextResponse.json({ error: 'space_id, score and word are required' }, { status: 400 })
  }
  if (score < 0 || score > 10) {
    return NextResponse.json({ error: 'score must be 0-10' }, { status: 400 })
  }

  const date = new Date().toISOString().slice(0, 10)
  const startOfDay = `${date}T00:00:00.000Z`
  const endOfDay = `${date}T23:59:59.999Z`

  const { data: existing } = await supabase
    .from('check_ins')
    .select('id')
    .eq('space_id', space_id)
    .eq('user_id', user.id)
    .gte('created_at', startOfDay)
    .lte('created_at', endOfDay)
    .maybeSingle()

  if (existing) {
    const { data: updated, error: updateError } = await supabase
      .from('check_ins')
      .update({ score, word: word.trim(), is_shared: is_shared ?? false })
      .eq('id', existing.id)
      .select('id, user_id, score, word, is_shared, created_at')
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }
    return NextResponse.json(updated)
  }

  const { data, error } = await supabase
    .from('check_ins')
    .insert({
      user_id: user.id,
      space_id,
      score,
      word: word.trim(),
      is_shared: is_shared ?? false,
    })
    .select('id, user_id, score, word, is_shared, created_at')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
