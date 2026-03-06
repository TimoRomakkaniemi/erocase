'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase-browser'
import { useT } from '@/lib/i18n'
import { useSharedStore } from '@/stores/sharedStore'
import SolviaLogo from '@/components/SolviaLogo'
import AppShell from '@/components/AppShell'
import SpaceCard from '@/components/shared/SpaceCard'
import CreateSpaceModal from '@/components/shared/CreateSpaceModal'

export default function SpacePage() {
  const t = useT()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { spaces, loadSpaces, createSpace } = useSharedStore()

  useEffect(() => {
    const run = async () => {
      const supabase = createBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/')
        return
      }
      await loadSpaces()
      setLoading(false)
    }
    run()
  }, [router, loadSpaces])

  const handleCreate = async (type: 'partner' | 'friend') => {
    return createSpace(type)
  }

  const activeSpaces = spaces.filter((s) => s.status !== 'archived')
  const hasPartner = activeSpaces.some((s) => s.type === 'partner')
  const hasFriend = activeSpaces.some((s) => s.type === 'friend')

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
          <h1 className="text-xl font-bold text-gray-900 mb-6">{t('shared.title')}</h1>

          {activeSpaces.length === 0 ? (
            <div className="rounded-2xl bg-white/80 border border-gray-200 p-8 text-center">
              <p className="text-gray-500">{t('shared.noSpaces')}</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 px-5 py-2.5 rounded-xl font-semibold text-white transition-all"
                style={{
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  boxShadow: '0 2px 8px rgba(22,163,74,0.25)',
                }}
              >
                {t('shared.createPartner')}
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-8">
                {activeSpaces.map((space) => (
                  <SpaceCard key={space.id} space={space} />
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                {!hasPartner && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-gray-700 bg-warm-100 border border-warm-200 hover:bg-warm-200 transition-colors"
                  >
                    <span>💕</span>
                    {t('shared.createPartner')}
                  </button>
                )}
                {!hasFriend && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-gray-700 bg-warm-100 border border-warm-200 hover:bg-warm-200 transition-colors"
                  >
                    <span>🤝</span>
                    {t('shared.createFriend')}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateSpaceModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
          hasPartner={hasPartner}
          hasFriend={hasFriend}
        />
      )}
    </AppShell>
  )
}
