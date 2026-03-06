'use client'

import React, { useState } from 'react'
import { useTriageStore } from '@/stores/triageStore'
import { useT } from '@/lib/i18n'
import { CrisisResources } from './CrisisResources'
import { SafeExit } from './SafeExit'
import type { TriageResult } from '@/lib/triage'

const SUPPORT_CARD_MESSAGE_FI = 'Tarvitsen apua nyt'

async function sendSupportCard(): Promise<boolean> {
  try {
    const spacesRes = await fetch('/api/shared')
    if (!spacesRes.ok) return false
    const { spaces } = await spacesRes.json()
    const friendSpace = (spaces ?? []).find((s: { type: string }) => s.type === 'friend')
    if (!friendSpace) return false

    const msg = SUPPORT_CARD_MESSAGE_FI
    const res = await fetch('/api/cards/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        space_id: friendSpace.id,
        original_content: msg,
        safe_content: msg,
      }),
    })
    return res.ok
  } catch {
    return false
  }
}

interface TriageFlowProps {
  triageResult: TriageResult
  onClose: () => void
  countryCode?: string
}

export function TriageFlow({ triageResult, onClose, countryCode = 'FI' }: TriageFlowProps) {
  const t = useT()
  const { type } = triageResult
  const [showImSafeConfirm, setShowImSafeConfirm] = useState(false)
  const [supportCardSending, setSupportCardSending] = useState(false)
  const [supportCardSent, setSupportCardSent] = useState(false)
  const [dvLocking, setDvLocking] = useState(false)
  const [dvLockCreated, setDvLockCreated] = useState(false)

  const isCritical = type === 'self_harm' || type === 'dv'
  const canCloseWithoutConfirm = type === 'high_intensity'

  const handleClose = () => {
    if (canCloseWithoutConfirm) {
      onClose()
      return
    }
    setShowImSafeConfirm(true)
  }

  const handleConfirmImSafe = () => {
    onClose()
    setShowImSafeConfirm(false)
  }

  const handleSendSupportCard = async () => {
    setSupportCardSending(true)
    const ok = await sendSupportCard()
    setSupportCardSending(false)
    if (ok) setSupportCardSent(true)
  }

  const handleDvLock = async () => {
    setDvLocking(true)
    try {
      const spacesRes = await fetch('/api/shared')
      if (!spacesRes.ok) return
      const { spaces } = await spacesRes.json()
      const partnerSpace = (spaces ?? []).find((s: { type: string }) => s.type === 'partner')
      const spaceToLock = partnerSpace ?? (spaces ?? [])[0]
      if (!spaceToLock) {
        setDvLocking(false)
        return
      }
      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'dv_lock', space_id: spaceToLock.id }),
      })
      if (res.ok) setDvLockCreated(true)
    } finally {
      setDvLocking(false)
    }
  }

  const titleKey =
    type === 'self_harm'
      ? 'triage.selfHarmTitle'
      : type === 'dv'
        ? 'triage.dvTitle'
        : type === 'crisis'
          ? 'triage.crisisTitle'
          : 'triage.highIntensityTitle'

  const messageKey =
    type === 'self_harm'
      ? 'triage.selfHarmMessage'
      : type === 'dv'
        ? 'triage.dvMessage'
        : type === 'crisis'
          ? 'triage.crisisMessage'
          : 'triage.highIntensityMessage'

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-amber-950/95 via-amber-900/95 to-amber-950/98 backdrop-blur-sm">
      {/* Close button - only for high_intensity */}
      {canCloseWithoutConfirm && (
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white"
          aria-label={t('common.close')}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Im Safe confirmation modal */}
      {showImSafeConfirm && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 p-4">
          <div className="max-w-sm rounded-2xl bg-amber-900/95 border border-amber-500/30 p-6 shadow-xl">
            <p className="mb-6 text-center text-lg text-amber-50">{t('triage.imSafe')}</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowImSafeConfirm(false)}
                className="flex-1 rounded-xl bg-white/10 py-3 font-medium text-white transition hover:bg-white/20"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmImSafe}
                className="flex-1 rounded-xl bg-amber-500 py-3 font-medium text-amber-950 transition hover:bg-amber-400"
              >
                {t('triage.imSafeConfirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex flex-1 flex-col overflow-y-auto px-6 pt-16 pb-8 safe-bottom">
        <div className="mx-auto max-w-lg flex flex-col gap-8">
          {/* Title and message */}
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-amber-50 mb-4">
              {t(titleKey)}
            </h1>
            <p className="text-lg text-amber-100/90 leading-relaxed">
              {t(messageKey)}
            </p>
          </div>

          {/* High intensity: grounding only */}
          {type === 'high_intensity' && (
            <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-6">
              <h2 className="text-xl font-semibold text-amber-50 mb-4">
                {t('triage.takeBreath')}
              </h2>
              <p className="text-amber-100/90 mb-4">
                {t('triage.groundingPrompt')}
              </p>
              <div className="space-y-2 text-amber-100/80">
                <p>5 — {t('triage.see')}</p>
                <p>4 — {t('triage.hear')}</p>
                <p>3 — {t('triage.touch')}</p>
                <p>2 — {t('triage.smell')}</p>
                <p>1 — {t('triage.taste')}</p>
              </div>
            </div>
          )}

          {/* Crisis resources for self_harm, dv, crisis */}
          {(type === 'self_harm' || type === 'dv' || type === 'crisis') && (
            <>
              <div>
                <h2 className="text-xl font-semibold text-amber-50 mb-4">
                  {t('safety.callNow')}
                </h2>
                <CrisisResources countryCode={countryCode} triggerType={type} />
              </div>

              {/* Send Support Card */}
              <div>
                <button
                  type="button"
                  onClick={handleSendSupportCard}
                  disabled={supportCardSending || supportCardSent}
                  className="w-full rounded-2xl bg-amber-500/20 border border-amber-500/40 px-6 py-4 text-base font-semibold text-amber-50 transition hover:bg-amber-500/30 disabled:opacity-50"
                >
                  {supportCardSending
                    ? t('common.sending') || 'Sending...'
                    : supportCardSent
                      ? t('safety.supportCardSent') || 'Sent'
                      : t('safety.supportCard')}
                </button>
              </div>
            </>
          )}

          {/* DV lock option for dv type */}
          {type === 'dv' && (
            <div>
              <button
                type="button"
                onClick={handleDvLock}
                disabled={dvLocking || dvLockCreated}
                className="w-full rounded-2xl bg-amber-500/20 border border-amber-500/40 px-6 py-4 text-base font-semibold text-amber-50 transition hover:bg-amber-500/30 disabled:opacity-50"
              >
                {dvLocking
                  ? t('common.sending') || '...'
                  : dvLockCreated
                    ? t('dv.lockCreated') || 'Lock activated'
                    : t('dv.lockNow')}
              </button>
              <p className="mt-2 text-sm text-amber-200/70 text-center">
                {t('dv.lockHint')}
              </p>
            </div>
          )}

          {/* Safe Exit - always prominent */}
          <div className="mt-auto pt-4">
            <SafeExit />
          </div>

          {/* Close for high_intensity is in header; for others show at bottom */}
          {!canCloseWithoutConfirm && (
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl bg-white/10 py-3 px-6 font-medium text-white transition hover:bg-white/20"
            >
              {t('triage.imSafe')}
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
