'use client'

import { useMemo } from 'react'
import { useT } from '@/lib/i18n'
import { getRandomExercise } from '@/lib/exercises'

interface ExerciseProps {
  mode: string
  onComplete: (exerciseId: string) => void
}

export default function Exercise({ mode, onComplete }: ExerciseProps) {
  const t = useT()
  const exercise = useMemo(() => getRandomExercise(mode), [mode])

  if (!exercise) {
    return (
      <div className="animate-fade-in-up text-center py-8">
        <p className="text-gray-600">{t('today.exercise.noExercise')}</p>
        <button
          type="button"
          onClick={() => onComplete('none')}
          className="mt-4 px-6 py-3 rounded-xl font-semibold text-brand-700 bg-brand-50 border border-brand-200"
        >
          {t('common.done')}
        </button>
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up max-w-md mx-auto">
      <div className="rounded-2xl bg-white border border-gray-200/80 shadow-sm p-6 sm:p-8 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-brand-50 text-brand-700">
            {t('common.min', { n: exercise.duration_minutes })}
          </span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          {t(exercise.title_key)}
        </h2>
        <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
          {t(exercise.description_key)}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onComplete(exercise.id)}
        className="w-full py-4 rounded-xl font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]"
        style={{
          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          boxShadow: '0 4px 12px rgba(34,197,94,0.3)',
        }}
      >
        {t('common.done')}
      </button>
    </div>
  )
}
