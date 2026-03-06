'use client'

import { useEffect } from 'react'
import { useT } from '@/lib/i18n'
import { usePreferencesStore } from '@/stores/preferencesStore'

const OPTIONS = [
  { value: 0, key: 'privacy.autoDeleteOff' },
  { value: 90, key: 'privacy.autoDelete90' },
  { value: 180, key: 'privacy.autoDelete180' },
  { value: 365, key: 'privacy.autoDelete365' },
] as const

export default function AutoDeleteSettings() {
  const t = useT()
  const { preferences, loadPreferences, updatePreference } = usePreferencesStore()

  useEffect(() => {
    loadPreferences()
  }, [loadPreferences])

  const current = preferences?.auto_delete_days ?? 0

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">{t('privacy.autoDeleteDescription')}</p>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('privacy.autoDelete')}
        </label>
        <select
          value={current}
          onChange={(e) => updatePreference('auto_delete_days', parseInt(e.target.value, 10))}
          className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white
            focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        >
          {OPTIONS.map(({ value, key }) => (
            <option key={value} value={value}>
              {t(key)}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
