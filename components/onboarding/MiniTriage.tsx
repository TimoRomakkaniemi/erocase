'use client'

import { useState } from 'react'
import { useT } from '@/lib/i18n'

export interface TriageResult {
  safe: boolean
  selfHarm: boolean
  intensity: number
}

interface MiniTriageProps {
  onComplete: (result: TriageResult) => void
}

export default function MiniTriage({ onComplete }: MiniTriageProps) {
  const t = useT()
  const [safe, setSafe] = useState<boolean | null>(null)
  const [selfHarm, setSelfHarm] = useState<boolean | null>(null)
  const [intensity, setIntensity] = useState(5)
  const [showCrisis, setShowCrisis] = useState(false)

  const handleSafeChange = (value: boolean) => {
    setSafe(value)
    if (value === false) setShowCrisis(true)
  }

  const handleSelfHarmChange = (value: boolean) => {
    setSelfHarm(value)
    if (value === true) setShowCrisis(true)
  }

  const handleSubmit = () => {
    if (safe === null || selfHarm === null) return
    if (showCrisis) return
    onComplete({ safe, selfHarm, intensity })
  }

  if (showCrisis) {
    return (
      <div className="animate-fade-in-up max-w-lg mx-auto p-6 sm:p-8">
        <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/80 p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-amber-900 mb-2 flex items-center gap-2">
            <span>🆘</span>
            {t('onboarding.crisisTitle')}
          </h2>
          <p className="text-amber-800 text-sm font-medium mb-6">
            {t('onboarding.crisisDesc')}
          </p>
          <div className="space-y-4">
            <a
              href="tel:112"
              className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-amber-100 border border-amber-200 text-amber-900 font-semibold hover:bg-amber-200 transition-colors"
            >
              {t('onboarding.crisis112')} <span className="text-lg">112</span>
            </a>
            <a
              href="tel:0925250111"
              className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-amber-100 border border-amber-200 text-amber-900 font-semibold hover:bg-amber-200 transition-colors"
            >
              {t('onboarding.crisisLine')} <span className="text-lg">09 2525 0111</span>
            </a>
            <a
              href="tel:080005005"
              className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-amber-100 border border-amber-200 text-amber-900 font-semibold hover:bg-amber-200 transition-colors"
            >
              {t('onboarding.crisisNollalinja')} <span className="text-lg">080 005 005</span>
            </a>
          </div>
          <p className="mt-6 text-xs text-amber-700">
            {t('onboarding.crisisFooter')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up max-w-lg mx-auto p-6 sm:p-8">
      <div className="space-y-8">
        <div>
          <label className="block text-base font-semibold text-gray-800 mb-3">
            {t('onboarding.triageSafe')}
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleSafeChange(true)}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                safe === true
                  ? 'bg-brand-500 text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-300 hover:bg-brand-50/50'
              }`}
            >
              {t('onboarding.triageYes')}
            </button>
            <button
              type="button"
              onClick={() => handleSafeChange(false)}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                safe === false
                  ? 'bg-brand-500 text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-300 hover:bg-brand-50/50'
              }`}
            >
              {t('onboarding.triageNo')}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-base font-semibold text-gray-800 mb-3">
            {t('onboarding.triageSelfHarm')}
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleSelfHarmChange(true)}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                selfHarm === true
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-amber-300 hover:bg-amber-50/50'
              }`}
            >
              {t('onboarding.triageYes')}
            </button>
            <button
              type="button"
              onClick={() => handleSelfHarmChange(false)}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                selfHarm === false
                  ? 'bg-brand-500 text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-300 hover:bg-brand-50/50'
              }`}
            >
              {t('onboarding.triageNo')}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-base font-semibold text-gray-800 mb-3">
            {t('onboarding.triageIntensity')}
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={0}
              max={10}
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="flex-1 h-3 rounded-full appearance-none bg-warm-200 accent-brand-500"
            />
            <span className="text-lg font-bold text-brand-600 w-8 tabular-nums">{intensity}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={safe === null || selfHarm === null}
          className="w-full py-3.5 rounded-xl font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            boxShadow: '0 4px 12px rgba(34,197,94,0.3)',
          }}
        >
          {t('onboarding.continue')}
        </button>
      </div>
    </div>
  )
}
