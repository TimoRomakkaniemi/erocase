'use client'

import { useEffect, useState } from 'react'

interface AnalyticsData {
  daily_signups: { date: string; count: number }[]
  daily_messages: { date: string; count: number }[]
  mode_distribution: Record<string, number>
  sos_by_mode: Record<string, number>
  language_distribution: Record<string, number>
}

function MiniBar({ data, color }: { data: { date: string; count: number }[]; color: string }) {
  const max = Math.max(...data.map(d => d.count), 1)
  return (
    <div className="flex items-end gap-0.5 h-24">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className={`w-full rounded-t ${color} min-h-[2px]`}
            style={{ height: `${(d.count / max) * 100}%` }}
            title={`${d.date}: ${d.count}`}
          />
        </div>
      ))}
    </div>
  )
}

function Distribution({ data, colors }: { data: Record<string, number>; colors: Record<string, string> }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0) || 1
  return (
    <div className="space-y-2">
      {Object.entries(data).sort((a, b) => b[1] - a[1]).map(([key, count]) => {
        const pct = Math.round((count / total) * 100)
        return (
          <div key={key}>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span className="capitalize">{key}</span>
              <span>{count} ({pct}%)</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${colors[key] || 'bg-gray-400'}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="grid grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-48 bg-gray-200 rounded-xl" />)}
          </div>
        </div>
      </div>
    )
  }

  if (!data) return <div className="p-8 text-gray-500">Failed to load analytics</div>

  const modeColors: Record<string, string> = {
    conflict: 'bg-red-400', breakup: 'bg-pink-400', loneliness: 'bg-blue-400', calm: 'bg-teal-400'
  }
  const langColors: Record<string, string> = {
    fi: 'bg-blue-500', en: 'bg-brand-500', sv: 'bg-yellow-500', de: 'bg-gray-600',
    fr: 'bg-indigo-500', es: 'bg-orange-500', it: 'bg-green-500', nl: 'bg-amber-500'
  }

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Daily signups */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Daily Signups (30d)</h2>
          {data.daily_signups.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No data yet</p>
          ) : (
            <MiniBar data={data.daily_signups} color="bg-blue-400" />
          )}
          <p className="text-xs text-gray-400 mt-2">
            Total: {data.daily_signups.reduce((a, d) => a + d.count, 0)}
          </p>
        </div>

        {/* Daily messages */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Daily Messages (30d)</h2>
          {data.daily_messages.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No data yet</p>
          ) : (
            <MiniBar data={data.daily_messages} color="bg-brand-400" />
          )}
          <p className="text-xs text-gray-400 mt-2">
            Total: {data.daily_messages.reduce((a, d) => a + d.count, 0)}
          </p>
        </div>

        {/* Mode distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Mode Distribution</h2>
          <Distribution data={data.mode_distribution} colors={modeColors} />
        </div>

        {/* SOS by mode */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">SOS Sessions by Mode</h2>
          <Distribution data={data.sos_by_mode} colors={modeColors} />
        </div>

        {/* Language distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 md:col-span-2">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Language Distribution</h2>
          <Distribution data={data.language_distribution} colors={langColors} />
        </div>
      </div>
    </div>
  )
}
