'use client'

import { useState } from 'react'
import { useT } from '@/lib/i18n'
import type { JournalEntry as JournalEntryType } from './JournalList'

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

interface JournalEntryProps {
  entry: JournalEntryType
  onClose: () => void
  onDelete: (id: string) => void
  onUpdate?: (id: string, updates: { content: string; mood_score: number | null }) => void
}

export default function JournalEntry({ entry, onClose, onDelete, onUpdate }: JournalEntryProps) {
  const t = useT()
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(entry.content)
  const [editMood, setEditMood] = useState<number | null>(entry.mood_score)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/journal?id=${encodeURIComponent(entry.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent, mood_score: editMood }),
      })
      if (res.ok) {
        setIsEditing(false)
        entry.content = editContent
        entry.mood_score = editMood
        onUpdate?.(entry.id, { content: editContent, mood_score: editMood })
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = () => {
    if (confirm(t('journal.deleteConfirm'))) {
      onDelete(entry.id)
      onClose()
    }
  }

  const moodDisplay = entry.mood_score != null ? MOOD_EMOJI[entry.mood_score] ?? `${entry.mood_score}` : '—'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in-up">
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{t('journal.entryTitle')}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-warm-400 hover:text-gray-600 hover:bg-warm-100 transition-colors"
              aria-label={t('common.close')}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full min-h-[120px] px-4 py-3 rounded-xl border border-gray-200 text-gray-800
                  focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 resize-none"
                placeholder={t('journal.contentPlaceholder')}
              />
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">{t('journal.moodScore')}</label>
                <div className="flex gap-1 flex-wrap">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setEditMood(n)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-all
                        ${editMood === n ? 'bg-brand-500 text-white' : 'bg-warm-100 text-gray-600 hover:bg-warm-200'}`}
                    >
                      {MOOD_EMOJI[n]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-white transition-all disabled:opacity-60"
                  style={{
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    boxShadow: '0 2px 8px rgba(22,163,74,0.25)',
                  }}
                >
                  {saving ? t('journal.saving') : t('journal.save')}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setEditContent(entry.content)
                    setEditMood(entry.mood_score)
                  }}
                  className="px-4 py-2.5 rounded-xl font-medium text-gray-600 bg-warm-100 hover:bg-warm-200 transition-colors"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap mb-4">{entry.content}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-2xl" aria-hidden>{moodDisplay}</span>
                {entry.mode && (
                  <span className="px-2.5 py-1 rounded-lg text-sm font-medium bg-brand-50 text-brand-700">
                    {t(`onboarding.mode${entry.mode.charAt(0).toUpperCase() + entry.mode.slice(1)}`)}
                  </span>
                )}
                <span className="text-sm text-warm-400">
                  {new Date(entry.created_at).toLocaleDateString(undefined, {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2.5 rounded-xl font-medium text-brand-700 bg-brand-50 hover:bg-brand-100
                    border border-brand-200 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {t('journal.edit')}
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2.5 rounded-xl font-medium text-red-600 bg-red-50 hover:bg-red-100
                    border border-red-200 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {t('journal.delete')}
                </button>
                <button
                  className="px-4 py-2.5 rounded-xl font-medium text-gray-600 bg-warm-100 hover:bg-warm-200
                    border border-warm-200 transition-colors flex items-center gap-2"
                  title={t('journal.shareAsCard')}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  {t('journal.shareAsCard')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
