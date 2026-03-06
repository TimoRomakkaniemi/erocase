'use client'

import { create } from 'zustand'
import { createBrowserClient } from '@/lib/supabase-browser'

export interface ModeState {
  activeMode: string | null
  availableModes: string[]
  loading: boolean
  setMode: (mode: string) => void
  loadModes: () => Promise<void>
  addMode: (mode: string) => Promise<void>
  removeMode: (mode: string) => Promise<void>
}

export const useModeStore = create<ModeState>((set, get) => ({
  activeMode: null,
  availableModes: [],
  loading: false,

  setMode: (mode: string) => {
    set({ activeMode: mode })
  },

  loadModes: async () => {
    set({ loading: true })
    const supabase = createBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      set({ availableModes: [], loading: false })
      return
    }
    const { data, error } = await supabase
      .from('user_modes')
      .select('mode')
      .eq('user_id', user.id)
      .eq('is_active', true)
    if (!error && data) {
      set({ availableModes: data.map((r) => r.mode), loading: false })
    } else {
      set({ loading: false })
    }
  },

  addMode: async (mode: string) => {
    const supabase = createBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('user_modes').upsert(
      { user_id: user.id, mode, is_active: true },
      { onConflict: 'user_id,mode' }
    )
    await get().loadModes()
  },

  removeMode: async (mode: string) => {
    const supabase = createBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return
    await supabase
      .from('user_modes')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .eq('mode', mode)
    const { activeMode } = get()
    if (activeMode === mode) {
      set({ activeMode: null })
    }
    await get().loadModes()
  },
}))
