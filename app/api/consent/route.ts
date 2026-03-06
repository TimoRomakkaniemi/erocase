import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createSupabaseServer()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: memberships } = await supabase
    .from('shared_space_members')
    .select('space_id')
    .eq('user_id', user.id)

  const spaceIds = [...new Set((memberships ?? []).map((m: { space_id: string }) => m.space_id))]
  if (spaceIds.length === 0) {
    return NextResponse.json({ consents: [] })
  }

  const { data: consents, error } = await supabase
    .from('space_consents')
    .select('space_id, share_checkins, allow_joint_summary')
    .eq('user_id', user.id)
    .in('space_id', spaceIds)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const bySpace = (consents ?? []).reduce(
    (acc: Record<string, { share_checkins: boolean; allow_joint_summary: boolean }>, c) => {
      acc[c.space_id] = {
        share_checkins: c.share_checkins ?? true,
        allow_joint_summary: c.allow_joint_summary ?? true,
      }
      return acc
    },
    {}
  )

  return NextResponse.json({ consents: bySpace })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createSupabaseServer()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { space_id: string; share_checkins?: boolean; allow_joint_summary?: boolean }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.space_id) {
    return NextResponse.json({ error: 'space_id required' }, { status: 400 })
  }

  const { data: member } = await supabase
    .from('shared_space_members')
    .select('space_id')
    .eq('space_id', body.space_id)
    .eq('user_id', user.id)
    .single()

  if (!member) {
    return NextResponse.json({ error: 'Not a member of this space' }, { status: 403 })
  }

  const updates: Record<string, unknown> = {
    user_id: user.id,
    space_id: body.space_id,
    updated_at: new Date().toISOString(),
  }
  if (typeof body.share_checkins === 'boolean') updates.share_checkins = body.share_checkins
  if (typeof body.allow_joint_summary === 'boolean') updates.allow_joint_summary = body.allow_joint_summary

  const { data, error } = await supabase
    .from('space_consents')
    .upsert(updates, { onConflict: 'space_id,user_id' })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
