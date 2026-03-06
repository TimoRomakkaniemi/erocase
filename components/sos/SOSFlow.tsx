'use client'

import React from 'react'
import { useSOSStore } from '@/stores/sosStore'
import { useT } from '@/lib/i18n'
import { ConflictSOS } from './ConflictSOS'
import { BreakupSOS } from './BreakupSOS'
import { LonelinessSOS } from './LonelinessSOS'
import { CalmSOS } from './CalmSOS'
import { ReliefRating } from './ReliefRating'

export function SOSFlow() {
  const t = useT()
  const { isActive, mode, currentStep, totalSteps, closeSOS } = useSOSStore()

  const [showCloseConfirm, setShowCloseConfirm] = React.useState(false)

  const handleCloseClick = () => {
    setShowCloseConfirm(true)
  }

  const handleConfirmClose = () => {
    closeSOS()
    setShowCloseConfirm(false)
  }

  const handleCancelClose = () => {
    setShowCloseConfirm(false)
  }

  if (!isActive || !mode) return null

  const showRelief = currentStep >= totalSteps

  const SOSComponent =
    mode === 'conflict'
      ? ConflictSOS
      : mode === 'breakup'
        ? BreakupSOS
        : mode === 'loneliness'
          ? LonelinessSOS
          : mode === 'calm'
            ? CalmSOS
            : null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-gray-900 via-gray-900 to-black/95 backdrop-blur-sm">
      {/* Progress bar */}
      {!showRelief && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800">
          <div
            className="h-full bg-brand-500 transition-all duration-500 ease-out"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
      )}

      {/* Close button */}
      <button
        type="button"
        onClick={handleCloseClick}
        className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white"
        aria-label={t('common.close')}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Close confirmation modal */}
      {showCloseConfirm && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 p-4">
          <div className="max-w-sm rounded-2xl bg-gray-800 p-6 shadow-xl animate-fade-in-up">
            <p className="mb-6 text-center text-lg text-white">{t('sos.closeConfirm')}</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancelClose}
                className="flex-1 rounded-xl bg-white/10 py-3 font-medium text-white transition hover:bg-white/20"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmClose}
                className="flex-1 rounded-xl bg-brand-500 py-3 font-medium text-white transition hover:bg-brand-600"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="flex flex-1 flex-col overflow-y-auto px-6 pt-16 pb-8 safe-bottom">
        {showRelief ? (
          <ReliefRating />
        ) : SOSComponent ? (
          <SOSComponent />
        ) : null}
      </main>
    </div>
  )
}
