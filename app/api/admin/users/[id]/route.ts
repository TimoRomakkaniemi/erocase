import { requireAdmin, handleAuthError } from '@/lib/auth'
import { createSupabaseAdmin } from '@/lib/supabase-server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const db = await createSupabaseAdmin()

    const { data: profile } = await db.from('profiles').select('*').eq('id', id).single()
    if (!profile) return Response.json({ error: 'Not found' }, { status: 404 })

    const { count: conversationCount } = await db.from('conversations').select('*', { count: 'exact', head: true }).eq('user_id', id)
    const { data: convIds } = await db.from('conversations').select('id').eq('user_id', id)
    let totalMessages = 0
    if (convIds && convIds.length > 0) {
      const { count } = await db.from('messages').select('*', { count: 'exact', head: true }).in('conversation_id', convIds.map(c => c.id))
      totalMessages = count || 0
    }

    const { data: sessions } = await db.from('ai_sessions').select('id, started_at, ended_at, billable_minutes, status').eq('user_id', id).order('started_at', { ascending: false }).limit(20)
    const { data: triageRecords } = await db.from('triage_records').select('*').eq('user_id', id).order('created_at', { ascending: false }).limit(10)
    const { data: ledger } = await db.from('ai_usage_ledger').select('*').eq('user_id', id).order('period_start', { ascending: false }).limit(5)
    const { data: modes } = await db.from('user_modes').select('mode').eq('user_id', id)

    return Response.json({
      profile,
      stats: {
        conversations: conversationCount || 0,
        messages: totalMessages,
        sessions: sessions || [],
        triage_records: triageRecords || [],
        ledger: ledger || [],
        modes: (modes || []).map(m => m.mode),
      }
    })
  } catch (err) {
    return handleAuthError(err)
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { profile: adminProfile } = await requireAdmin()
    const { id } = await params
    const body = await request.json()
    const db = await createSupabaseAdmin()

    const allowedFields = ['plan', 'plan_status', 'role', 'disabled', 'display_name', 'included_minutes_remaining']
    const updates: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) updates[field] = body[field]
    }

    if (updates.role && adminProfile.role !== 'superadmin') {
      return Response.json({ error: 'Only superadmin can change roles' }, { status: 403 })
    }

    if (Object.keys(updates).length === 0) {
      return Response.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    updates.updated_at = new Date().toISOString()

    const { data, error } = await db.from('profiles').update(updates).eq('id', id).select().single()
    if (error) return Response.json({ error: error.message }, { status: 500 })

    return Response.json({ profile: data })
  } catch (err) {
    return handleAuthError(err)
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { profile: adminProfile } = await requireAdmin()
    const { id } = await params

    if (adminProfile.role !== 'superadmin') {
      return Response.json({ error: 'Only superadmin can delete users' }, { status: 403 })
    }

    const { createClient } = await import('@supabase/supabase-js')
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const { error } = await supabaseAdmin.auth.admin.deleteUser(id)
    if (error) return Response.json({ error: error.message }, { status: 500 })

    return Response.json({ success: true })
  } catch (err) {
    return handleAuthError(err)
  }
}
