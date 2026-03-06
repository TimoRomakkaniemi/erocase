'use client'

import { useSOSStore } from '@/stores/sosStore'
import { useT } from '@/lib/i18n'

export function CalmSOS() {
  const t = useT()
  const { currentStep, stepData, setStepData, nextStep } = useSOSStore()

  const dump = stepData.dump ?? ''

  return (
    <div className="flex min-h-[60vh] flex-col justify-center anim-in">
      {currentStep === 0 && (
        <div className="flex flex-col items-center gap-8">
          <h2 className="text-center text-2xl font-semibold text-white">
            {t('sos.calm.breathe')}
          </h2>
          <p className="text-center text-white/80">{t('sos.calm.breathePrompt')}</p>
          <div
            className="h-40 w-40 rounded-full border-4 border-brand-500/50 bg-brand-500/20"
            style={{
              animation: 'breathe478 16s ease-in-out infinite',
            }}
          />
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
            {t('sos.calm.dump')}
          </h2>
          <p className="text-center text-white/80">{t('sos.calm.dumpPrompt')}</p>
          <textarea
            placeholder={t('sos.calm.dumpPrompt')}
            value={dump}
            onChange={(e) => setStepData('dump', e.target.value)}
            rows={6}
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

      {currentStep === 2 && (
        <div className="flex flex-col items-center gap-8">
          <h2 className="text-center text-2xl font-semibold text-white">
            {t('sos.calm.park')}
          </h2>
          <div className="flex flex-wrap justify-center gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-lg bg-white/10 px-4 py-2 text-white/70"
                style={{ animation: `fadeIn 0.5s ease-out ${i * 0.1}s both` }}
              >
                …
              </div>
            ))}
          </div>
          <p className="text-center text-lg text-white/90">{t('sos.calm.parkMessage')}</p>
          <button
            type="button"
            onClick={nextStep}
            className="mt-4 rounded-xl bg-brand-500 px-8 py-4 font-semibold text-white transition hover:bg-brand-600"
          >
            {t('sos.next')}
          </button>
        </div>
      )}

      {currentStep === 3 && (
        <div className="flex flex-col gap-6">
          <h2 className="text-center text-xl font-medium text-white">
            {t('sos.calm.relax')}
          </h2>
          <p className="text-center text-lg leading-relaxed text-white/90">
            {t('sos.calm.relaxPrompt')}
          </p>
          <button
            type="button"
            onClick={nextStep}
            className="mt-4 rounded-xl bg-brand-500 px-8 py-4 font-semibold text-white transition hover:bg-brand-600"
          >
            {t('sos.next')}
          </button>
        </div>
      )}
    </div>
  )
}
