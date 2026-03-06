'use client'

import { useState } from 'react'
import { useT } from '@/lib/i18n'

interface TranscriptPreviewProps {
  transcript: string
  onSend: (text: string) => void
  onRerecord: () => void
  onCancel: () => void
}

export default function TranscriptPreview({
  transcript,
  onSend,
  onRerecord,
  onCancel,
}: TranscriptPreviewProps) {
  const t = useT()
  const [editedText, setEditedText] = useState(transcript)

  const handleSend = () => {
    const trimmed = editedText.trim()
    if (trimmed) {
      onSend(trimmed)
    }
  }

  return (
    <div
      className="rounded-2xl bg-white border border-gray-200 shadow-lg overflow-hidden animate-fade-in-up"
      style={{
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      }}
    >
      <div className="p-4">
        <label className="block text-xs font-medium text-gray-500 mb-2">
          {t('voice.transcript')}
        </label>
        <textarea
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          placeholder={t('voice.transcriptPlaceholder')}
          className="w-full min-h-[80px] px-4 py-3 rounded-xl border border-gray-200 text-gray-800
            placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400
            resize-none text-sm"
        />

        <div className="flex gap-2 mt-3 flex-wrap">
          <button
            onClick={handleSend}
            disabled={!editedText.trim()}
            className="flex-1 min-w-[100px] py-2.5 rounded-xl font-semibold text-white transition-all
              disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: editedText.trim()
                ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                : 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
              boxShadow: editedText.trim() ? '0 2px 8px rgba(22,163,74,0.25)' : 'none',
            }}
          >
            {t('common.send')}
          </button>
          <button
            onClick={onRerecord}
            className="px-4 py-2.5 rounded-xl font-medium text-gray-600 bg-warm-100 hover:bg-warm-200
              transition-colors"
          >
            {t('voice.rerecord')}
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl font-medium text-warm-500 hover:bg-warm-100 transition-colors"
          >
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}
