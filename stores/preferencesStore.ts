'use client'

import { create } from 'zustand'
import { createBrowserClient } from '@/lib/supabase-browser'

export interface UserPreferences {
  guidance_style: 'structured' | 'balanced' | 'open'
  tone: 'gentle' | 'direct' | 'light_humor'
  voice_enabled: boolean
  avatar: string
  auto_delete_days: number
}

interface PreferencesState {
  preferences: UserPreferences | null
  loading: boolean
  loadPreferences: () => Promise<void>
  updatePreference: (key: string, value: string | boolean | number) => Promise<void>
}

const DEFAULT_PREFERENCES: UserPreferences = {
  guidance_style: 'balanced',
  tone: 'gentle',
  voice_enabled: false,
  avatar: 'leaf',
  auto_delete_days: 0,
}

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  preferences: null,
  loading: false,

  loadPreferences: async () => {
    set({ loading: true })
    const supabase = createBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      set({ preferences: null, loading: false })
      return
    }
    const { data, error } = await supabase
      .from('user_preferences')
      .select('guidance_style, tone, voice_enabled, avatar, auto_delete_days')
      .eq('user_id', user.id)
      .single()

    if (!error && data) {
      set({
        preferences: {
          guidance_style: (data.guidance_style as UserPreferences['guidance_style']) || 'balanced',
          tone: (data.tone as UserPreferences['tone']) || 'gentle',
          voice_enabled: data.voice_enabled ?? false,
          avatar: (data.avatar && data.avatar !== 'default') ? data.avatar : 'leaf',
          auto_delete_days: data.auto_delete_days ?? 0,
        },
        loading: false,
      })
    } else {
      set({ preferences: DEFAULT_PREFERENCES, loading: false })
    }
  },

  updatePreference: async (key: string, value: string | boolean | number) => {
    const supabase = createBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { preferences } = get()
    const current = preferences || DEFAULT_PREFERENCES

    set({
      preferences: {
        ...current,
        [key]: value,
      } as UserPreferences,
    })

    const { error } = await supabase
      .from('user_preferences')
      .upsert(
        {
          user_id: user.id,
          [key]: value,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )

    if (error) {
      set({ preferences: current })
      console.error('Failed to update preference:', error)
    }
  },
}))
