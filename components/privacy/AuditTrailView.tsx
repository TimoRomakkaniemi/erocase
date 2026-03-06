'use client'

import { useEffect, useState } from 'react'
import { useT } from '@/lib/i18n'
import { getLocale } from '@/lib/i18n'

const ACTION_ICONS: Record<string, string> = {
  share: '↗',
  view: '👁',
  revoke: '↩',
  export: '↓',
  delete: '🗑',
  consent: '✓',
  dv_lock: '🔒',
  dv_unlock: '🔓',
}

interface AuditEvent {
  id: string
  action: string
  resource_type: string
  resource_id: string | null
  target_user_id: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export default function AuditTrailView() {
  const t = useT()
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [actionFilter, setActionFilter] = useState<string>('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const limit = 20

  const loadEvents = async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (actionFilter) params.set('action', actionFilter)
    if (fromDate) params.set('from', fromDate)
    if (toDate) params.set('to', toDate)
    const res = await fetch(`/api/audit?${params}`)
    if (res.ok) {
      const data = await res.json()
      setEvents(data.events ?? [])
      setTotal(data.total ?? 0)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadEvents()
  }, [page, actionFilter, fromDate, toDate])

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(getLocale(), {
      dateStyle: 'medium',
      timeStyle: 'short',
    })

  const actionLabel = (action: string) => {
    const key = `audit.${action}` as keyof typeof t
    const out = t(key as string)
    return out === key ? action : out
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value)
            setPage(1)
          }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
        >
          <option value="">{t('common.all')}</option>
          {['share', 'view', 'revoke', 'export', 'delete', 'consent', 'dv_lock', 'dv_unlock'].map(
            (a) => (
              <option key={a} value={a}>
                {actionLabel(a)}
              </option>
            )
          )}
        </select>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => {
            setFromDate(e.target.value)
            setPage(1)
          }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => {
            setToDate(e.target.value)
            setPage(1)
          }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      {loading ? (
        <div className="text-sm text-gray-500 py-8">{t('onboarding.loading')}</div>
      ) : events.length === 0 ? (
        <p className="text-sm text-gray-500 py-6">{t('audit.empty')}</p>
      ) : (
        <>
          <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200 overflow-hidden bg-white">
            {events.map((e) => (
              <li
                key={e.id}
                className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50"
              >
                <span className="text-lg flex-shrink-0" title={e.action}>
                  {ACTION_ICONS[e.action] ?? '•'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {actionLabel(e.action)} · {e.resource_type.replace(/_/g, ' ')}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatDate(e.created_at)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 hover:bg-gray-200"
              >
                ←
              </button>
              <span className="px-3 py-1.5 text-sm text-gray-600">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 hover:bg-gray-200"
              >
                →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
