'use client'

import { useState, useEffect } from 'react'
import { useT } from '@/lib/i18n'

interface JointSummaryProps {
  spaceId: string
}

interface SummaryData {
  id: string
  content: string
  generation_mode: string
  consent_a: boolean
  consent_b: boolean
  revoked_at: string | null
  created_at: string
}

export default function JointSummary({ spaceId }: JointSummaryProps) {
  const t = useT()
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [currentUserConsented, setCurrentUserConsented] = useState(false)
  const [partnerConsented, setPartnerConsented] = useState(false)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSummary = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/shared/summary?space_id=${encodeURIComponent(spaceId)}`)
      if (!res.ok) {
        setSummary(null)
        return
      }
      const data = await res.json()
      setSummary(data.summary)
      setCurrentUserConsented(data.current_user_consented ?? false)
      setPartnerConsented(data.partner_consented ?? false)
    } catch {
      setSummary(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSummary()
  }, [spaceId])

  const handleGenerate = async () => {
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch('/api/shared/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ space_id: spaceId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t('summary.generateError'))
        return
      }
      if (data.content && data.content !== '[Pending consent]') {
        setSummary(data)
      }
      await fetchSummary()
    } catch (err) {
      setError(t('errors.connectionError', { details: String(err) }))
    } finally {
      setGenerating(false)
    }
  }

  const handleRevoke = async () => {
    if (!summary?.id) return
    try {
      const res = await fetch('/api/shared/summary', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary_id: summary.id }),
      })
      if (res.ok) {
        await fetchSummary()
      }
    } catch {
      // ignore
    }
  }

  const isRevoked = summary?.revoked_at != null
  const hasRealContent = summary?.content && summary.content !== '[Pending consent]'
  const bothConsented = currentUserConsented && partnerConsented

  const formatDate = (d: string) => {
    const date = new Date(d)
    return date.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-warm-200 bg-white p-4 shadow-sm">
        <p className="text-center text-gray-500">{t('summary.loading')}</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-warm-200 bg-white p-4 shadow-sm">
      <h3 className="mb-4 font-semibold text-gray-900">{t('summary.title')}</h3>

      {hasRealContent && !isRevoked ? (
        <div className="space-y-4">
          <div className="rounded-xl bg-sage-50 p-4">
            <p className="whitespace-pre-wrap text-gray-900">{summary.content}</p>
            <p className="mt-2 text-xs text-gray-500">{formatDate(summary.created_at)}</p>
          </div>
          <button
            type="button"
            onClick={handleRevoke}
            className="text-sm text-amber-600 hover:text-amber-700"
          >
            {t('summary.revoke')}
          </button>
        </div>
      ) : isRevoked ? (
        <p className="text-sm text-gray-500">{t('summary.revoked')}</p>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">{t('summary.consentDesc')}</p>
          <div className="flex flex-wrap gap-2 text-sm">
            <span
              className={`rounded-full px-2.5 py-0.5 ${
                currentUserConsented ? 'bg-brand-100 text-brand-800' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {t('summary.you')}: {currentUserConsented ? t('summary.consented') : t('summary.notConsented')}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 ${
                partnerConsented ? 'bg-brand-100 text-brand-800' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {t('summary.partner')}: {partnerConsented ? t('summary.consented') : t('summary.notConsented')}
            </span>
          </div>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="w-full rounded-xl bg-brand-500 py-3 font-semibold text-white
              hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {generating
              ? t('summary.generating')
              : currentUserConsented
                ? bothConsented
                  ? t('summary.generate')
                  : t('summary.waitingForPartner')
                : t('summary.consentAndGenerate')}
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      )}
    </div>
  )
}
