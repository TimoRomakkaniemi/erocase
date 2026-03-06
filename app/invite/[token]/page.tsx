'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase-browser'
import { useT } from '@/lib/i18n'
import SolviaLogo from '@/components/SolviaLogo'

type State = 'loading' | 'ready' | 'expired' | 'accepted' | 'error' | 'alreadyMember'

export default function InvitePage() {
  const t = useT()
  const router = useRouter()
  const params = useParams()
  const token = params.token as string
  const [state, setState] = useState<State>('loading')
  const [creatorName, setCreatorName] = useState('')
  const [spaceType, setSpaceType] = useState<'partner' | 'friend'>('partner')
  const [accepting, setAccepting] = useState(false)

  useEffect(() => {
    const run = async () => {
      const res = await fetch(`/api/invite?token=${encodeURIComponent(token)}`)
      const data = await res.json()

      if (!res.ok) {
        if (res.status === 410) setState('expired')
        else setState('error')
        return
      }

      setCreatorName(data.creator_name || 'Someone')
      setSpaceType(data.type === 'friend' ? 'friend' : 'partner')
      setState('ready')
    }
    run()
  }, [token])

  const handleAccept = async () => {
    const supabase = createBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push(`/login?next=${encodeURIComponent(`/invite/${token}`)}`)
      return
    }

    setAccepting(true)
    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await res.json()

      if (res.ok) {
        setState('accepted')
        setTimeout(() => router.push(`/space/${data.space_id}`), 1500)
      } else if (data.error?.toLowerCase().includes('already')) {
        setState('alreadyMember')
      } else {
        setState('error')
      }
    } catch {
      setState('error')
    } finally {
      setAccepting(false)
    }
  }

  const handleDecline = () => {
    router.push('/')
  }

  if (state === 'loading') {
    return (
      <div className="min-h-screen chat-bg flex flex-col items-center justify-center p-4">
        <div className="animate-pulse">
          <SolviaLogo size={48} className="text-brand-500" />
        </div>
        <p className="mt-4 text-sm text-gray-500">{t('journal.loading')}</p>
      </div>
    )
  }

  if (state === 'expired') {
    return (
      <div className="min-h-screen chat-bg flex flex-col items-center justify-center p-4">
        <div className="max-w-sm text-center">
          <p className="text-lg font-semibold text-gray-900">{t('invite.expired')}</p>
          <Link
            href="/"
            className="mt-4 inline-block px-4 py-2 rounded-xl font-medium text-brand-600 bg-brand-50 hover:bg-brand-100"
          >
            {t('invite.goHome')}
          </Link>
        </div>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="min-h-screen chat-bg flex flex-col items-center justify-center p-4">
        <div className="max-w-sm text-center">
          <p className="text-gray-600">{t('invite.expired')}</p>
          <Link
            href="/"
            className="mt-4 inline-block px-4 py-2 rounded-xl font-medium text-brand-600 bg-brand-50"
          >
            {t('invite.goHome')}
          </Link>
        </div>
      </div>
    )
  }

  if (state === 'alreadyMember') {
    return (
      <div className="min-h-screen chat-bg flex flex-col items-center justify-center p-4">
        <div className="max-w-sm text-center">
          <p className="text-lg font-semibold text-gray-900">{t('invite.alreadyMember')}</p>
          <Link
            href="/space"
            className="mt-4 inline-block px-4 py-2 rounded-xl font-medium text-white"
            style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            }}
          >
            {t('shared.title')}
          </Link>
        </div>
      </div>
    )
  }

  if (state === 'accepted') {
    return (
      <div className="min-h-screen chat-bg flex flex-col items-center justify-center p-4">
        <div className="max-w-sm text-center">
          <p className="text-lg font-semibold text-brand-600">{t('invite.accepted')}</p>
          <p className="mt-2 text-gray-500">{t('journal.loading')}</p>
        </div>
      </div>
    )
  }

  const spaceTypeLabel = spaceType === 'partner' ? t('invite.partnerSpace') : t('invite.friendSpace')

  return (
    <div className="min-h-screen chat-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white border border-gray-200 shadow-lg p-6 text-center">
        <SolviaLogo size={40} className="mx-auto text-brand-500 mb-4" />
        <h1 className="text-xl font-bold text-gray-900">{t('invite.title')}</h1>
        <p className="mt-2 text-gray-600">
          {t('invite.invitedBy', { name: creatorName })} {spaceTypeLabel}
        </p>

        <div className="mt-8 flex gap-3">
          <button
            onClick={handleDecline}
            className="flex-1 py-2.5 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            {t('invite.decline')}
          </button>
          <button
            onClick={handleAccept}
            disabled={accepting}
            className="flex-1 py-2.5 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              boxShadow: '0 2px 8px rgba(22,163,74,0.25)',
            }}
          >
            {accepting ? t('journal.loading') : t('invite.accept')}
          </button>
        </div>

        <p className="mt-4 text-xs text-gray-500">
          {t('invite.loginHint')}
        </p>
      </div>
    </div>
  )
}
