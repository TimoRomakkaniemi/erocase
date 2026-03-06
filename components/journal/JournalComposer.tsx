'use client'

import { useState } from 'react'
import { useT } from '@/lib/i18n'

const MOOD_EMOJI: Record<number, string> = {
  0: '😢',
  1: '😔',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😊',
  6: '😄',
  7: '😁',
  8: '🤩',
  9: '🥳',
  10: '✨',
}

interface JournalComposerProps {
  onSave: (entry: { content: string; mood_score?: number; mode?: string }) => void | Promise<void>
  onCancel: () => void
  activeModes?: string[]
}

export default function JournalComposer({ onSave, onCancel, activeModes = [] }: JournalComposerProps) {
  const t = useT()
  const [content, setContent] = useState('')
  const [moodScore, setMoodScore] = useState<number | undefined>(undefined)
  const [mode, setMode] = useState<string | undefined>(undefined)
  const [saving, setSaving] = useState(false)

  const modes = activeModes.length > 0 ? activeModes : ['conflict', 'breakup', 'loneliness', 'calm']

  const handleSubmit = async () => {
    const trimmed = content.trim()
    if (!trimmed || saving) return

    setSaving(true)
    try {
      await Promise.resolve(
        onSave({
          content: trimmed,
          mood_score: moodScore,
          mode: mode || undefined,
        })
      )
      setContent('')
      setMoodScore(undefined)
      setMode(undefined)
    } finally {
      setSaving(false)
    }
  }

  const canSave = content.trim().length > 0

  return (
    <div className="rounded-2xl bg-white border border-gray-200 shadow-lg overflow-hidden">
      <div className="p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('journal.newEntry')}</h3>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t('journal.contentPlaceholder')}
          className="w-full min-h-[120px] px-4 py-3 rounded-xl border border-gray-200 text-gray-800
            placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400
            resize-none text-sm"
          disabled={saving}
        />

        <div className="mt-4">
          <label className="block text-xs font-medium text-gray-500 mb-2">{t('journal.moodScore')}</label>
          <div className="flex gap-1 flex-wrap">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setMoodScore(moodScore === n ? undefined : n)}
                className={`w-9 h-9 rounded-lg text-sm transition-all touch-manipulation
                  ${moodScore === n
                    ? 'bg-brand-500 text-white ring-2 ring-brand-400'
                    : 'bg-warm-100 text-gray-600 hover:bg-warm-200'}`}
              >
                {MOOD_EMOJI[n]}
              </button>
            ))}
          </div>
        </div>

        {modes.length > 0 && (
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-500 mb-2">{t('journal.mode')}</label>
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setMode(undefined)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                  ${!mode ? 'bg-brand-100 text-brand-700 border border-brand-200' : 'bg-warm-100 text-gray-600 hover:bg-warm-200'}`}
              >
                {t('journal.modeOptional')}
              </button>
              {modes.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(mode === m ? undefined : m)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                    ${mode === m ? 'bg-brand-100 text-brand-700 border border-brand-200' : 'bg-warm-100 text-gray-600 hover:bg-warm-200'}`}
                >
                  {t(`onboarding.mode${m.charAt(0).toUpperCase() + m.slice(1)}`)}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-6">
          <button
            onClick={handleSubmit}
            disabled={!canSave || saving}
            className="flex-1 py-2.5 rounded-xl font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: canSave && !saving
                ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                : 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
              boxShadow: canSave && !saving ? '0 2px 8px rgba(22,163,74,0.25)' : 'none',
            }}
          >
            {saving ? t('journal.saving') : t('journal.save')}
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl font-medium text-gray-600 bg-warm-100 hover:bg-warm-200 transition-colors"
          >
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}
