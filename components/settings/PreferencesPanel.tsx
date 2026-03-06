'use client'

import { useEffect } from 'react'
import { useT } from '@/lib/i18n'
import { usePreferencesStore } from '@/stores/preferencesStore'

const AVATARS = ['leaf', 'wave', 'mountain', 'sun', 'star', 'tree'] as const
const GUIDANCE_OPTIONS = [
  { value: 'structured' as const, key: 'preferences.guidanceStructured' },
  { value: 'balanced' as const, key: 'preferences.guidanceBalanced' },
  { value: 'open' as const, key: 'preferences.guidanceOpen' },
] as const
const TONE_OPTIONS = [
  { value: 'gentle' as const, key: 'preferences.toneGentle' },
  { value: 'direct' as const, key: 'preferences.toneDirect' },
  { value: 'light_humor' as const, key: 'preferences.toneLightHumor' },
] as const
const AUTO_DELETE_OPTIONS = [
  { value: 0, key: 'preferences.autoDeleteOff' },
  { value: 90, key: 'preferences.autoDelete90' },
  { value: 180, key: 'preferences.autoDelete180' },
  { value: 365, key: 'preferences.autoDelete365' },
] as const

const AVATAR_ICONS: Record<string, string> = {
  leaf: '🍃',
  wave: '🌊',
  mountain: '⛰️',
  sun: '☀️',
  star: '⭐',
  tree: '🌳',
}

export default function PreferencesPanel() {
  const t = useT()
  const { preferences, loading, loadPreferences, updatePreference } = usePreferencesStore()

  useEffect(() => {
    loadPreferences()
  }, [loadPreferences])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-pulse text-gray-400">{t('onboarding.loading')}</div>
      </div>
    )
  }

  const prefs = preferences || {
    guidance_style: 'balanced' as const,
    tone: 'gentle' as const,
    voice_enabled: false,
    avatar: 'leaf',
    auto_delete_days: 0,
  }

  return (
    <div className="space-y-8">
      {/* Guidance style */}
      <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">
          {t('preferences.guidanceStyle')}
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          {t('preferences.guidanceStyleDesc')}
        </p>
        <div className="flex flex-wrap gap-2">
          {GUIDANCE_OPTIONS.map(({ value, key }) => (
            <button
              key={value}
              type="button"
              onClick={() => updatePreference('guidance_style', value)}
              className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all
                ${prefs.guidance_style === value
                  ? 'bg-brand-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {t(key)}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {prefs.guidance_style === 'structured' && t('preferences.guidanceStructuredDesc')}
          {prefs.guidance_style === 'balanced' && t('preferences.guidanceBalancedDesc')}
          {prefs.guidance_style === 'open' && t('preferences.guidanceOpenDesc')}
        </p>
      </section>

      {/* Tone */}
      <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">
          {t('preferences.tone')}
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          {t('preferences.toneDesc')}
        </p>
        <div className="flex flex-wrap gap-2">
          {TONE_OPTIONS.map(({ value, key }) => (
            <button
              key={value}
              type="button"
              onClick={() => updatePreference('tone', value)}
              className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all
                ${prefs.tone === value
                  ? 'bg-brand-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {t(key)}
            </button>
          ))}
        </div>
      </section>

      {/* Voice toggle */}
      <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              {t('preferences.voiceEnabled')}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {t('preferences.voiceEnabledDesc')}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={prefs.voice_enabled}
            onClick={() => updatePreference('voice_enabled', !prefs.voice_enabled)}
            className={`relative w-12 h-7 rounded-full transition-colors
              ${prefs.voice_enabled ? 'bg-brand-500' : 'bg-gray-200'}`}
          >
            <span
              className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all duration-200
                ${prefs.voice_enabled ? 'left-6' : 'left-1'}`}
            />
          </button>
        </div>
      </section>

      {/* Avatar */}
      <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">
          {t('preferences.avatar')}
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          {t('preferences.avatarDesc')}
        </p>
        <div className="grid grid-cols-3 gap-3">
          {AVATARS.map((avatar) => (
            <button
              key={avatar}
              type="button"
              onClick={() => updatePreference('avatar', avatar)}
              className={`flex items-center justify-center w-14 h-14 rounded-full text-2xl
                transition-all border-2
                ${prefs.avatar === avatar
                  ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200'
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
            >
              {AVATAR_ICONS[avatar] || '🌱'}
            </button>
          ))}
        </div>
      </section>

      {/* Auto-delete */}
      <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">
          {t('preferences.autoDelete')}
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          {t('preferences.autoDeleteDesc')}
        </p>
        <select
          value={prefs.auto_delete_days}
          onChange={(e) => updatePreference('auto_delete_days', Number(e.target.value))}
          className="w-full max-w-xs px-4 py-2.5 rounded-xl border border-gray-200 bg-white
            text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
        >
          {AUTO_DELETE_OPTIONS.map(({ value, key }) => (
            <option key={value} value={value}>
              {t(key)}
            </option>
          ))}
        </select>
      </section>
    </div>
  )
}
