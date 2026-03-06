'use client'

import { useEffect, useState } from 'react'

interface Settings {
  free_daily_messages?: number
  maintenance_mode?: boolean
  feature_flags?: Record<string, boolean>
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(data => {
        setSettings({
          free_daily_messages: typeof data.settings.free_daily_messages === 'number' ? data.settings.free_daily_messages : 3,
          maintenance_mode: data.settings.maintenance_mode === true,
          feature_flags: typeof data.settings.feature_flags === 'object' ? data.settings.feature_flags : { sos: true, today: true, journal: true, shared_space: true, voice: true },
        })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const saveSetting = async (key: string, value: unknown) => {
    setSaving(key)
    await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    })
    setSaving(null)
  }

  const updateMessages = async (val: number) => {
    setSettings(s => ({ ...s, free_daily_messages: val }))
    await saveSetting('free_daily_messages', val)
  }

  const toggleMaintenance = async () => {
    const next = !settings.maintenance_mode
    setSettings(s => ({ ...s, maintenance_mode: next }))
    await saveSetting('maintenance_mode', next)
  }

  const toggleFeature = async (feature: string) => {
    const flags = { ...settings.feature_flags }
    flags[feature] = !flags[feature]
    setSettings(s => ({ ...s, feature_flags: flags }))
    await saveSetting('feature_flags', flags)
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="h-40 bg-gray-200 rounded-xl" />
          <div className="h-40 bg-gray-200 rounded-xl" />
        </div>
      </div>
    )
  }

  const features = [
    { key: 'sos', label: 'SOS Protocol' },
    { key: 'today', label: 'Today Loop' },
    { key: 'journal', label: 'Journal' },
    { key: 'shared_space', label: 'Shared Space' },
    { key: 'voice', label: 'Voice Input' },
  ]

  return (
    <div className="p-6 sm:p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">System Settings</h1>

      {/* Free tier messages */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-2">Free Tier Daily Messages</h2>
        <p className="text-xs text-gray-500 mb-4">Maximum number of messages free users can send per day</p>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={0}
            max={100}
            value={settings.free_daily_messages || 3}
            onChange={(e) => updateMessages(parseInt(e.target.value) || 0)}
            className="w-24 px-3 py-2 rounded-lg text-sm border border-gray-200 outline-none focus:ring-2 focus:ring-brand-500/30"
          />
          <span className="text-sm text-gray-400">messages/day</span>
          {saving === 'free_daily_messages' && <span className="text-xs text-brand-500">Saving...</span>}
        </div>
      </div>

      {/* Maintenance mode */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Maintenance Mode</h2>
            <p className="text-xs text-gray-500 mt-1">When enabled, users see a maintenance message</p>
          </div>
          <button
            onClick={toggleMaintenance}
            className={`relative w-12 h-6 rounded-full transition-colors ${settings.maintenance_mode ? 'bg-red-500' : 'bg-gray-300'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.maintenance_mode ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>
        {settings.maintenance_mode && (
          <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            Maintenance mode is ACTIVE. Users cannot access the app.
          </div>
        )}
      </div>

      {/* Feature flags */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Feature Flags</h2>
        <div className="space-y-3">
          {features.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-700">{label}</span>
              <button
                onClick={() => toggleFeature(key)}
                className={`relative w-10 h-5 rounded-full transition-colors ${settings.feature_flags?.[key] ? 'bg-brand-500' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${settings.feature_flags?.[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
        {saving === 'feature_flags' && <p className="text-xs text-brand-500 mt-2">Saving...</p>}
      </div>
    </div>
  )
}
