'use client'

import { useState, useEffect } from 'react'
import { useSOSStore } from '@/stores/sosStore'
import { useT } from '@/lib/i18n'

const URGES = [
  'sos.breakup.urgeCall',
  'sos.breakup.urgeMessage',
  'sos.breakup.urgeProfile',
  'sos.breakup.urgeMeet',
] as const

const INSTEAD = [
  'sos.breakup.insteadCall',
  'sos.breakup.insteadWalk',
  'sos.breakup.insteadWrite',
] as const

const COUNTDOWN_SECONDS = 15 * 60 // 15 minutes

export function BreakupSOS() {
  const t = useT()
  const { currentStep, stepData, setStepData, nextStep } = useSOSStore()
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS)

  const urge = stepData.urge ?? ''
  const [committed, setCommitted] = useState(false)

  useEffect(() => {
    if (currentStep !== 0) return
    const interval = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [currentStep])

  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60

  return (
    <div className="flex min-h-[60vh] flex-col justify-center anim-in">
      {currentStep === 0 && (
        <div className="flex flex-col items-center gap-8">
          <h2 className="text-center text-2xl font-semibold text-white">
            {t('sos.breakup.delay')}
          </h2>
          <p className="text-center text-lg text-white/80">{t('sos.breakup.delayMessage')}</p>
          <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-brand-500/50 bg-brand-500/10 text-3xl font-bold tabular-nums text-brand-400">
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </div>
          <button
            type="button"
            onClick={nextStep}
            className="mt-4 rounded-xl bg-brand-500 px-8 py-4 font-semibold text-white transition hover:bg-brand-600"
          >
            {t('sos.next')}
          </button>
        </div>
      )}

      {currentStep === 1 && (
        <div className="flex flex-col gap-6">
          <h2 className="text-center text-xl font-medium text-white">
            {t('sos.breakup.nameUrge')}
          </h2>
          <div className="flex flex-wrap justify-center gap-2">
            {URGES.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setStepData('urge', t(key))}
                className={`rounded-full px-4 py-2.5 text-white transition ${
                  urge === t(key) ? 'bg-brand-500' : 'bg-white/10 hover:bg-brand-500/30'
                }`}
              >
                {t(key)}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={nextStep}
            disabled={!urge}
            className="mt-4 rounded-xl bg-brand-500 px-8 py-4 font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('sos.next')}
          </button>
        </div>
      )}

      {currentStep === 2 && (
        <div className="flex flex-col gap-6">
          <h2 className="text-center text-xl font-medium text-white">
            {t('sos.breakup.ifThen', { urge: urge || '…' })}
          </h2>
          <div className="flex flex-col gap-3">
            {INSTEAD.map((key) => (
              <button
                key={key}
                type="button"
                onClick={nextStep}
                className="rounded-xl bg-white/10 px-4 py-3 text-left text-white transition hover:bg-brand-500/30"
              >
                {t(key)}
              </button>
            ))}
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="flex flex-col gap-6">
          <h2 className="text-center text-xl font-medium text-white">
            {t('sos.breakup.commit')}
          </h2>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-white/5 p-4">
            <input
              type="checkbox"
              checked={committed}
              onChange={(e) => setCommitted(e.target.checked)}
              className="h-5 w-5 rounded border-white/30 bg-white/5 text-brand-500"
            />
            <span className="text-white">{t('sos.breakup.commitStatement')}</span>
          </label>
          <button
            type="button"
            onClick={nextStep}
            disabled={!committed}
            className="mt-2 rounded-xl bg-brand-500 px-8 py-4 font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('sos.next')}
          </button>
        </div>
      )}
    </div>
  )
}
