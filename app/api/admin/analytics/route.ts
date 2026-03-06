import { requireAdmin, handleAuthError } from '@/lib/auth'
import { createSupabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  try {
    await requireAdmin()
    const db = await createSupabaseAdmin()

    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString()

    const { data: recentProfiles } = await db.from('profiles').select('created_at').gte('created_at', thirtyDaysAgo)
    const dailySignups = aggregateByDay(recentProfiles?.map(p => p.created_at) || [])

    const { data: recentMessages } = await db.from('messages').select('created_at').gte('created_at', thirtyDaysAgo).eq('role', 'user')
    const dailyMessages = aggregateByDay(recentMessages?.map(m => m.created_at) || [])

    const { data: modes } = await db.from('user_modes').select('mode')
    const modeDistribution: Record<string, number> = {}
    for (const m of modes || []) { modeDistribution[m.mode] = (modeDistribution[m.mode] || 0) + 1 }

    const { data: sosData } = await db.from('sos_sessions').select('mode')
    const sosByMode: Record<string, number> = {}
    for (const s of sosData || []) { sosByMode[s.mode] = (sosByMode[s.mode] || 0) + 1 }

    const { data: prefs } = await db.from('user_preferences').select('language')
    const langDist: Record<string, number> = {}
    for (const p of prefs || []) {
      const lang = (p as any).language || 'fi'
      langDist[lang] = (langDist[lang] || 0) + 1
    }

    return Response.json({
      daily_signups: dailySignups,
      daily_messages: dailyMessages,
      mode_distribution: modeDistribution,
      sos_by_mode: sosByMode,
      language_distribution: langDist,
    })
  } catch (err) {
    return handleAuthError(err)
  }
}

function aggregateByDay(timestamps: string[]): { date: string; count: number }[] {
  const map: Record<string, number> = {}
  for (const ts of timestamps) {
    const date = ts.slice(0, 10)
    map[date] = (map[date] || 0) + 1
  }
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }))
}
