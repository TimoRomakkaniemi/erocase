'use client'

import { useState } from 'react'
import { useT } from '@/lib/i18n'

interface CheckInProps {
  onComplete: (score: number, word: string) => void
}

export default function CheckIn({ onComplete }: CheckInProps) {
  const t = useT()
  const [score, setScore] = useState<number>(5)
  const [word, setWord] = useState('')

  const canContinue = word.trim().length > 0

  const handleSubmit = () => {
    if (!canContinue) return
    onComplete(score, word.trim())
  }

  return (
    <div className="animate-fade-in-up max-w-md mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 text-center">
        {t('today.checkIn.heading')}
      </h2>
      <p className="text-gray-600 text-sm sm:text-base mb-8 text-center">
        {t('today.checkIn.subheading')}
      </p>

      {/* 0-10 slider with emoji markers */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-2xl" aria-hidden>😢</span>
          <span className="text-2xl" aria-hidden>😐</span>
          <span className="text-2xl" aria-hidden>😊</span>
        </div>
        <input
          type="range"
          min={0}
          max={10}
          value={score}
          onChange={(e) => setScore(Number(e.target.value))}
          className="w-full h-3 rounded-full appearance-none cursor-pointer accent-brand-500"
          style={{
            background: `linear-gradient(to right, #ef4444 0%, #fbbf24 50%, #22c55e 100%)`,
          }}
        />
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>0</span>
          <span className="font-semibold text-brand-600">{score}</span>
          <span>10</span>
        </div>
      </div>

      {/* One word input */}
      <div className="mb-8">
        <label htmlFor="checkin-word" className="block text-sm font-medium text-gray-700 mb-2">
          {t('today.checkIn.wordLabel')}
        </label>
        <input
          id="checkin-word"
          type="text"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          placeholder={t('today.checkIn.wordPlaceholder')}
          maxLength={30}
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
        {t('today.checkIn.continue')}
      </button>
    </div>
  )
}
