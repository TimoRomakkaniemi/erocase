'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase-browser'
import { useT } from '@/lib/i18n'
import { useSharedStore } from '@/stores/sharedStore'
import SolviaLogo from '@/components/SolviaLogo'
import TaskList from '@/components/shared/TaskList'
import CheckInWidget from '@/components/shared/CheckInWidget'
import JointSummary from '@/components/shared/JointSummary'
import ShareCardView from '@/components/shared/ShareCardView'
import { DVLockBanner } from '@/components/safety/DVLockBanner'

type Tab = 'tasks' | 'checkins' | 'summary' | 'cards'

function SpaceCards({ spaceId }: { spaceId: string }) {
  const t = useT()
  const [cards, setCards] = useState<Array<{
    id: string; sender_id: string; space_id: string; source_journal_id: string | null;
    safe_content: string; status: string; reply_conversation_id: string | null;
    revoked_at: string | null; created_at: string; sender_name?: string | null
  }>>([])

  useEffect(() => {
    fetch(`/api/cards/send?space_id=${spaceId}`)
      .then(r => r.json())
      .then(d => setCards(d.cards || []))
      .catch(() => {})
  }, [spaceId])

  if (cards.length === 0) {
    return <p className="text-gray-500 text-sm">{t('cards.noCards')}</p>
  }

  return (
    <div className="space-y-3">
      {cards.map(card => (
        <ShareCardView key={card.id} card={card} />
      ))}
    </div>
  )
}

export default function SpaceDetailPage() {
  const t = useT()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('tasks')
  const [dvLock, setDvLock] = useState<{ id: string; space_id: string } | null>(null)
  const { spaces, loadSpaces } = useSharedStore()

  useEffect(() => {
    const run = async () => {
      const supabase = createBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/')
        return
      }
      await loadSpaces()
      const locksRes = await fetch('/api/triage?active=true')
      if (locksRes.ok) {
        const { locks } = await locksRes.json()
        const lockForSpace = (locks ?? []).find((l: { space_id: string }) => l.space_id === id)
        setDvLock(lockForSpace ?? null)
      }
      setLoading(false)
    }
    run()
  }, [router, loadSpaces, id])

  const space = spaces.find((s) => s.id === id)
  const partnerName = space?.members
    .filter((m) => m.role !== 'creator')
    .map((m) => m.display_name || m.email || t('shared.partnerSpace'))
    .join(', ') || t('shared.pending')

  const typeLabel = space?.type === 'partner' ? t('shared.partnerSpace') : t('shared.friendSpace')

  const tabs: { key: Tab; label: string }[] = [
    { key: 'tasks', label: t('shared.tabTasks') },
    { key: 'checkins', label: t('shared.tabCheckins') },
    { key: 'summary', label: t('shared.tabSummary') },
    { key: 'cards', label: t('shared.tabCards') },
  ]

  if (loading) {
    return (
      <div className="min-h-screen chat-bg flex flex-col items-center justify-center">
        <div className="animate-pulse">
          <SolviaLogo size={48} className="text-brand-500" />
        </div>
        <p className="mt-4 text-sm text-gray-500">{t('journal.loading')}</p>
      </div>
    )
  }

  if (!space) {
    return (
      <div className="min-h-screen chat-bg flex flex-col items-center justify-center p-4">
        <p className="text-gray-500">{t('shared.spaceNotFound')}</p>
        <Link
          href="/space"
          className="mt-4 px-4 py-2 rounded-xl font-medium text-brand-600 bg-brand-50 hover:bg-brand-100"
        >
          {t('shared.backToSpaces')}
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen chat-bg flex flex-col">
      <header className="flex-shrink-0 sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/space"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <SolviaLogo size={28} />
            <span className="font-bold text-base text-gray-900">Solvia</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-2xl mx-auto">
          {dvLock && (
            <div className="mb-6">
              <DVLockBanner
                spaceId={id}
                onUnlock={async () => {
                  const res = await fetch('/api/triage', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'dv_unlock', lock_id: dvLock.id }),
                  })
                  if (res.ok) setDvLock(null)
                }}
              />
            </div>
          )}

          <div className="mb-6">
            <p className="text-xs font-medium uppercase tracking-wide text-warm-500">{typeLabel}</p>
            <h1 className="text-xl font-bold text-gray-900">{partnerName}</h1>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  tab === key
                    ? 'bg-brand-500 text-white'
                    : 'bg-warm-100 text-gray-600 hover:bg-warm-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-6 min-h-[200px]">
            {tab === 'tasks' && <TaskList spaceId={id} />}
            {tab === 'checkins' && <CheckInWidget spaceId={id} />}
            {tab === 'summary' && <JointSummary spaceId={id} />}
            {tab === 'cards' && <SpaceCards spaceId={id} />}
          </div>
        </div>
      </main>
    </div>
  )
}
