'use client'

import { useSOSStore } from '@/stores/sosStore'
import { useT } from '@/lib/i18n'

const MICRO_ACTIONS = [
  'sos.loneliness.microSend',
  'sos.loneliness.microGreet',
  'sos.loneliness.microOut',
] as const

const GROUND_ITEMS = [
  { key: 'sos.loneliness.groundSee', n: 5 },
  { key: 'sos.loneliness.groundHear', n: 4 },
  { key: 'sos.loneliness.groundFeel', n: 3 },
  { key: 'sos.loneliness.groundSmell', n: 2 },
  { key: 'sos.loneliness.groundTaste', n: 1 },
] as const

export function LonelinessSOS() {
  const t = useT()
  const { currentStep, stepData, setStepData, nextStep } = useSOSStore()

  const bridge = stepData.bridge ?? ''
  const plan = stepData.plan ?? ''

  return (
    <div className="flex min-h-[60vh] flex-col justify-center anim-in">
      {currentStep === 0 && (
        <div className="flex flex-col gap-6">
          <h2 className="text-center text-xl font-medium text-white">
            {t('sos.loneliness.ground')}
          </h2>
          <p className="text-center text-white/80">{t('sos.loneliness.groundPrompt')}</p>
          <div className="flex flex-col gap-3">
            {GROUND_ITEMS.map(({ key, n }) => (
              <div
                key={key}
                className="rounded-xl bg-white/5 px-4 py-3 text-white"
              >
                <span className="font-semibold text-brand-400">{n}</span> — {t(key)}
              </div>
            ))}
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
            {t('sos.loneliness.microAction')}
          </h2>
          <div className="flex flex-col gap-3">
            {MICRO_ACTIONS.map((key) => (
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

      {currentStep === 2 && (
        <div className="flex flex-col gap-6">
          <h2 className="text-center text-xl font-medium text-white">
            {t('sos.loneliness.bridge')}
          </h2>
          <p className="text-center text-white/80">{t('sos.loneliness.bridgePrompt')}</p>
          <input
            type="text"
            placeholder={t('sos.loneliness.bridgePrompt')}
            value={bridge}
            onChange={(e) => setStepData('bridge', e.target.value)}
            className="rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-white/40"
          />
          <button
            type="button"
            onClick={nextStep}
            className="mt-2 rounded-xl bg-brand-500 px-8 py-4 font-semibold text-white transition hover:bg-brand-600"
          >
            {t('sos.next')}
          </button>
        </div>
      )}

      {currentStep === 3 && (
        <div className="flex flex-col gap-6">
          <h2 className="text-center text-xl font-medium text-white">
            {t('sos.loneliness.plan')}
          </h2>
          <p className="text-center text-white/80">{t('sos.loneliness.planPrompt')}</p>
          <input
            type="text"
            placeholder={t('sos.loneliness.planPrompt')}
            value={plan}
            onChange={(e) => setStepData('plan', e.target.value)}
            className="rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-white/40"
          />
          <button
            type="button"
            onClick={nextStep}
            className="mt-2 rounded-xl bg-brand-500 px-8 py-4 font-semibold text-white transition hover:bg-brand-600"
          >
            {t('sos.next')}
          </button>
        </div>
      )}
    </div>
  )
}
