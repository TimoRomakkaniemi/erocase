'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface UserDetail {
  profile: {
    id: string
    email: string
    display_name: string | null
    role: string
    plan: string
    plan_status: string
    disabled: boolean
    created_at: string
    updated_at: string
    country_code: string
    included_minutes_remaining: number
    stripe_customer_id: string | null
  }
  stats: {
    conversations: number
    messages: number
    sessions: { id: string; started_at: string; ended_at: string | null; billable_minutes: number; status: string }[]
    triage_records: { id: string; type: string; created_at: string; status?: string }[]
    ledger: { period_start: string; period_end: string; estimated_cost_eur: number; tokens_in: number; tokens_out: number }[]
    modes: string[]
  }
}

export default function AdminUserDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [data, setData] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchUser = async () => {
    const res = await fetch(`/api/admin/users/${id}`)
    if (!res.ok) { setLoading(false); return }
    const json = await res.json()
    setData(json)
    setLoading(false)
  }

  useEffect(() => { fetchUser() }, [id])

  const updateField = async (updates: Record<string, unknown>) => {
    setActionLoading(true)
    await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    await fetchUser()
    setActionLoading(false)
  }

  const deleteUser = async () => {
    if (!confirm('Are you sure you want to permanently delete this user? This cannot be undone.')) return
    setActionLoading(true)
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    if (res.ok) router.push('/admin/users')
    setActionLoading(false)
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 bg-gray-200 rounded" />
          <div className="h-40 bg-gray-200 rounded-xl" />
          <div className="h-60 bg-gray-200 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!data) return <div className="p-8 text-gray-500">User not found</div>

  const { profile: p, stats: s } = data

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto">
      <Link href="/admin/users" className="inline-flex items-center gap-2 text-brand-600 font-medium hover:text-brand-700 mb-6 text-sm">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        Back to Users
      </Link>

      {/* Profile header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{p.display_name || p.email}</h1>
            {p.display_name && <p className="text-sm text-gray-400">{p.email}</p>}
            <div className="flex gap-2 mt-2">
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-200">{p.role}</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100">{p.plan}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.plan_status === 'active' ? 'text-green-700 bg-green-50' : 'text-gray-500 bg-gray-100'}`}>{p.plan_status}</span>
              {p.disabled && <span className="px-2 py-0.5 rounded-full text-xs font-medium text-red-700 bg-red-50">Disabled</span>}
            </div>
          </div>
          <div className="text-right text-xs text-gray-400">
            <p>Joined: {new Date(p.created_at).toLocaleDateString()}</p>
            <p>Updated: {new Date(p.updated_at).toLocaleDateString()}</p>
            <p>Country: {p.country_code}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Actions</h2>
        <div className="flex flex-wrap gap-3">
          <select
            value={p.plan}
            onChange={(e) => updateField({ plan: e.target.value })}
            disabled={actionLoading}
            className="px-3 py-2 rounded-lg text-sm border border-gray-200 bg-white"
          >
            <option value="free">Free</option>
            <option value="payg">Pay-as-you-go</option>
            <option value="starter">Starter</option>
            <option value="couple">Couple</option>
          </select>
          <select
            value={p.role}
            onChange={(e) => updateField({ role: e.target.value })}
            disabled={actionLoading}
            className="px-3 py-2 rounded-lg text-sm border border-gray-200 bg-white"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Superadmin</option>
          </select>
          <button
            onClick={() => updateField({ disabled: !p.disabled })}
            disabled={actionLoading}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              p.disabled
                ? 'text-green-700 border-green-200 hover:bg-green-50'
                : 'text-amber-700 border-amber-200 hover:bg-amber-50'
            }`}
          >
            {p.disabled ? 'Enable' : 'Disable'}
          </button>
          <button
            onClick={deleteUser}
            disabled={actionLoading}
            className="px-4 py-2 rounded-lg text-sm font-medium text-red-700 border border-red-200 hover:bg-red-50 transition-colors"
          >
            Delete User
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{s.conversations}</p>
          <p className="text-xs text-gray-400">Conversations</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{s.messages}</p>
          <p className="text-xs text-gray-400">Messages</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{s.modes.length}</p>
          <p className="text-xs text-gray-400">Active Modes</p>
        </div>
      </div>

      {/* Sessions */}
      {s.sessions.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Recent Sessions</h2>
          <div className="space-y-2">
            {s.sessions.slice(0, 10).map(sess => (
              <div key={sess.id} className="flex items-center justify-between text-xs border-b border-gray-50 pb-2">
                <span className="text-gray-500">{new Date(sess.started_at).toLocaleString()}</span>
                <span className="text-gray-700">{sess.billable_minutes} min</span>
                <span className={`font-medium ${sess.status === 'ENDED' ? 'text-green-600' : 'text-amber-600'}`}>{sess.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Triage */}
      {s.triage_records.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Triage Records</h2>
          <div className="space-y-2">
            {s.triage_records.map(tr => (
              <div key={tr.id} className="flex items-center justify-between text-xs border-b border-gray-50 pb-2">
                <span className={`font-medium px-2 py-0.5 rounded-full ${
                  tr.type === 'self_harm' ? 'text-red-700 bg-red-50'
                    : tr.type === 'dv' ? 'text-purple-700 bg-purple-50'
                    : 'text-amber-700 bg-amber-50'
                }`}>{tr.type}</span>
                <span className="text-gray-500">{new Date(tr.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
