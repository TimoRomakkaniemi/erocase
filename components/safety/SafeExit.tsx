'use client'

import { useT } from '@/lib/i18n'

const NEUTRAL_EXIT_URL = 'https://www.google.com/search?q=weather'

export function SafeExit() {
  const t = useT()

  const handleSafeExit = () => {
    window.location.replace(NEUTRAL_EXIT_URL)
  }

  return (
    <button
      type="button"
      onClick={handleSafeExit}
      className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-amber-500/50 bg-amber-500/15 px-6 py-4 text-lg font-bold text-amber-900 transition hover:bg-amber-500/25 hover:border-amber-500/70 active:scale-[0.98]"
      style={{ minHeight: 56 }}
    >
      <svg className="h-6 w-6 flex-shrink-0 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
      <span>{t('safety.safeExit')}</span>
    </button>
  )
}
