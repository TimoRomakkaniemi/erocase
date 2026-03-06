import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createSupabaseServer()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: memberships, error: memError } = await supabase
    .from('shared_space_members')
    .select('space_id')
    .eq('user_id', user.id)

  if (memError) {
    return NextResponse.json({ error: memError.message }, { status: 500 })
  }

  const spaceIds = [...new Set((memberships ?? []).map((m: { space_id: string }) => m.space_id))]
  if (spaceIds.length === 0) {
    return NextResponse.json({ spaces: [] })
  }

  const { data: spacesData, error: spacesError } = await supabase
    .from('shared_spaces')
    .select('id, type, status, created_at')
    .in('id', spaceIds)

  if (spacesError) {
    return NextResponse.json({ error: spacesError.message }, { status: 500 })
  }

  const { data: allMembers, error: membersError } = await supabase
    .from('shared_space_members')
    .select(`
      space_id,
      user_id,
      role,
      profiles:user_id (display_name, email)
    `)
    .in('space_id', spaceIds)

  if (membersError) {
    return NextResponse.json({ error: membersError.message }, { status: 500 })
  }

  const membersBySpace = ((allMembers ?? []) as { space_id: string; user_id: string; role: string; profiles?: { display_name?: string; email?: string } | { display_name?: string; email?: string }[] | null }[]).reduce(
    (acc: Record<string, { user_id: string; role: string; display_name?: string; email?: string }[]>, m) => {
      if (!acc[m.space_id]) acc[m.space_id] = []
      const p = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles
      acc[m.space_id].push({
        user_id: m.user_id,
        role: m.role,
        display_name: p?.display_name ?? undefined,
        email: p?.email ?? undefined,
      })
      return acc
    },
    {} as Record<string, { user_id: string; role: string; display_name?: string; email?: string }[]>
  )

  const spaces = (spacesData ?? []).map((s) => ({
    id: s.id,
    type: s.type,
    status: s.status,
    created_at: s.created_at,
    members: membersBySpace[s.id] ?? [],
  }))

  return NextResponse.json({ spaces })
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { type: 'partner' | 'friend' }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { type } = body
  if (!type || !['partner', 'friend'].includes(type)) {
    return NextResponse.json({ error: 'type must be partner or friend' }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from('shared_space_members')
    .select('space_id, shared_spaces!inner(type)')
    .eq('user_id', user.id)

  const existingTypes = (existing ?? []).map((e: { shared_spaces?: { type: string } | { type: string }[] }) => {
    const s = e.shared_spaces
    return Array.isArray(s) ? s[0]?.type : s?.type
  }).filter(Boolean) as string[]

  if (existingTypes.includes(type)) {
    return NextResponse.json(
      { error: `You already have a ${type} space. Max 1 partner + 1 friend per user.` },
      { status: 400 }
    )
  }

  const { data: space, error: insertError } = await supabase
    .from('shared_spaces')
    .insert({
      type,
      created_by: user.id,
      status: 'pending',
    })
    .select('id, invite_token')
    .single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  const { error: memberError } = await supabase
    .from('shared_space_members')
    .insert({
      space_id: space.id,
      user_id: user.id,
      role: 'creator',
    })

  if (memberError) {
    await supabase.from('shared_spaces').delete().eq('id', space.id)
    return NextResponse.json({ error: memberError.message }, { status: 500 })
  }

  return NextResponse.json({
    id: space.id,
    invite_token: space.invite_token,
  })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createSupabaseServer()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const spaceId = request.nextUrl.searchParams.get('space_id')
  if (!spaceId) {
    return NextResponse.json({ error: 'space_id required' }, { status: 400 })
  }

  let body: { status?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (body.status !== 'archived') {
    return NextResponse.json({ error: 'Only status=archived is supported' }, { status: 400 })
  }

  const { data: member } = await supabase
    .from('shared_space_members')
    .select('role')
    .eq('space_id', spaceId)
    .eq('user_id', user.id)
    .single()

  if (!member || member.role !== 'creator') {
    return NextResponse.json({ error: 'Only creator can archive' }, { status: 403 })
  }

  const { error } = await supabase
    .from('shared_spaces')
    .update({ status: 'archived' })
    .eq('id', spaceId)
    .eq('created_by', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
