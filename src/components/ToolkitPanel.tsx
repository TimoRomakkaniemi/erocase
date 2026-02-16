import { useState } from 'react'
import { useT } from '../lib/i18n'

interface Exercise {
  id: string
  icon: string
  titleKey: string
  durKey: string
  category: 'breathing' | 'writing' | 'reflection' | 'action' | 'mindfulness'
  descKey: string
  stepKeys: string[]
  tipKey?: string
}

const EXERCISES: Exercise[] = [
  {
    id: 'breathing-calm',
    icon: '🌬️',
    titleKey: 'toolkit.ex1title',
    durKey: 'toolkit.ex1dur',
    category: 'breathing',
    descKey: 'toolkit.ex1desc',
    stepKeys: ['toolkit.ex1s1', 'toolkit.ex1s2', 'toolkit.ex1s3', 'toolkit.ex1s4', 'toolkit.ex1s5'],
    tipKey: 'toolkit.ex1tip',
  },
  {
    id: 'grounding-54321',
    icon: '🌿',
    titleKey: 'toolkit.ex2title',
    durKey: 'toolkit.ex2dur',
    category: 'mindfulness',
    descKey: 'toolkit.ex2desc',
    stepKeys: ['toolkit.ex2s1', 'toolkit.ex2s2', 'toolkit.ex2s3', 'toolkit.ex2s4', 'toolkit.ex2s5'],
    tipKey: 'toolkit.ex2tip',
  },
  {
    id: 'emotion-wave',
    icon: '🌊',
    titleKey: 'toolkit.ex3title',
    durKey: 'toolkit.ex3dur',
    category: 'reflection',
    descKey: 'toolkit.ex3desc',
    stepKeys: ['toolkit.ex3s1', 'toolkit.ex3s2', 'toolkit.ex3s3', 'toolkit.ex3s4', 'toolkit.ex3s5', 'toolkit.ex3s6'],
    tipKey: 'toolkit.ex3tip',
  },
  {
    id: 'value-balance',
    icon: '⚖️',
    titleKey: 'toolkit.ex4title',
    durKey: 'toolkit.ex4dur',
    category: 'reflection',
    descKey: 'toolkit.ex4desc',
    stepKeys: ['toolkit.ex4s1', 'toolkit.ex4s2', 'toolkit.ex4s3', 'toolkit.ex4s4', 'toolkit.ex4s5'],
  },
  {
    id: 'guilt-release',
    icon: '📝',
    titleKey: 'toolkit.ex5title',
    durKey: 'toolkit.ex5dur',
    category: 'writing',
    descKey: 'toolkit.ex5desc',
    stepKeys: ['toolkit.ex5s1', 'toolkit.ex5s2', 'toolkit.ex5s3', 'toolkit.ex5s4', 'toolkit.ex5s5'],
    tipKey: 'toolkit.ex5tip',
  },
  {
    id: 'safe-communication',
    icon: '🗣️',
    titleKey: 'toolkit.ex6title',
    durKey: 'toolkit.ex6dur',
    category: 'action',
    descKey: 'toolkit.ex6desc',
    stepKeys: ['toolkit.ex6s1', 'toolkit.ex6s2', 'toolkit.ex6s3', 'toolkit.ex6s4', 'toolkit.ex6s5'],
    tipKey: 'toolkit.ex6tip',
  },
  {
    id: 'daily-anchor',
    icon: '⚓',
    titleKey: 'toolkit.ex7title',
    durKey: 'toolkit.ex7dur',
    category: 'writing',
    descKey: 'toolkit.ex7desc',
    stepKeys: ['toolkit.ex7s1', 'toolkit.ex7s2', 'toolkit.ex7s3', 'toolkit.ex7s4'],
    tipKey: 'toolkit.ex7tip',
  },
  {
    id: 'kids-emotion-map',
    icon: '🎨',
    titleKey: 'toolkit.ex8title',
    durKey: 'toolkit.ex8dur',
    category: 'action',
    descKey: 'toolkit.ex8desc',
    stepKeys: ['toolkit.ex8s1', 'toolkit.ex8s2', 'toolkit.ex8s3', 'toolkit.ex8s4', 'toolkit.ex8s5'],
    tipKey: 'toolkit.ex8tip',
  },
]

