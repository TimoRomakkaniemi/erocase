import { createSupabaseAdmin } from '@/lib/supabase-server'

/**
 * Server-side analytics: inserts event into analytics_events via Supabase Admin.
 * Fire-and-forget, never blocks. Use from API routes.
 */
export async function trackEventServer(
  userId: string,
  event: string,
  properties?: Record<string, unknown>
): Promise<void> {
  const admin = await createSupabaseAdmin()
  void admin
    .from('analytics_events')
    .insert({
      user_id: userId,
      event,
      properties: properties ?? {},
    })
}
