'use client'

import { create } from 'zustand'
import type { TriageResult } from '@/lib/triage'

interface TriageState {
  result: TriageResult | null
  countryCode: string
  showTriage: (result: TriageResult, countryCode?: string) => void
  closeTriage: () => void
  setCountryCode: (code: string) => void
}

export const useTriageStore = create<TriageState>((set) => ({
  result: null,
  countryCode: 'FI',

  showTriage: (result: TriageResult, countryCode?: string) => {
    set({
      result,
      countryCode: countryCode || 'FI',
    })
  },

  closeTriage: () => {
    set({ result: null })
  },

  setCountryCode: (code: string) => {
    set({ countryCode: code })
  },
}))
