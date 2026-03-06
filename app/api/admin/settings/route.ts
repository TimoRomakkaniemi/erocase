import { requireAdmin, handleAuthError } from '@/lib/auth'
import { createSupabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  try {
    await requireAdmin()
    const db = await createSupabaseAdmin()

    const { data } = await db.from('system_settings').select('key, value')

    const settings: Record<string, unknown> = {}
    for (const row of data || []) {
      settings[row.key] = row.value
    }

    return Response.json({ settings })
  } catch (err) {
    return handleAuthError(err)
  }
}

export async function PATCH(request: Request) {
  try {
    const { user } = await requireAdmin()
    const db = await createSupabaseAdmin()
    const body = await request.json()

    if (!body.key || body.value === undefined) {
      return Response.json({ error: 'Missing key or value' }, { status: 400 })
    }

    const { data, error } = await db.from('system_settings')
      .upsert({
        key: body.key,
        value: body.value,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .select()
      .single()

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ setting: data })
  } catch (err) {
    return handleAuthError(err)
  }
}
