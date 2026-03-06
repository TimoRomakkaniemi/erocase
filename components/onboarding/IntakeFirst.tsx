'use client'

import { useState } from 'react'
import { useT } from '@/lib/i18n'

type OnboardingMode = 'conflict' | 'breakup' | 'loneliness' | 'calm'

const KEYWORD_MAP: { keywords: RegExp[]; mode: OnboardingMode }[] = [
  { keywords: [/riita|konflikti|riidel|tappelu|viha/i], mode: 'conflict' },
  { keywords: [/ero|suhde|ex|parisuhde|erota|breakup/i], mode: 'breakup' },
  { keywords: [/yksinäi|yksin|erist|isolaatio|lonely/i], mode: 'loneliness' },
  { keywords: [/stressi|uni|ahdist|rauhoit|calm|levät|unettomuus/i], mode: 'calm' },
]

function suggestModesFromText(text: string): OnboardingMode[] {
  const found = new Set<OnboardingMode>()
  const lower = text.toLowerCase().trim()
  for (const { keywords, mode } of KEYWORD_MAP) {
    if (keywords.some((k) => k.test(lower))) found.add(mode)
  }
  if (found.size === 0) return ['loneliness', 'calm']
  return Array.from(found).slice(0, 2)
}

const MODE_LABELS: Record<OnboardingMode, string> = {
  conflict: 'onboarding.modeConflict',
  breakup: 'onboarding.modeBreakup',
  loneliness: 'onboarding.modeLoneliness',
  calm: 'onboarding.modeCalm',
}

interface IntakeFirstProps {
  onComplete: (modes: string[]) => void
}

export default function IntakeFirst({ onComplete }: IntakeFirstProps) {
  const t = useT()
  const [text, setText] = useState('')
  const [phase, setPhase] = useState<'input' | 'analyzing' | 'suggest'>('input')
  const [suggestedModes, setSuggestedModes] = useState<OnboardingMode[]>([])

  const handleSubmit = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    setPhase('analyzing')
    setTimeout(() => {
      const modes = suggestModesFromText(trimmed)
      setSuggestedModes(modes)
      setPhase('suggest')
    }, 1200)
  }

  const handleConfirm = () => {
    onComplete(suggestedModes)
  }

  if (phase === 'analyzing') {
    return (
      <div className="animate-fade-in-up max-w-lg mx-auto p-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-100 text-brand-700 font-medium">
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
          {t('onboarding.analyzing')}
        </div>
      </div>
    )
  }

  if (phase === 'suggest') {
    return (
      <div className="animate-fade-in-up max-w-lg mx-auto p-6 sm:p-8">
        <p className="text-gray-600 mb-6">{t('onboarding.suggestedModes')}</p>
        <div className="space-y-3 mb-8">
          {suggestedModes.map((mode) => (
            <div
              key={mode}
              className="p-4 rounded-xl bg-brand-50 border border-brand-100 flex items-center gap-3"
            >
              <span className="text-2xl">
                {mode === 'conflict' && '🔥'}
                {mode === 'breakup' && '💔'}
                {mode === 'loneliness' && '🕊️'}
                {mode === 'calm' && '🌙'}
              </span>
              <span className="font-semibold text-gray-900">{t(MODE_LABELS[mode])}</span>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={handleConfirm}
          className="w-full py-3.5 rounded-xl font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            boxShadow: '0 4px 12px rgba(34,197,94,0.3)',
          }}
        >
          {t('onboarding.confirmModes')}
        </button>
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up max-w-lg mx-auto p-6 sm:p-8">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
        {t('onboarding.intakeQuestion')}
      </h2>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t('onboarding.intakePlaceholder')}
        rows={4}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 resize-none transition-all"
      />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!text.trim()}
        className="mt-4 w-full py-3.5 rounded-xl font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          boxShadow: '0 4px 12px rgba(34,197,94,0.3)',
        }}
      >
        {t('onboarding.intakeSubmit')}
      </button>
    </div>
  )
}
