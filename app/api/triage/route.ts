import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase-server'
import { trackEventServer } from '@/lib/analytics-server'

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: {
    action?: 'dv_lock' | 'dv_unlock'
    trigger_type?: 'self_harm' | 'dv' | 'crisis' | 'high_intensity'
    intensity_score?: number
    action_taken?: string
    space_id?: string
    lock_id?: string
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { action } = body

  // DV Lock
  if (action === 'dv_lock') {
    const { space_id } = body
    if (!space_id) {
      return NextResponse.json({ error: 'space_id required for dv_lock' }, { status: 400 })
    }
    const { data, error } = await supabase
      .from('dv_locks')
      .insert({
        user_id: user.id,
        space_id,
        is_active: true,
      })
      .select('id')
      .single()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    trackEventServer(user.id, 'dv_lock_triggered', { space_id }).catch(() => {})
    return NextResponse.json({ lock_id: data.id })
  }

  // DV Unlock
  if (action === 'dv_unlock') {
    const { lock_id } = body
    if (!lock_id) {
      return NextResponse.json({ error: 'lock_id required for dv_unlock' }, { status: 400 })
    }
    const { error } = await supabase
      .from('dv_locks')
      .update({ is_active: false, unlocked_at: new Date().toISOString() })
      .eq('id', lock_id)
      .eq('user_id', user.id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  }

  // Log triage record
  const { trigger_type, intensity_score, action_taken } = body
  if (!trigger_type || !['self_harm', 'dv', 'crisis', 'high_intensity'].includes(trigger_type)) {
    return NextResponse.json({ error: 'trigger_type required' }, { status: 400 })
  }

  const admin = await createSupabaseAdmin()
  const { error } = await admin.from('triage_records').insert({
    user_id: user.id,
    trigger_type,
    intensity_score: intensity_score ?? null,
    action_taken: action_taken ?? null,
    resolved: false,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  trackEventServer(user.id, 'triage_triggered', { type: trigger_type }).catch(() => {})
  if (action_taken === 'safe_exit') {
    trackEventServer(user.id, 'safe_exit_used', { type: trigger_type }).catch(() => {})
  }
  return NextResponse.json({ ok: true })
}

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServer()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const active = request.nextUrl.searchParams.get('active')
  if (active !== 'true') {
    return NextResponse.json({ error: '?active=true required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('dv_locks')
    .select('id, space_id, locked_at')
    .eq('user_id', user.id)
    .eq('is_active', true)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ locks: data ?? [] })
}
