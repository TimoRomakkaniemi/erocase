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

  const { data: tasks, error } = await supabase
    .from('shared_tasks')
    .select('id, space_id, created_by, title, description, status, due_date, created_at, updated_at')
    .eq('space_id', spaceId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const creatorIds = [...new Set((tasks ?? []).map((t: { created_by: string }) => t.created_by))]
  const names: Record<string, string> = {}
  if (creatorIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name')
      .in('id', creatorIds)
    for (const p of profiles ?? []) {
      names[p.id] = p.display_name || ''
    }
  }

  const tasksWithNames = (tasks ?? []).map((t: Record<string, unknown> & { created_by: string }) => ({
    ...t,
    created_by_name: names[t.created_by] || null,
  }))

  return NextResponse.json({
    tasks: tasksWithNames,
    current_user_id: user.id,
  })
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { space_id: string; title: string; description?: string; due_date?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { space_id, title, description, due_date } = body
  if (!space_id || !title || typeof title !== 'string' || title.trim().length === 0) {
    return NextResponse.json({ error: 'space_id and title are required' }, { status: 400 })
  }

  const locked = await checkDvLock(supabase, user.id, space_id)
  if (locked) {
    return NextResponse.json({ error: 'DV_LOCK', message: 'Shared space actions are temporarily unavailable' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('shared_tasks')
    .insert({
      space_id,
      created_by: user.id,
      title: title.trim(),
      description: description?.trim() || null,
      due_date: due_date || null,
      status: 'open',
    })
    .select('id, space_id, created_by, title, description, status, due_date, created_at, updated_at')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
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

  let body: { status: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { status } = body
  if (!status || !['open', 'in_progress', 'completed'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const { data: task } = await supabase
    .from('shared_tasks')
    .select('space_id')
    .eq('id', id)
    .single()

  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  const locked = await checkDvLock(supabase, user.id, task.space_id)
  if (locked) {
    return NextResponse.json({ error: 'DV_LOCK', message: 'Shared space actions are temporarily unavailable' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('shared_tasks')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, space_id, created_by, title, description, status, due_date, created_at, updated_at')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (status === 'completed') {
    trackEventServer(user.id, 'shared_task_completed', { task_id: id }).catch(() => {})
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

  const { data: task, error: fetchError } = await supabase
    .from('shared_tasks')
    .select('created_by')
    .eq('id', id)
    .single()

  if (fetchError || !task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  if (task.created_by !== user.id) {
    return NextResponse.json({ error: 'Only the creator can delete this task' }, { status: 403 })
  }

  const { error } = await supabase.from('shared_tasks').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
