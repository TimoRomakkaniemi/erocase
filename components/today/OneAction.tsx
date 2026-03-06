'use client'

import { useState } from 'react'
import { useT } from '@/lib/i18n'

const ACTION_SUGGESTIONS: Record<string, string[]> = {
  conflict: [
    'today.actions.conflict.apologize',
    'today.actions.conflict.askHow',
    'today.actions.conflict.suggestActivity',
  ],
  breakup: [
    'today.actions.breakup.callFriend',
    'today.actions.breakup.walk',
    'today.actions.breakup.journal',
  ],
  loneliness: [
    'today.actions.loneliness.sendMessage',
    'today.actions.loneliness.goPublic',
    'today.actions.loneliness.joinOnline',
  ],
  calm: [
    'today.actions.calm.earlySleep',
    'today.actions.calm.screensOff',
    'today.actions.calm.eveningRoutine',
  ],
}

interface OneActionProps {
  mode: string
  onComplete: (actionText: string) => void
}

export default function OneAction({ mode, onComplete }: OneActionProps) {
  const t = useT()
  const [customText, setCustomText] = useState('')
  const [selected, setSelected] = useState<string | null>(null)

  const suggestions = ACTION_SUGGESTIONS[mode] ?? []
  const actionText = selected ? t(selected) : customText.trim()
  const canContinue = actionText.length > 0

  const handleSuggestionClick = (key: string) => {
    setSelected((prev) => (prev === key ? null : key))
    setCustomText('')
  }

  const handleCustomChange = (value: string) => {
    setCustomText(value)
    if (value.trim()) setSelected(null)
  }

  const handleSubmit = () => {
    if (!canContinue) return
    onComplete(actionText)
  }

  return (
    <div className="animate-fade-in-up max-w-md mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 text-center">
        {t('today.action.heading')}
      </h2>
      <p className="text-gray-600 text-sm sm:text-base mb-6 text-center">
        {t('today.action.subheading')}
      </p>

      {/* Suggestion chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {suggestions.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => handleSuggestionClick(key)}
            className={`px-4 py-3 rounded-xl text-sm font-medium transition-all
              ${selected === key
                ? 'bg-brand-500 text-white shadow-md'
                : 'bg-warm-100 text-gray-700 hover:bg-warm-200 border border-warm-200'
              }`}
          >
            {t(key)}
          </button>
        ))}
      </div>

      {/* Custom input */}
      <div className="mb-8">
        <label htmlFor="action-custom" className="block text-sm font-medium text-gray-600 mb-2">
          {t('today.action.orCustom')}
        </label>
        <input
          id="action-custom"
          type="text"
          value={customText}
          onChange={(e) => handleCustomChange(e.target.value)}
          placeholder={t('today.action.customPlaceholder')}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
        />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canContinue}
        className="w-full py-4 rounded-xl font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:active:scale-100"
        style={{
          background: canContinue
            ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
            : '#9ca3af',
          boxShadow: canContinue ? '0 4px 12px rgba(34,197,94,0.3)' : 'none',
        }}
      >
        {t('common.done')}
      </button>
    </div>
  )
}
