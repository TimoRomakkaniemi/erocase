'use client'

import { useState, useEffect } from 'react'
import { useT } from '@/lib/i18n'

interface Props {
  onClose: () => void
  onCreate: (type: 'partner' | 'friend') => Promise<{ invite_token: string } | null>
  hasPartner?: boolean
  hasFriend?: boolean
}

export default function CreateSpaceModal({ onClose, onCreate, hasPartner = false, hasFriend = false }: Props) {
  const t = useT()
  const [step, setStep] = useState<'select' | 'link'>('select')
  const [selectedType, setSelectedType] = useState<'partner' | 'friend' | null>(null)

  useEffect(() => {
    if (!hasPartner && hasFriend) setSelectedType('partner')
    else if (hasPartner && !hasFriend) setSelectedType('friend')
  }, [hasPartner, hasFriend])
  const [loading, setLoading] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [copied, setCopied] = useState(false)

  const handleCreate = async () => {
    if (!selectedType) return
    setLoading(true)
    try {
      const result = await onCreate(selectedType)
      if (result) {
        const url = typeof window !== 'undefined' ? `${window.location.origin}/invite/${result.invite_token}` : ''
        setInviteLink(url)
        setStep('link')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!inviteLink) return
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-gray-200 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">{t('shared.title')}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {step === 'select' ? (
            <>
              <p className="text-gray-600 mb-4">{t('shared.selectType')}</p>
              <div className="space-y-3">
                <button
                  onClick={() => !hasPartner && setSelectedType('partner')}
                  disabled={hasPartner}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                    hasPartner ? 'opacity-50 cursor-not-allowed' : ''
                  } ${
                    selectedType === 'partner'
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-gray-200 hover:border-brand-200'
                  }`}
                >
                  <span className="text-2xl">💕</span>
                  <div>
                    <p className="font-semibold text-gray-900">{t('shared.createPartner')}</p>
                    <p className="text-sm text-gray-500">{t('shared.partnerDesc')}</p>
                  </div>
                </button>
                <button
                  onClick={() => !hasFriend && setSelectedType('friend')}
                  disabled={hasFriend}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                    hasFriend ? 'opacity-50 cursor-not-allowed' : ''
                  } ${
                    selectedType === 'friend'
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-gray-200 hover:border-brand-200'
                  }`}
                >
                  <span className="text-2xl">🤝</span>
                  <div>
                    <p className="font-semibold text-gray-900">{t('shared.createFriend')}</p>
                    <p className="text-sm text-gray-500">{t('shared.friendDesc')}</p>
                  </div>
                </button>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!selectedType || loading}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    boxShadow: '0 2px 8px rgba(22,163,74,0.25)',
                  }}
                >
                  {loading ? t('journal.loading') : t('shared.create')}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-600 mb-4">{t('shared.inviteLink')}</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteLink}
                  className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700"
                />
                <button
                  onClick={handleCopy}
                  className="px-4 py-2.5 rounded-xl font-semibold text-white transition-all shrink-0"
                  style={{
                    background: copied ? '#15803d' : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  }}
                >
                  {copied ? t('shared.copied') : t('shared.copyLink')}
                </button>
              </div>
              <button
                onClick={onClose}
                className="mt-6 w-full py-2.5 rounded-xl font-semibold text-white transition-all"
                style={{
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  boxShadow: '0 2px 8px rgba(22,163,74,0.25)',
                }}
              >
                {t('common.done')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
