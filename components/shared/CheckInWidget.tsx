'use client'

import { useState, useEffect } from 'react'
import { useT } from '@/lib/i18n'

interface CheckInData {
  id: string
  user_id: string
  score: number
  word: string
  is_shared: boolean
  created_at: string
  display_name?: string
}

interface CheckInWidgetProps {
  spaceId: string
}

function todayDateStr() {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

export default function CheckInWidget({ spaceId }: CheckInWidgetProps) {
  const t = useT()
  const [score, setScore] = useState(5)
  const [word, setWord] = useState('')
  const [isShared, setIsShared] = useState(true)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [myCheckIn, setMyCheckIn] = useState<CheckInData | null>(null)
  const [partnerCheckIn, setPartnerCheckIn] = useState<CheckInData | null>(null)
  const [date, setDate] = useState(todayDateStr())

  const fetchCheckIns = async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/shared/checkins?space_id=${encodeURIComponent(spaceId)}&date=${date}`
      )
      if (!res.ok) {
        setMyCheckIn(null)
        setPartnerCheckIn(null)
        return
      }
      const data = await res.json()
      setMyCheckIn(data.mine ?? null)
      setPartnerCheckIn(data.partner ?? null)
    } catch {
      setMyCheckIn(null)
      setPartnerCheckIn(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCheckIns()
  }, [spaceId, date])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!word.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/shared/checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          space_id: spaceId,
          score,
          word: word.trim(),
          is_shared: isShared,
        }),
      })
      if (res.ok) {
        setWord('')
        setScore(5)
        fetchCheckIns()
      }
    } catch {
      // ignore
    } finally {
      setSubmitting(false)
    }
  }

  const showPartner = partnerCheckIn != null
  const hasCheckedIn = myCheckIn != null

  return (
    <div className="rounded-2xl border border-warm-200 bg-white p-4 shadow-sm">
      <h3 className="mb-4 font-semibold text-gray-900">{t('checkin.title')}</h3>

      {!hasCheckedIn ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('checkin.score')} (0–10)
            </label>
            <div className="flex items-center gap-3">
              <span className="text-xl" aria-hidden>😢</span>
              <input
                type="range"
                min={0}
                max={10}
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                className="flex-1 h-3 rounded-full appearance-none cursor-pointer accent-brand-500"
                style={{
                  background: `linear-gradient(to right, #ef4444 0%, #fbbf24 50%, #22c55e 100%)`,
                }}
              />
              <span className="text-xl" aria-hidden>😊</span>
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>0</span>
              <span className="font-semibold text-brand-600">{score}</span>
              <span>10</span>
            </div>
          </div>
          <div>
            <label htmlFor="checkin-word" className="block text-sm font-medium text-gray-700 mb-1">
              {t('checkin.word')}
            </label>
            <input
              id="checkin-word"
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder={t('checkin.wordPlaceholder')}
              maxLength={30}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isShared}
              onChange={(e) => setIsShared(e.target.checked)}
              className="rounded border-gray-300 text-brand-500 focus:ring-brand-500"
            />
            <span className="text-sm text-gray-700">{t('checkin.shareWithPartner')}</span>
          </label>
          <button
            type="submit"
            disabled={submitting || !word.trim()}
            className="w-full rounded-xl bg-brand-500 py-3 font-semibold text-white
              hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? t('checkin.submitting') : t('checkin.submit')}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl bg-brand-50 p-3">
            <p className="text-sm text-gray-600">{t('checkin.yourCheckIn')}</p>
            <p className="font-semibold text-gray-900">
              {myCheckIn!.score}/10 — {myCheckIn!.word}
            </p>
          </div>
          {showPartner ? (
            <div className="rounded-xl bg-sage-50 p-3">
              <p className="text-sm text-gray-600">
                {t('checkin.partnerCheckIn')}
                {partnerCheckIn!.display_name && ` (${partnerCheckIn.display_name})`}
              </p>
              <p className="font-semibold text-gray-900">
                {partnerCheckIn!.score}/10 — {partnerCheckIn!.word}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">{t('checkin.waitingForPartner')}</p>
          )}
        </div>
      )}

      {loading && !hasCheckedIn && (
        <p className="mt-2 text-sm text-gray-500">{t('checkin.loading')}</p>
      )}
    </div>
  )
}
