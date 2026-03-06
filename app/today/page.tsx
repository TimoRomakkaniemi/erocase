'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase-browser'
import { useT } from '@/lib/i18n'
import { useTodayStore } from '@/stores/todayStore'
import { useModeStore } from '@/stores/modeStore'
import TodayFlow from '@/components/today/TodayFlow'
import SolviaLogo from '@/components/SolviaLogo'

function getTodayRange() {
  const now = new Date()
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  const end = new Date(now)
  end.setHours(23, 59, 59, 999)
  return { start: start.toISOString(), end: end.toISOString() }
}

export default function TodayPage() {
  const t = useT()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [doneToday, setDoneToday] = useState(false)
  const [session, setSession] = useState<{
    id: string
    mode: string
    check_in_score: number | null
    check_in_word: string | null
    exercise_id: string | null
    action_text: string | null
    created_at: string
  } | null>(null)
  const [mode, setMode] = useState<string | null>(null)

  const { startToday, isActive } = useTodayStore()
  const { availableModes, loadModes } = useModeStore()

  useEffect(() => {
    const run = async () => {
      const supabase = createBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/')
        return
      }

      await loadModes()
      const { start, end } = getTodayRange()

      const res = await fetch(`/api/today?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`)
      if (res.ok) {
        const data = await res.json()
        setDoneToday(data.doneToday)
        setSession(data.session)
      }
      setLoading(false)
    }
    run()
  }, [router, loadModes])

  const handleStartToday = (selectedMode: string) => {
    setMode(selectedMode)
    startToday(selectedMode)
  }

  const handleRedo = () => {
    if (mode) {
      startToday(mode)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen chat-bg flex flex-col items-center justify-center">
        <div className="animate-pulse">
          <SolviaLogo size={48} className="text-brand-500" />
        </div>
        <p className="mt-4 text-sm text-gray-500">{t('today.loading')}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen chat-bg flex flex-col">
      {/* Header / NavBar */}
      <header className="flex-shrink-0 sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/demo"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <SolviaLogo size={28} />
            <span className="font-bold text-base text-gray-900">Solvia</span>
          </Link>
          <span className="text-sm font-medium text-brand-600">Today</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col min-h-0 pt-6">
        {isActive ? (
          <TodayFlow />
        ) : doneToday && session ? (
          <TodaySummary
            session={session}
            onRedo={handleRedo}
            onStartToday={handleStartToday}
            availableModes={availableModes}
            t={t}
          />
        ) : (
          <TodayStart
            onStartToday={handleStartToday}
            availableModes={availableModes}
            t={t}
          />
        )}
      </main>
    </div>
  )
}

interface TodaySummaryProps {
  session: {
    mode: string
    check_in_score: number | null
    check_in_word: string | null
    exercise_id: string | null
    action_text: string | null
  }
  onRedo: () => void
  onStartToday: (mode: string) => void
  availableModes: string[]
  t: (key: string, vars?: Record<string, string | number>) => string
}

function TodaySummary({ session, onRedo, onStartToday, availableModes, t }: TodaySummaryProps) {
  const [showModeSelect, setShowModeSelect] = useState(false)

  const handleRedoClick = () => {
    if (availableModes.length === 1) {
      onStartToday(availableModes[0])
    } else {
      setShowModeSelect(true)
    }
  }

  if (showModeSelect) {
    return (
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-8">
        <div className="max-w-md mx-auto animate-fade-in-up">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            {t('today.summary.redoMode')}
          </h2>
          <div className="space-y-2">
            {availableModes.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  onStartToday(m)
                  setShowModeSelect(false)
                }}
                className="w-full py-4 px-4 rounded-xl font-medium text-gray-800 bg-white border border-gray-200
                  hover:bg-brand-50 hover:border-brand-200 transition-all text-left"
              >
                {t(`onboarding.mode${m.charAt(0).toUpperCase() + m.slice(1)}`)}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowModeSelect(false)}
            className="w-full mt-4 py-3 rounded-xl text-gray-600 hover:bg-warm-100"
          >
            {t('today.back')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-8">
      <div className="max-w-md mx-auto animate-fade-in-up">
        <div className="text-center mb-6">
          <span className="text-4xl block mb-2" aria-hidden>✓</span>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {t('today.summary.heading')}
          </h2>
          <p className="text-gray-600 text-sm">
            {t('today.summary.subheading')}
          </p>
        </div>

        <div className="rounded-2xl bg-white/80 border border-gray-200/80 shadow-sm p-6 mb-6">
          <div className="space-y-4">
            {session.check_in_score != null && (
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {t('today.complete.scoreLabel')}
                </span>
                <p className="text-gray-900 font-medium">
                  {session.check_in_score}/10
                  {session.check_in_word ? ` — ${session.check_in_word}` : ''}
                </p>
              </div>
            )}
            {session.action_text && (
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {t('today.complete.actionLabel')}
                </span>
                <p className="text-gray-900 font-medium">{session.action_text}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleRedoClick}
            className="w-full py-4 rounded-xl font-semibold text-brand-700 bg-brand-50 border border-brand-200
              hover:bg-brand-100 transition-all"
          >
            {t('today.summary.redo')}
          </button>
          <Link
            href="/demo"
            className="w-full py-4 rounded-xl font-semibold text-white text-center transition-all hover:brightness-110"
            style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              boxShadow: '0 4px 12px rgba(34,197,94,0.3)',
            }}
          >
            {t('today.complete.continueChat')}
          </Link>
        </div>
      </div>
    </div>
  )
}

interface TodayStartProps {
  onStartToday: (mode: string) => void
  availableModes: string[]
  t: (key: string, vars?: Record<string, string | number>) => string
}

function TodayStart({ onStartToday, availableModes, t }: TodayStartProps) {
  const [showModeSelect, setShowModeSelect] = useState(false)

  const modes = availableModes.length > 0 ? availableModes : ['conflict', 'breakup', 'loneliness', 'calm']

  const handleStart = (m: string) => {
    onStartToday(m)
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-8">
      <div className="max-w-md mx-auto animate-fade-in-up">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {t('today.start.heading')}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            {t('today.start.subheading')}
          </p>
        </div>

        <div className="space-y-2">
          {modes.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => handleStart(m)}
              className="w-full py-4 px-4 rounded-xl font-medium text-gray-800 bg-white border border-gray-200
                hover:bg-brand-50 hover:border-brand-200 transition-all text-left flex items-center gap-3"
            >
              <span className="text-2xl">
                {m === 'conflict' && '🔥'}
                {m === 'breakup' && '💔'}
                {m === 'loneliness' && '🕊️'}
                {m === 'calm' && '🌙'}
              </span>
              {t(`onboarding.mode${m.charAt(0).toUpperCase() + m.slice(1)}`)}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
