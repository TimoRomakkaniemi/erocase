'use client'

import { useState, useEffect } from 'react'
import { useT } from '@/lib/i18n'

interface ShareCardComposerProps {
  journalContent: string
  journalId: string
  spaceId: string
  onSent: () => void
  onCancel: () => void
}

export default function ShareCardComposer({
  journalContent,
  journalId,
  spaceId,
  onSent,
  onCancel,
}: ShareCardComposerProps) {
  const t = useT()
  const [safeContent, setSafeContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const generate = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/cards/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: journalContent }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || t('cards.generateError'))
          setSafeContent(journalContent.slice(0, 200))
          return
        }
        if (!cancelled) {
          setSafeContent(data.safe_content || '')
        }
      } catch (err) {
        if (!cancelled) {
          setError(t('errors.connectionError', { details: String(err) }))
          setSafeContent(journalContent.slice(0, 200))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    generate()
    return () => {
      cancelled = true
    }
  }, [journalContent, t])

  const handleSend = async () => {
    if (!safeContent.trim()) return
    setSending(true)
    setError(null)
    try {
      const res = await fetch('/api/cards/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          space_id: spaceId,
          source_journal_id: journalId,
          original_content: journalContent,
          safe_content: safeContent.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || data.message || t('errors.httpError', { status: res.status, details: '' }))
        return
      }
      onSent()
    } catch (err) {
      setError(t('errors.connectionError', { details: String(err) }))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="rounded-2xl border border-warm-200 bg-white p-4 shadow-sm">
      <h3 className="mb-4 font-semibold text-gray-900">{t('cards.composeTitle')}</h3>

      {loading ? (
        <p className="text-gray-500">{t('cards.generating')}</p>
      ) : (
        <>
          <p className="mb-2 text-sm text-gray-600">{t('cards.previewLabel')}</p>
          <textarea
            value={safeContent}
            onChange={(e) => setSafeContent(e.target.value)}
            placeholder={t('cards.previewPlaceholder')}
            rows={4}
            maxLength={500}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 resize-none"
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-xl border border-gray-200 px-4 py-3 font-medium text-gray-700
                hover:bg-warm-50 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || !safeContent.trim()}
              className="flex-1 rounded-xl bg-brand-500 px-4 py-3 font-semibold text-white
                hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? t('cards.sending') : t('cards.send')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
