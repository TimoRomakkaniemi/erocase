'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase-browser'
import { useT } from '@/lib/i18n'
import AppShell from '@/components/AppShell'
import PreferencesPanel from '@/components/settings/PreferencesPanel'
import { useModeStore } from '@/stores/modeStore'

const MODES = [
  { mode: 'conflict', key: 'sos.modeConflict', emoji: '🔥' },
  { mode: 'breakup', key: 'sos.modeBreakup', emoji: '💔' },
  { mode: 'loneliness', key: 'sos.modeLoneliness', emoji: '🕊️' },
  { mode: 'calm', key: 'sos.modeCalm', emoji: '🌙' },
] as const

export default function SettingsPage() {
  const t = useT()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const { availableModes, loadModes, addMode, removeMode } = useModeStore()

  useEffect(() => {
    const run = async () => {
      const supabase = createBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login')
        return
      }
      await loadModes()
      setLoading(false)
    }
    run()
  }, [router, loadModes])

  const toggleMode = async (mode: string) => {
    const isActive = availableModes.includes(mode)
    if (isActive) {
      await removeMode(mode)
    } else {
      await addMode(mode)
    }
  }

  return (
    <AppShell>
      <div className="py-8 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
            {t('settings.title')}
          </h1>

          {loading ? (
            <div className="text-center py-16 text-gray-400">{t('onboarding.loading')}</div>
          ) : (
            <div className="space-y-10">
              {/* Preferences */}
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('settings.preferences')}
                </h2>
                <PreferencesPanel />
              </section>

              {/* Mode management */}
              <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('settings.modes')}
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  {t('settings.modesDesc')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {MODES.map(({ mode, key, emoji }) => {
                    const isActive = availableModes.includes(mode)
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => toggleMode(mode)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all
                          ${isActive
                            ? 'bg-brand-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                      >
                        <span>{emoji}</span>
                        {t(key)}
                      </button>
                    )
                  })}
                </div>
              </section>

              {/* Privacy Center */}
              <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('settings.privacy')}
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  {t('settings.privacyDesc')}
                </p>
                <Link
                  href="/privacy"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                    text-brand-600 bg-brand-50 border border-brand-200 hover:bg-brand-100 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  {t('settings.privacyCenter')}
                </Link>
              </section>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
