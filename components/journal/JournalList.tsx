'use client'

import { useT } from '@/lib/i18n'

export interface JournalEntry {
  id: string
  user_id: string
  conversation_id: string | null
  content: string
  mood_score: number | null
  mode: string | null
  auto_delete_at: string | null
  created_at: string
}

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

function getMoodDisplay(score: number | null): string {
  if (score == null) return '—'
  return MOOD_EMOJI[score] ?? `${score}`
}

function truncate(str: string, max: number): string {
  if (str.length <= max) return str
  return str.slice(0, max).trim() + '…'
}

interface JournalListProps {
  entries: JournalEntry[]
  onDelete: (id: string) => void
  onSelect: (entry: JournalEntry) => void
}

export default function JournalList({ entries, onDelete, onSelect }: JournalListProps) {
  const t = useT()

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="rounded-2xl bg-white border border-gray-200/80 shadow-sm overflow-hidden
            hover:border-brand-200/60 hover:shadow-md transition-all cursor-pointer
            active:scale-[0.99] touch-manipulation"
          onClick={() => onSelect(entry)}
        >
          <div className="p-4">
            <p className="text-gray-800 text-sm leading-relaxed line-clamp-2 mb-3">
              {truncate(entry.content, 100)}
            </p>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg" title={t('journal.moodScore')} aria-hidden>
                  {getMoodDisplay(entry.mood_score)}
                </span>
                {entry.mode && (
                  <span
                    className="px-2 py-0.5 rounded-lg text-xs font-medium bg-brand-50 text-brand-700"
                  >
                    {t(`onboarding.mode${entry.mode.charAt(0).toUpperCase() + entry.mode.slice(1)}`)}
                  </span>
                )}
                <span className="text-xs text-warm-400">
                  {new Date(entry.created_at).toLocaleDateString(undefined, {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(entry.id)
                }}
                className="p-2 rounded-lg text-warm-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                title={t('journal.delete')}
                aria-label={t('journal.delete')}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