const CATEGORY_KEYS: Record<string, string> = {
  breathing: 'toolkit.catBreathing',
  writing: 'toolkit.catWriting',
  reflection: 'toolkit.catReflection',
  action: 'toolkit.catAction',
  mindfulness: 'toolkit.catMindfulness',
}

const CATEGORY_COLORS: Record<string, string> = {
  breathing: '#0ea5e9',
  writing: '#8b5cf6',
  reflection: '#f59e0b',
  action: '#22c55e',
  mindfulness: '#06b6d4',
}

interface ToolkitPanelProps {
  onClose: () => void
}

export default function ToolkitPanel({ onClose }: ToolkitPanelProps) {
  const t = useT()
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [filter, setFilter] = useState<string | null>(null)

  const filtered = filter
    ? EXERCISES.filter((e) => e.category === filter)
    : EXERCISES

  if (selectedExercise) {
    return (
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
        <div
          className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl"
          style={{
            background: 'linear-gradient(180deg, #ffffff 0%, #faf8f6 100%)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
          }}
        >
          <div className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedExercise.icon}</span>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{t(selectedExercise.titleKey)}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="text-[0.6rem] font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background: `${CATEGORY_COLORS[selectedExercise.category]}15`,
                        color: CATEGORY_COLORS[selectedExercise.category],
                      }}
                    >
                      {t(CATEGORY_KEYS[selectedExercise.category])}
                    </span>
                    <span className="text-[0.65rem] text-gray-400">⏱ {t(selectedExercise.durKey)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedExercise(null)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed mb-5">{t(selectedExercise.descKey)}</p>

            <div className="space-y-3 mb-5">
              {selectedExercise.stepKeys.map((sk, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${CATEGORY_COLORS[selectedExercise.category]}, ${CATEGORY_COLORS[selectedExercise.category]}90)` }}
                  >
                    {i + 1}
                  </span>
                  <p className="text-sm text-gray-700 leading-relaxed pt-0.5">{t(sk)}</p>
                </div>
              ))}
            </div>

            {selectedExercise.tipKey && (
              <div
                className="rounded-xl p-3.5 mb-4"
                style={{ background: 'linear-gradient(135deg, #fef3c7, #fef9c3)' }}
              >
                <div className="flex items-start gap-2">
                  <span className="text-sm">💡</span>
                  <p className="text-xs text-amber-800 leading-relaxed">{t(selectedExercise.tipKey)}</p>
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedExercise(null)}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                boxShadow: '0 2px 8px rgba(22,163,74,0.25)',
              }}
            >
              {t('common.done')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl flex flex-col"
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #faf8f6 100%)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
        }}
      >
        <div className="p-5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🧰</span>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{t('toolkit.title')}</h2>
                <p className="text-xs text-gray-500">{t('toolkit.subtitle')}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setFilter(null)}
              className={`text-[0.65rem] font-semibold px-2.5 py-1 rounded-full transition-all
                ${!filter ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              {t('common.all')}
            </button>
            {Object.entries(CATEGORY_KEYS).map(([key, tKey]) => (
              <button
                key={key}
                onClick={() => setFilter(filter === key ? null : key)}
                className="text-[0.65rem] font-semibold px-2.5 py-1 rounded-full transition-all"
                style={filter === key ? {
                  background: CATEGORY_COLORS[key],
                  color: 'white',
                } : {
                  background: `${CATEGORY_COLORS[key]}12`,
                  color: CATEGORY_COLORS[key],
                }}
              >
                {t(tKey)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((exercise) => (
              <button
                key={exercise.id}
                onClick={() => setSelectedExercise(exercise)}
                className="text-left p-4 rounded-xl border border-gray-200 hover:border-gray-300
                           hover:shadow-md active:scale-[0.98] transition-all duration-150 group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl group-hover:scale-110 transition-transform">{exercise.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1">{t(exercise.titleKey)}</h3>
                    <p className="text-[0.7rem] text-gray-500 leading-relaxed line-clamp-2 mb-2">
                      {t(exercise.descKey)}
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[0.6rem] font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          background: `${CATEGORY_COLORS[exercise.category]}12`,
                          color: CATEGORY_COLORS[exercise.category],
                        }}
                      >
                        {t(CATEGORY_KEYS[exercise.category])}
                      </span>
                      <span className="text-[0.6rem] text-gray-400">⏱ {t(exercise.durKey)}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
