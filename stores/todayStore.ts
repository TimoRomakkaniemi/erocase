'use client'

import { create } from 'zustand'
import { trackEvent } from '@/lib/analytics'

export interface TodayState {
  isActive: boolean
  currentStep: number // 0=check-in, 1=exercise, 2=action, 3=complete
  mode: string | null
  checkInScore: number | null
  checkInWord: string
  exerciseId: string | null
  exerciseCompleted: boolean
  actionText: string
  actionCompleted: boolean
  todaySessionId: string | null

  startToday: (mode: string) => void
  setCheckIn: (score: number, word: string) => void
  nextStep: () => void
  prevStep: () => void
  setExerciseCompleted: (id: string) => void
  setAction: (text: string) => void
  completeAction: () => void
  saveSession: () => Promise<void>
  reset: () => void
}

function getInitialState() {
  return {
    isActive: false,
    currentStep: 0,
    mode: null,
    checkInScore: null,
    checkInWord: '',
    exerciseId: null,
    exerciseCompleted: false,
    actionText: '',
    actionCompleted: false,
    todaySessionId: null,
  }
}

export const useTodayStore = create<TodayState>((set, get) => ({
  ...getInitialState(),

  startToday: (mode: string) => {
    set({
      ...getInitialState(),
      isActive: true,
      currentStep: 0,
      mode,
    })
  },

  setCheckIn: (score: number, word: string) => {
    set({ checkInScore: score, checkInWord: word })
  },

  nextStep: () => {
    const { currentStep } = get()
    if (currentStep < 3) {
      set({ currentStep: currentStep + 1 })
    }
  },

  prevStep: () => {
    const { currentStep } = get()
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 })
    }
  },

  setExerciseCompleted: (id: string) => {
    set({ exerciseId: id, exerciseCompleted: true })
  },

  setAction: (text: string) => {
    set({ actionText: text })
  },

  completeAction: () => {
    set({ actionCompleted: true })
  },

  saveSession: async () => {
    const state = get()
    if (!state.mode || !state.isActive) return

    try {
      const res = await fetch('/api/today', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: state.mode,
          check_in_score: state.checkInScore,
          check_in_word: state.checkInWord || null,
          exercise_id: state.exerciseId,
          exercise_completed: state.exerciseCompleted,
          action_text: state.actionText || null,
          action_completed: state.actionCompleted,
        }),
      })

      if (!res.ok && res.status !== 401) {
        const data = await res.json().catch(() => ({}))
        console.error('Today save failed:', data.error ?? res.statusText)
        return
      }

      const data = await res.json().catch(() => ({}))
      if (data?.id) {
        set({ todaySessionId: data.id })
        trackEvent('today_completed', { mode: state.mode }).catch(() => {})
      }
    } catch (err) {
      console.error('Today save error:', err)
    }
  },

  reset: () => {
    set({ ...getInitialState(), isActive: false })
  },
}))
