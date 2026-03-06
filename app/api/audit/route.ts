import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'
import { trackEventServer } from '@/lib/analytics-server'

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServer()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))
  const action = searchParams.get('action')
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  let query = supabase
    .from('audit_trail')
    .select('id, action, resource_type, resource_id, target_user_id, metadata, created_at', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (action) {
    query = query.eq('action', action)
  }
  if (from) {
    query = query.gte('created_at', from)
  }
  if (to) {
    query = query.lte('created_at', to + 'T23:59:59.999Z')
  }

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  trackEventServer(user.id, 'audit_viewed', { page, limit }).catch(() => {})

  return NextResponse.json({
    events: data ?? [],
    total: count ?? 0,
    page,
    limit,
  })
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { action: string; resource_type: string; resource_id?: string; target_user_id?: string; metadata?: Record<string, unknown> }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const validActions = ['share', 'view', 'revoke', 'export', 'delete', 'consent', 'dv_lock', 'dv_unlock']
  const validResourceTypes = ['share_card', 'check_in', 'joint_summary', 'journal', 'task', 'profile', 'conversation', 'space']

  if (!body.action || !validActions.includes(body.action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }
  if (!body.resource_type || !validResourceTypes.includes(body.resource_type)) {
    return NextResponse.json({ error: 'Invalid resource_type' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('audit_trail')
    .insert({
      user_id: user.id,
      action: body.action,
      resource_type: body.resource_type,
      resource_id: body.resource_id ?? null,
      target_user_id: body.target_user_id ?? null,
      metadata: body.metadata ?? {},
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
