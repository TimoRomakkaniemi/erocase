import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  if (!token) {
    return NextResponse.json({ error: 'token required' }, { status: 400 })
  }

  // Use admin to bypass RLS - invite lookup is public for acceptance flow
  const supabase = await createSupabaseAdmin()
  const { data: space, error } = await supabase
    .from('shared_spaces')
    .select('id, type, status, invite_expires_at, created_by')
    .eq('invite_token', token)
    .single()

  if (error || !space) {
    return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
  }

  const now = new Date().toISOString()
  if (space.invite_expires_at && space.invite_expires_at < now) {
    return NextResponse.json({ error: 'Invite expired' }, { status: 410 })
  }

  let creatorName = 'Someone'
  if (space.created_by) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, email')
      .eq('id', space.created_by)
      .single()
    creatorName = profile?.display_name || profile?.email || 'Someone'
  }

  return NextResponse.json({
    space_id: space.id,
    type: space.type,
    status: space.status,
    creator_name: creatorName,
    expires_at: space.invite_expires_at,
  })
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { token: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { token } = body
  if (!token) {
    return NextResponse.json({ error: 'token required' }, { status: 400 })
  }

  const { data: space, error: spaceError } = await supabase
    .from('shared_spaces')
    .select('id, status, invite_expires_at')
    .eq('invite_token', token)
    .single()

  if (spaceError || !space) {
    return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
  }

  const now = new Date().toISOString()
  if (space.invite_expires_at && space.invite_expires_at < now) {
    return NextResponse.json({ error: 'Invite expired' }, { status: 410 })
  }

  if (space.status !== 'pending') {
    return NextResponse.json({ error: 'Space is no longer accepting invites' }, { status: 400 })
  }

  const { data: existingMembers, error: countError } = await supabase
    .from('shared_space_members')
    .select('id')
    .eq('space_id', space.id)

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 })
  }

  if ((existingMembers ?? []).length >= 2) {
    return NextResponse.json({ error: 'Space is full' }, { status: 400 })
  }

  const { data: myMembership } = await supabase
    .from('shared_space_members')
    .select('id')
    .eq('space_id', space.id)
    .eq('user_id', user.id)
    .single()

  if (myMembership) {
    return NextResponse.json({ error: 'Already a member' }, { status: 400 })
  }

  const { error: insertError } = await supabase
    .from('shared_space_members')
    .insert({
      space_id: space.id,
      user_id: user.id,
      role: 'member',
    })

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  const { error: updateError } = await supabase
    .from('shared_spaces')
    .update({ status: 'active' })
    .eq('id', space.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    space_id: space.id,
  })
}
