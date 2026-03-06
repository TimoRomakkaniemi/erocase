'use client'

import { useEffect, useState } from 'react'
import { useT } from '@/lib/i18n'
import { useSharedStore } from '@/stores/sharedStore'

export default function ConsentManager() {
  const t = useT()
  const { spaces, loadSpaces } = useSharedStore()
  const [consents, setConsents] = useState<Record<string, { share_checkins: boolean; allow_joint_summary: boolean }>>({})
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      await loadSpaces()
      const res = await fetch('/api/consent')
      if (res.ok) {
        const data = await res.json()
        setConsents(data.consents ?? {})
      }
      setLoading(false)
    }
    run()
  }, [loadSpaces])

  const updateConsent = async (
    spaceId: string,
    key: 'share_checkins' | 'allow_joint_summary',
    value: boolean
  ) => {
    setUpdating(`${spaceId}-${key}`)
    try {
      const res = await fetch('/api/consent', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ space_id: spaceId, [key]: value }),
      })
      if (res.ok) {
        setConsents((prev) => ({
          ...prev,
          [spaceId]: {
            ...(prev[spaceId] ?? { share_checkins: true, allow_joint_summary: true }),
            [key]: value,
          },
        }))
      }
    } finally {
      setUpdating(null)
    }
  }

  const getConsent = (spaceId: string, key: 'share_checkins' | 'allow_joint_summary') =>
    consents[spaceId]?.[key] ?? true

  const spaceLabel = (type: string) =>
    type === 'partner' ? t('shared.partnerSpace') : t('shared.friendSpace')

  if (loading) {
    return (
      <div className="text-sm text-gray-500 py-4">{t('onboarding.loading')}</div>
    )
  }

  if (spaces.length === 0) {
    return (
      <p className="text-sm text-gray-500 py-2">{t('shared.noSpaces')}</p>
    )
  }

  return (
    <div className="space-y-6">
      {spaces.filter((s) => s.status === 'active').map((space) => (
        <div
          key={space.id}
          className="p-4 rounded-xl bg-gray-50 border border-gray-200"
        >
          <h4 className="font-medium text-gray-900 mb-3">
            {spaceLabel(space.type)}
          </h4>
          <div className="space-y-3">
            <label className="flex items-center justify-between gap-4 cursor-pointer">
              <span className="text-sm text-gray-700">{t('privacy.consentCheckins')}</span>
              <button
                type="button"
                role="switch"
                aria-checked={getConsent(space.id, 'share_checkins')}
                disabled={updating !== null}
                onClick={() =>
                  updateConsent(space.id, 'share_checkins', !getConsent(space.id, 'share_checkins'))
                }
                className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors
                  ${getConsent(space.id, 'share_checkins') ? 'bg-brand-500' : 'bg-gray-300'}
                  ${updating ? 'opacity-60' : ''}`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform
                    ${getConsent(space.id, 'share_checkins') ? 'translate-x-5' : 'translate-x-0.5'}`}
                  style={{ marginTop: 2 }}
                />
              </button>
            </label>
            <label className="flex items-center justify-between gap-4 cursor-pointer">
              <span className="text-sm text-gray-700">{t('privacy.consentSummary')}</span>
              <button
                type="button"
                role="switch"
                aria-checked={getConsent(space.id, 'allow_joint_summary')}
                disabled={updating !== null}
                onClick={() =>
                  updateConsent(space.id, 'allow_joint_summary', !getConsent(space.id, 'allow_joint_summary'))
                }
                className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors
                  ${getConsent(space.id, 'allow_joint_summary') ? 'bg-brand-500' : 'bg-gray-300'}
                  ${updating ? 'opacity-60' : ''}`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform
                    ${getConsent(space.id, 'allow_joint_summary') ? 'translate-x-5' : 'translate-x-0.5'}`}
                  style={{ marginTop: 2 }}
                />
              </button>
            </label>
          </div>
        </div>
      ))}
    </div>
  )
}
