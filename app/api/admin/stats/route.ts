import { requireAdmin, handleAuthError } from '@/lib/auth'
import { createSupabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  try {
    await requireAdmin()
    const db = await createSupabaseAdmin()

    const { count: totalUsers } = await db.from('profiles').select('*', { count: 'exact', head: true })

    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()
    const todayStart = new Date(); todayStart.setHours(0,0,0,0)

    const { count: active7d } = await db.from('profiles').select('*', { count: 'exact', head: true }).gte('updated_at', sevenDaysAgo)
    const { count: messagesToday } = await db.from('messages').select('*', { count: 'exact', head: true }).gte('created_at', todayStart.toISOString())
    const { count: messagesWeek } = await db.from('messages').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo)

    const { data: planData } = await db.from('profiles').select('plan')
    const plans: Record<string, number> = {}
    for (const p of planData || []) { plans[p.plan] = (plans[p.plan] || 0) + 1 }

    const { count: activeSubs } = await db.from('profiles').select('*', { count: 'exact', head: true }).eq('plan_status', 'active')
    const { count: triageEvents } = await db.from('triage_records').select('*', { count: 'exact', head: true })
    const { count: sosSessions } = await db.from('sos_sessions').select('*', { count: 'exact', head: true })

    const starterCount = plans['starter'] || 0
    const coupleCount = plans['couple'] || 0
    const mrrEstimate = starterCount * 100 + coupleCount * 150

    return Response.json({
      total_users: totalUsers || 0,
      active_7d: active7d || 0,
      messages_today: messagesToday || 0,
      messages_week: messagesWeek || 0,
      plans,
      active_subscriptions: activeSubs || 0,
      triage_events: triageEvents || 0,
      sos_sessions: sosSessions || 0,
      mrr_estimate: mrrEstimate,
    })
  } catch (err) {
    return handleAuthError(err)
  }
}
