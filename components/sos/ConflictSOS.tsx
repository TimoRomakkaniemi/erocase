'use client'

import { useSOSStore } from '@/stores/sosStore'
import { useT } from '@/lib/i18n'

const EMOTIONS = [
  'sos.conflict.emotionViha',
  'sos.conflict.emotionPettymys',
  'sos.conflict.emotionPelko',
  'sos.conflict.emotionSuru',
  'sos.conflict.emotionTurhautuminen',
  'sos.conflict.emotionHapea',
] as const

const NEEDS = [
  'sos.conflict.needTurvallisuus',
  'sos.conflict.needArvostus',
  'sos.conflict.needYhteys',
  'sos.conflict.needTila',
  'sos.conflict.needKuulluksi',
] as const

export function ConflictSOS() {
  const t = useT()
  const { currentStep, stepData, setStepData, nextStep } = useSOSStore()

  const emotion = stepData.emotion ?? ''
  const need = stepData.need ?? ''
  const situation = stepData.situation ?? ''
  const request = stepData.request ?? ''

  return (
    <div className="flex min-h-[60vh] flex-col justify-center anim-in">
      {currentStep === 0 && (
        <div className="flex flex-col items-center gap-8">
          <div
            className="flex h-32 w-32 items-center justify-center rounded-full bg-brand-500/20 text-4xl font-black tracking-tighter text-brand-400"
            style={{
              animation: 'sosBreatheInOut 8s ease-in-out infinite',
            }}
          >
            {t('sos.conflict.stop')}
          </div>
          <p className="text-center text-xl text-white/90">{t('sos.conflict.stopMessage')}</p>
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
            {t('sos.conflict.nameEmotion')}
          </h2>
          <div className="flex flex-wrap justify-center gap-2">
            {EMOTIONS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setStepData('emotion', t(key))}
                className={`rounded-full px-4 py-2.5 text-white transition ${
                  emotion === t(key) ? 'bg-brand-500' : 'bg-white/10 hover:bg-brand-500/30'
                }`}
              >
                {t(key)}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={nextStep}
            disabled={!emotion}
            className="mt-4 rounded-xl bg-brand-500 px-8 py-4 font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('sos.next')}
          </button>
        </div>
      )}

      {currentStep === 2 && (
        <div className="flex flex-col gap-6">
          <h2 className="text-center text-xl font-medium text-white">
            {t('sos.conflict.nameNeed')}
          </h2>
          <div className="flex flex-wrap justify-center gap-2">
            {NEEDS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setStepData('need', t(key))}
                className={`rounded-full px-4 py-2.5 text-white transition ${
                  need === t(key) ? 'bg-brand-500' : 'bg-white/10 hover:bg-brand-500/30'
                }`}
              >
                {t(key)}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={nextStep}
            disabled={!need}
            className="mt-4 rounded-xl bg-brand-500 px-8 py-4 font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('sos.next')}
          </button>
        </div>
      )}

      {currentStep === 3 && (
        <div className="flex flex-col gap-6">
          <h2 className="text-center text-xl font-medium text-white">
            {t('sos.conflict.request')}
          </h2>
          <p className="text-center text-sm text-white/70">
            {t('sos.conflict.requestTemplate', {
              emotion: emotion || '…',
              situation: situation || '…',
              need: need || '…',
              request: request || '…',
            })}
          </p>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder={t('sos.conflict.requestSituation')}
              value={situation}
              onChange={(e) => setStepData('situation', e.target.value)}
              className="rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-white/40"
            />
            <input
              type="text"
              placeholder={t('sos.conflict.requestAction')}
              value={request}
              onChange={(e) => setStepData('request', e.target.value)}
              className="rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-white/40"
            />
          </div>
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
