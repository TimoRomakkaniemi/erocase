'use client'

import { useEffect, useState } from 'react'

interface Stats {
  total_users: number
  active_7d: number
  messages_today: number
  messages_week: number
  plans: Record<string, number>
  active_subscriptions: number
  triage_events: number
  sos_sessions: number
  mrr_estimate: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-xl" />)}
          </div>
        </div>
      </div>
    )
  }

  if (!stats) return <div className="p-8 text-gray-500">Failed to load dashboard</div>

  const cards = [
    { label: 'Total Users', value: stats.total_users, sub: `${stats.active_7d} active (7d)`, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Messages Today', value: stats.messages_today, sub: `${stats.messages_week} this week`, color: 'text-brand-600', bg: 'bg-brand-50' },
    { label: 'Active Subscriptions', value: stats.active_subscriptions, sub: `MRR ~€${stats.mrr_estimate}`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Triage Events', value: stats.triage_events, sub: 'All time', color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'SOS Sessions', value: stats.sos_sessions, sub: 'All time', color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Free Users', value: stats.plans.free || 0, sub: '', color: 'text-gray-600', bg: 'bg-gray-100' },
    { label: 'Starter Plans', value: stats.plans.starter || 0, sub: '', color: 'text-brand-600', bg: 'bg-brand-50' },
    { label: 'Couple Plans', value: stats.plans.couple || 0, sub: '', color: 'text-purple-600', bg: 'bg-purple-50' },
  ]

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <div key={i} className={`rounded-xl p-5 border border-gray-200 bg-white`}>
            <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
              <span className={`text-lg font-bold ${card.color}`}>#</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
            <p className="text-sm font-medium text-gray-500 mt-0.5">{card.label}</p>
            {card.sub && <p className="text-xs text-gray-400 mt-1">{card.sub}</p>}
          </div>
        ))}
      </div>

      {/* Plan distribution */}
      <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Plan Distribution</h2>
        <div className="flex gap-3">
          {Object.entries(stats.plans).map(([plan, count]) => {
            const total = stats.total_users || 1
            const pct = Math.round((count / total) * 100)
            const colors: Record<string, string> = {
              free: 'bg-gray-400', payg: 'bg-blue-400', starter: 'bg-brand-500', couple: 'bg-purple-500'
            }
            return (
              <div key={plan} className="flex-1">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span className="capitalize">{plan}</span>
                  <span>{count} ({pct}%)</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${colors[plan] || 'bg-gray-400'}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
