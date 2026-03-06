'use client'

import { useCallback } from 'react'
import { createBrowserClient } from '@/lib/supabase-browser'

/**
 * Client-side analytics: inserts event into analytics_events via Supabase.
 * If no user (logged out), silently skips. Fire-and-forget, never blocks.
 */
export async function trackEvent(
  event: string,
  properties?: Record<string, unknown>
): Promise<void> {
  if (typeof window === 'undefined') return

  const supabase = createBrowserClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  void supabase
    .from('analytics_events')
    .insert({
      user_id: user.id,
      event,
      properties: properties ?? {},
    })
}

/**
 * React hook returning a memoized track function. SSR-safe.
 */
export function useTrackEvent(): (
  event: string,
  properties?: Record<string, unknown>
) => void {
  return useCallback((event: string, properties?: Record<string, unknown>) => {
    trackEvent(event, properties).catch(() => {})
  }, [])
}
