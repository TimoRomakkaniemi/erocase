import { requireAdmin, handleAuthError } from '@/lib/auth'
import { createSupabaseAdmin } from '@/lib/supabase-server'

export async function GET(request: Request) {
  try {
    await requireAdmin()
    const db = await createSupabaseAdmin()
    const url = new URL(request.url)
    const status = url.searchParams.get('status') || ''
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = 30
    const offset = (page - 1) * limit

    let query = db.from('triage_records').select('*, profiles!triage_records_user_id_fkey(email, display_name)', { count: 'exact' })

    if (status) query = query.eq('status', status)
    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)

    const { data, count, error } = await query
    if (error) {
      const fallback = db.from('triage_records').select('*', { count: 'exact' })
      if (status) fallback.eq('status', status)
      const { data: fbData, count: fbCount } = await fallback.order('created_at', { ascending: false }).range(offset, offset + limit - 1)
      return Response.json({ records: fbData || [], total: fbCount || 0, page })
    }

    const { data: dvLocks } = await db.from('dv_locks').select('*').order('created_at', { ascending: false }).limit(20)

    return Response.json({ records: data || [], total: count || 0, page, dv_locks: dvLocks || [] })
  } catch (err) {
    return handleAuthError(err)
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin()
    const db = await createSupabaseAdmin()
    const body = await request.json()

    if (!body.id) return Response.json({ error: 'Missing id' }, { status: 400 })

    const { data, error } = await db.from('triage_records')
      .update({ status: body.status || 'resolved', resolved_at: new Date().toISOString() })
      .eq('id', body.id)
      .select()
      .single()

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ record: data })
  } catch (err) {
    return handleAuthError(err)
  }
}
