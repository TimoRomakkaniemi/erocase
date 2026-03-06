import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { event: string; properties?: Record<string, unknown> }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { event, properties } = body
  if (!event || typeof event !== 'string' || event.trim().length === 0) {
    return NextResponse.json({ error: 'event is required' }, { status: 400 })
  }

  const admin = await createSupabaseAdmin()
  const { error } = await admin.from('analytics_events').insert({
    user_id: user.id,
    event: event.trim(),
    properties: properties ?? {},
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
