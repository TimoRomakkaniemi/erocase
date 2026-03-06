'use client'

import { useEffect, useState } from 'react'

interface TriageRecord {
  id: string
  user_id: string
  type: string
  created_at: string
  status?: string
  resolved_at?: string
  profiles?: { email: string; display_name: string | null }
}

interface DVLock {
  id: string
  user_id: string
  created_at: string
  reason: string
}

export default function AdminModerationPage() {
  const [records, setRecords] = useState<TriageRecord[]>([])
  const [dvLocks, setDVLocks] = useState<DVLock[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  const fetchData = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter) params.set('status', statusFilter)
    const res = await fetch(`/api/admin/moderation?${params}`)
    const data = await res.json()
    setRecords(data.records || [])
    setDVLocks(data.dv_locks || [])
    setTotal(data.total || 0)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [statusFilter])

  const resolveRecord = async (id: string) => {
    await fetch('/api/admin/moderation', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'resolved' }),
    })
    fetchData()
  }

  const typeStyles: Record<string, string> = {
    self_harm: 'text-red-700 bg-red-50 border-red-200',
    dv: 'text-purple-700 bg-purple-50 border-purple-200',
    crisis: 'text-amber-700 bg-amber-50 border-amber-200',
    high_intensity: 'text-orange-700 bg-orange-50 border-orange-200',
  }

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Moderation</h1>

      {/* Triage Records */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Triage Events ({total})</h2>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm border border-gray-200 bg-white"
          >
            <option value="">All</option>
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : records.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No triage events</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {records.map(r => (
                <div key={r.id} className="px-4 py-3 flex items-center gap-4">
                  <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold border ${typeStyles[r.type] || 'text-gray-700 bg-gray-50 border-gray-200'}`}>
                    {r.type}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">
                      {r.profiles?.display_name || r.profiles?.email || r.user_id}
                    </p>
                    <p className="text-xs text-gray-400">{new Date(r.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {r.status === 'resolved' ? (
                      <span className="text-xs text-green-600 font-medium">Resolved</span>
                    ) : (
                      <button
                        onClick={() => resolveRecord(r.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-brand-700 bg-brand-50 border border-brand-200 hover:bg-brand-100"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* DV Locks */}
      {dvLocks.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">DV Locks ({dvLocks.length})</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-50">
              {dvLocks.map(lock => (
                <div key={lock.id} className="px-4 py-3 flex items-center gap-4">
                  <span className="shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200">
                    DV Lock
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{lock.user_id}</p>
                    <p className="text-xs text-gray-400">{new Date(lock.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
