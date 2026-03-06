'use client'

import { useState } from 'react'
import { useT } from '@/lib/i18n'
import MiniTriage from './MiniTriage'

export type OnboardingMode = 'conflict' | 'breakup' | 'loneliness' | 'calm'

const MODES: { id: OnboardingMode; icon: string; titleKey: string; descKey: string }[] = [
  { id: 'conflict', icon: '🔥', titleKey: 'onboarding.modeConflict', descKey: 'onboarding.modeConflictDesc' },
  { id: 'breakup', icon: '💔', titleKey: 'onboarding.modeBreakup', descKey: 'onboarding.modeBreakupDesc' },
  { id: 'loneliness', icon: '🕊️', titleKey: 'onboarding.modeLoneliness', descKey: 'onboarding.modeLonelinessDesc' },
  { id: 'calm', icon: '🌙', titleKey: 'onboarding.modeCalm', descKey: 'onboarding.modeCalmDesc' },
]

interface TilesFirstProps {
  onComplete: (modes: string[]) => void
}

export default function TilesFirst({ onComplete }: TilesFirstProps) {
  const t = useT()
  const [selected, setSelected] = useState<Set<OnboardingMode>>(new Set())
  const [showAssessmentPrompt, setShowAssessmentPrompt] = useState(false)
  const [showMiniTriage, setShowMiniTriage] = useState(false)

  const toggleMode = (id: OnboardingMode) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else if (next.size < 2) {
        next.add(id)
      }
      return next
    })
  }

  const handleContinue = () => {
    if (selected.size === 0) return
    setShowAssessmentPrompt(true)
  }

  const handleAssessmentChoice = (doAssessment: boolean) => {
    if (doAssessment) {
      setShowMiniTriage(true)
    } else {
      onComplete(Array.from(selected))
    }
  }

  const handleTriageComplete = () => {
    onComplete(Array.from(selected))
  }

  if (showMiniTriage) {
    return (
      <div className="animate-fade-in-up">
        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
          {t('onboarding.triageTitle')}
        </h2>
        <MiniTriage onComplete={handleTriageComplete} />
      </div>
    )
  }

  if (showAssessmentPrompt) {
    return (
      <div className="animate-fade-in-up max-w-md mx-auto p-6">
        <div className="rounded-2xl bg-gradient-to-br from-brand-50 to-sage-50 border border-brand-100 p-6 sm:p-8">
          <p className="text-base font-medium text-gray-800 mb-6">
            {t('onboarding.wantAssessment')}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleAssessmentChoice(true)}
              className="flex-1 py-3 rounded-xl font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                boxShadow: '0 4px 12px rgba(34,197,94,0.3)',
              }}
            >
              {t('onboarding.yesAssessment')}
            </button>
            <button
              type="button"
              onClick={() => handleAssessmentChoice(false)}
              className="flex-1 py-3 rounded-xl font-semibold text-brand-700 bg-brand-50 border border-brand-200 hover:bg-brand-100 transition-all"
            >
              {t('onboarding.skipAssessment')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up max-w-2xl mx-auto p-6 sm:p-8">
      <p className="text-center text-gray-600 mb-8">
        {t('onboarding.selectModes')}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {MODES.map((mode) => {
          const isSelected = selected.has(mode.id)
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => toggleMode(mode.id)}
              className={`p-5 sm:p-6 rounded-2xl text-left transition-all duration-200 border-2 ${
                isSelected
                  ? 'border-brand-500 bg-brand-50 shadow-md ring-2 ring-brand-200'
                  : 'border-gray-200 bg-white hover:border-brand-300 hover:bg-brand-50/30'
              }`}
            >
              <span className="text-3xl mb-3 block">{mode.icon}</span>
              <h3 className="font-bold text-gray-900 text-base mb-1">
                {t(mode.titleKey)}
              </h3>
              <p className="text-sm text-gray-600">{t(mode.descKey)}</p>
            </button>
          )
        })}
      </div>
      <button
        type="button"
        onClick={handleContinue}
        disabled={selected.size === 0}
        className="w-full py-3.5 rounded-xl font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          boxShadow: '0 4px 12px rgba(34,197,94,0.3)',
        }}
      >
        {t('onboarding.continue')}
      </button>
    </div>
  )
}
