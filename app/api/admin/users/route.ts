import { requireAdmin, handleAuthError } from '@/lib/auth'
import { createSupabaseAdmin } from '@/lib/supabase-server'

export async function GET(request: Request) {
  try {
    await requireAdmin()
    const db = await createSupabaseAdmin()
    const url = new URL(request.url)

    const search = url.searchParams.get('search') || ''
    const plan = url.searchParams.get('plan') || ''
    const role = url.searchParams.get('role') || ''
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    let query = db.from('profiles').select('id, email, display_name, role, plan, plan_status, disabled, created_at, updated_at, country_code', { count: 'exact' })

    if (search) query = query.or(`email.ilike.%${search}%,display_name.ilike.%${search}%`)
    if (plan) query = query.eq('plan', plan)
    if (role) query = query.eq('role', role)

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)

    const { data, count, error } = await query

    if (error) return Response.json({ error: error.message }, { status: 500 })

    return Response.json({ users: data || [], total: count || 0, page, limit })
  } catch (err) {
    return handleAuthError(err)
  }
}
