'use client'

import Link from 'next/link'
import { useT } from '@/lib/i18n'
import type { SharedSpace } from '@/stores/sharedStore'

interface Props {
  space: SharedSpace
}

function formatDate(dateStr: string, locale: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return new Date(dateStr).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
  if (days < 7) return `${days}d`
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'short' })
}

export default function SpaceCard({ space }: Props) {
  const t = useT()
  const locale = typeof navigator !== 'undefined' ? navigator.language : 'fi-FI'

  const partnerName = space.members
    .filter((m) => m.user_id !== space.members.find((x) => x.role === 'creator')?.user_id)
    .map((m) => m.display_name || m.email || t('shared.partnerSpace'))
    .join(', ') || t('shared.pending')

  const typeLabel = space.type === 'partner' ? t('shared.partnerSpace') : t('shared.friendSpace')
  const statusLabel =
    space.status === 'pending'
      ? t('shared.pending')
      : space.status === 'active'
        ? t('shared.active')
        : t('shared.archived')

  const Icon = space.type === 'partner' ? (
    <svg className="w-5 h-5 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
    </svg>
  ) : (
    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
    </svg>
  )

  return (
    <Link
      href={`/space/${space.id}`}
      className="block rounded-2xl border border-warm-200 bg-white p-5 shadow-sm transition-all hover:border-brand-200 hover:shadow-md active:scale-[0.99]"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-warm-100">
          {Icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-warm-500">{typeLabel}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                space.status === 'active'
                  ? 'bg-brand-100 text-brand-700'
                  : space.status === 'pending'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-gray-100 text-gray-600'
              }`}
            >
              {statusLabel}
            </span>
          </div>
          <p className="mt-1 font-semibold text-gray-900">{partnerName}</p>
          <p className="mt-0.5 text-sm text-gray-500">
            {t('shared.lastActivity')}: {formatDate(space.created_at, locale)}
          </p>
        </div>
        <svg className="h-5 w-5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  )
}
