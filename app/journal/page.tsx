'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase-browser'
import { useT } from '@/lib/i18n'
import { useModeStore } from '@/stores/modeStore'
import SolviaLogo from '@/components/SolviaLogo'
import AppShell from '@/components/AppShell'
import JournalList, { type JournalEntry } from '@/components/journal/JournalList'
import JournalEntryView from '@/components/journal/JournalEntry'
import JournalComposer from '@/components/journal/JournalComposer'

export default function JournalPage() {
  const t = useT()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [showComposer, setShowComposer] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [filterMood, setFilterMood] = useState<string>('')
  const [filterMode, setFilterMode] = useState<string>('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const { availableModes, loadModes } = useModeStore()

  const fetchEntries = async (reset = false) => {
    const p = reset ? 1 : page
    const params = new URLSearchParams()
    params.set('page', String(p))
    params.set('limit', '20')
    if (filterMood) params.set('mood_score', filterMood)
    if (filterMode) params.set('mode', filterMode)

    const res = await fetch(`/api/journal?${params}`)
    if (!res.ok) return []

    const data = await res.json()
    const list = data.entries ?? []
    if (reset) {
      setEntries(list)
      setPage(1)
    } else {
      setEntries((prev) => (p === 1 ? list : [...prev, ...list]))
    }
    setHasMore(list.length >= 20)
    return list
  }

  useEffect(() => {
    const run = async () => {
      const supabase = createBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/')
        return
      }

      await loadModes()
      await fetchEntries(true)
      setLoading(false)
    }
    run()
  }, [router, loadModes])

  useEffect(() => {
    if (loading) return
    fetchEntries(true)
  }, [filterMood, filterMode])

  const handleCreate = () => setShowComposer(true)

  const handleSave = async (entry: { content: string; mood_score?: number; mode?: string }) => {
    const res = await fetch('/api/journal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    })
    if (res.ok) {
      setShowComposer(false)
      await fetchEntries(true)
    } else {
      throw new Error('Failed to save')
    }
  }

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/journal?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    if (res.ok) {
      setEntries((prev) => prev.filter((e) => e.id !== id))
      setSelectedEntry(null)
    }
  }

  const handleUpdate = (id: string, updates: { content: string; mood_score: number | null }) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    )
    setSelectedEntry((s) => (s && s.id === id ? { ...s, ...updates } : s))
  }

  const modes = availableModes.length > 0 ? availableModes : ['conflict', 'breakup', 'loneliness', 'calm']

  if (loading) {
    return (
      <AppShell>
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="animate-pulse">
            <SolviaLogo size={48} className="text-brand-500" />
          </div>
          <p className="mt-4 text-sm text-gray-500">{t('journal.loading')}</p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-gray-900">{t('journal.heading')}</h1>
            <button
              onClick={handleCreate}
              className="px-4 py-2.5 rounded-xl font-semibold text-white transition-all hover:brightness-110"
              style={{
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                boxShadow: '0 2px 8px rgba(22,163,74,0.25)',
              }}
            >
              {t('journal.newEntry')}
            </button>
          </div>

          <div className="flex gap-2 mb-4 flex-wrap">
            <select
              value={filterMood}
              onChange={(e) => setFilterMood(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-700
                focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            >
              <option value="">{t('journal.filterMood')}</option>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={String(n)}>
                  {n}/10
                </option>
              ))}
            </select>
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-700
                focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            >
              <option value="">{t('journal.filterMode')}</option>
              {modes.map((m) => (
                <option key={m} value={m}>
                  {t(`onboarding.mode${m.charAt(0).toUpperCase() + m.slice(1)}`)}
                </option>
              ))}
            </select>
          </div>

          {showComposer ? (
            <div className="mb-6">
              <JournalComposer
                onSave={handleSave}
                onCancel={() => setShowComposer(false)}
                activeModes={availableModes}
              />
            </div>
          ) : null}

          {entries.length === 0 ? (
            <div className="rounded-2xl bg-white/80 border border-gray-200 p-8 text-center">
              <p className="text-gray-500">{t('journal.empty')}</p>
              <button
                onClick={handleCreate}
                className="mt-4 px-4 py-2 rounded-xl font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors"
              >
                {t('journal.newEntry')}
              </button>
            </div>
          ) : (
            <JournalList
              entries={entries}
              onDelete={handleDelete}
              onSelect={setSelectedEntry}
            />
          )}
        </div>
      </div>

      {selectedEntry && (
        <JournalEntryView
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
        />
      )}
    </AppShell>
  )
}
