import { create } from 'zustand'
import { trackEvent } from '@/lib/analytics'

const STEPS_BY_MODE: Record<string, number> = {
  conflict: 4,
  breakup: 4,
  loneliness: 4,
  calm: 4,
}

export type SOSOutcome = 'completed' | 'abandoned' | 'escalated_to_chat'

interface SOSState {
  isActive: boolean
  mode: string | null
  currentStep: number
  totalSteps: number
  startTime: number | null
  reliefRating: number | null
  stepData: Record<string, string>

  startSOS: (mode: string) => void
  nextStep: () => void
  prevStep: () => void
  setStepData: (key: string, value: string) => void
  setReliefRating: (rating: number) => void
  completeSOS: (outcome: SOSOutcome) => Promise<void>
  closeSOS: () => void
}

function resetState() {
  return {
    isActive: false,
    mode: null,
    currentStep: 0,
    totalSteps: 4,
    startTime: null,
    reliefRating: null,
    stepData: {},
  }
}

export const useSOSStore = create<SOSState>((set, get) => ({
  isActive: false,
  mode: null,
  currentStep: 0,
  totalSteps: 4,
  startTime: null,
  reliefRating: null,
  stepData: {},

  startSOS: (mode: string) => {
    const totalSteps = STEPS_BY_MODE[mode] ?? 4
    set({
      isActive: true,
      mode,
      currentStep: 0,
      totalSteps,
      startTime: Date.now(),
      reliefRating: null,
      stepData: {},
    })
    trackEvent('sos_started', { mode }).catch(() => {})
  },

  nextStep: () => {
    const { currentStep, totalSteps } = get()
    if (currentStep < totalSteps - 1) {
      set({ currentStep: currentStep + 1 })
    }
  },

  prevStep: () => {
    const { currentStep } = get()
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 })
    }
  },

  setStepData: (key: string, value: string) => {
    set((state) => ({
      stepData: { ...state.stepData, [key]: value },
    }))
  },

  setReliefRating: (rating: number) => {
    set({ reliefRating: rating })
    trackEvent('sos_relief_rating', { rating }).catch(() => {})
  },

  completeSOS: async (outcome: SOSOutcome) => {
    const { mode, currentStep, totalSteps, startTime, reliefRating } = get()
    if (!mode || startTime === null) {
      set(resetState())
      return
    }

    const durationSeconds = Math.round((Date.now() - startTime) / 1000)

    try {
      const res = await fetch('/api/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          steps_completed: currentStep + 1,
          total_steps: totalSteps,
          relief_rating: reliefRating ?? null,
          duration_seconds: durationSeconds,
          outcome,
        }),
      })

      if (!res.ok && res.status !== 401) {
        const data = await res.json().catch(() => ({}))
        console.error('SOS save failed:', data.error ?? res.statusText)
      }
    } catch (err) {
      console.error('SOS save error:', err)
    } finally {
      trackEvent('sos_completed', { mode, outcome }).catch(() => {})
      set(resetState())
    }
  },

  closeSOS: () => {
    set(resetState())
  },
}))
