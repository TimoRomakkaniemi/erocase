'use client'

import { useState } from 'react'
import { useT } from '@/lib/i18n'
import { CrisisResources } from './CrisisResources'

interface DVLockBannerProps {
  spaceId: string
  onUnlock: () => void
}

export function DVLockBanner({ spaceId, onUnlock }: DVLockBannerProps) {
  const t = useT()
  const [showUnlockConfirm, setShowUnlockConfirm] = useState(false)

  const handleUnlockClick = () => {
    setShowUnlockConfirm(true)
  }

  const handleConfirmUnlock = () => {
    onUnlock()
    setShowUnlockConfirm(false)
  }

  const handleCancelUnlock = () => {
    setShowUnlockConfirm(false)
  }

  return (
    <div className="rounded-xl border-2 border-amber-500/50 bg-amber-500/15 p-4">
      <h3 className="text-lg font-semibold text-amber-900 mb-2">
        {t('dv.lockTitle')}
      </h3>
      <p className="text-sm text-amber-800/90 mb-4">
        {t('dv.lockMessage')}
      </p>

      <div className="mb-4">
        <CrisisResources countryCode="FI" triggerType="dv" />
      </div>

      <button
        type="button"
        onClick={handleUnlockClick}
        className="rounded-xl bg-amber-500/30 border border-amber-500/50 px-4 py-2 text-sm font-medium text-amber-900 hover:bg-amber-500/40 transition"
      >
        {t('dv.unlock')}
      </button>

      {showUnlockConfirm && (
        <div className="mt-4 p-4 rounded-xl bg-amber-100/80 border border-amber-500/30">
          <p className="text-sm text-amber-900 mb-3">{t('dv.unlockConfirm')}</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancelUnlock}
              className="rounded-lg bg-white/80 px-3 py-2 text-sm font-medium text-amber-900 border border-amber-500/30"
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              onClick={handleConfirmUnlock}
              className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-amber-950"
            >
              {t('dv.unlock')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
