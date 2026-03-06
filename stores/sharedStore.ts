'use client'

import { create } from 'zustand'
import { trackEvent } from '@/lib/analytics'

export interface SharedSpace {
  id: string
  type: 'partner' | 'friend'
  status: string
  created_at: string
  members: {
    user_id: string
    role: string
    display_name?: string
    email?: string
  }[]
}

interface SharedState {
  spaces: SharedSpace[]
  currentSpaceId: string | null
  loading: boolean
  loadSpaces: () => Promise<void>
  createSpace: (type: 'partner' | 'friend') => Promise<{ invite_token: string } | null>
  setCurrentSpace: (id: string) => void
  archiveSpace: (id: string) => Promise<void>
}

export const useSharedStore = create<SharedState>((set, get) => ({
  spaces: [],
  currentSpaceId: null,
  loading: false,

  loadSpaces: async () => {
    set({ loading: true })
    try {
      const res = await fetch('/api/shared')
      if (!res.ok) {
        set({ spaces: [], loading: false })
        return
      }
      const data = await res.json()
      set({ spaces: data.spaces ?? [], loading: false })
    } catch {
      set({ spaces: [], loading: false })
    }
  },

  createSpace: async (type: 'partner' | 'friend') => {
    try {
      const res = await fetch('/api/shared', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      })
      const data = await res.json()
      if (!res.ok) {
        console.error('Create space failed:', data.error)
        return null
      }
      trackEvent(type === 'partner' ? 'partner_invited' : 'friend_invited', { type }).catch(() => {})
      await get().loadSpaces()
      return { invite_token: data.invite_token }
    } catch (e) {
      console.error('Create space error:', e)
      return null
    }
  },

  setCurrentSpace: (id: string) => {
    set({ currentSpaceId: id })
  },

  archiveSpace: async (id: string) => {
    try {
      const res = await fetch(`/api/shared?space_id=${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived' }),
      })
      if (!res.ok) return
      await get().loadSpaces()
      const { currentSpaceId } = get()
      if (currentSpaceId === id) {
        set({ currentSpaceId: null })
      }
    } catch (e) {
      console.error('Archive space error:', e)
    }
  },
}))
