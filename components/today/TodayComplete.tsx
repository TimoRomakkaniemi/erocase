'use client'

import { useT } from '@/lib/i18n'
import { getExercisesForMode } from '@/lib/exercises'

interface TodayCompleteProps {
  score: number | null
  word: string
  exerciseId: string | null
  actionText: string
  onContinueChat: () => void
  onClose: () => void
  mode: string | null
}

function getExerciseTitle(exerciseId: string | null, mode: string | null): string {
  if (!exerciseId || !mode) return '—'
  const exercises = getExercisesForMode(mode)
  const ex = exercises.find((e) => e.id === exerciseId)
  return ex ? ex.title_key : exerciseId
}

export default function TodayComplete({
  score,
  word,
  exerciseId,
  actionText,
  onContinueChat,
  onClose,
  mode,
}: TodayCompleteProps) {
  const t = useT()
  const exerciseTitleKey = getExerciseTitle(exerciseId, mode)

  return (
    <div className="animate-fade-in-up max-w-md mx-auto">
      <div className="text-center mb-8">
        <span className="text-5xl mb-4 block" aria-hidden>✨</span>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          {t('today.complete.heading')}
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          {t('today.complete.subheading')}
        </p>
      </div>

      <div className="rounded-2xl bg-white/80 border border-gray-200/80 shadow-sm p-6 mb-8">
        <div className="space-y-4">
          {score != null && (
            <div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {t('today.complete.scoreLabel')}
              </span>
              <p className="text-gray-900 font-medium">
                {score}/10 {word ? `— ${word}` : ''}
              </p>
            </div>
          )}
          {exerciseId && (
            <div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {t('today.complete.exerciseLabel')}
              </span>
              <p className="text-gray-900 font-medium">{t(exerciseTitleKey)}</p>
            </div>
          )}
          {actionText && (
            <div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {t('today.complete.actionLabel')}
              </span>
              <p className="text-gray-900 font-medium">{actionText}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onContinueChat}
          className="flex-1 py-4 rounded-xl font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            boxShadow: '0 4px 12px rgba(34,197,94,0.3)',
          }}
        >
          {t('today.complete.continueChat')}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-4 rounded-xl font-semibold text-gray-700 bg-warm-100 border border-warm-200
            hover:bg-warm-200 transition-all"
        >
          {t('common.close')}
        </button>
      </div>
    </div>
  )
}
