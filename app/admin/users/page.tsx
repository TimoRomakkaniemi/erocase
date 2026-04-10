'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

interface User {
  id: string
  email: string
  display_name: string | null
  role: string
  plan: string
  plan_status: string
  disabled: boolean
  created_at: string
  updated_at: string
  email_confirmed_at: string | null
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)
  const limit = 20

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (planFilter) params.set('plan', planFilter)
    if (roleFilter) params.set('role', roleFilter)
    params.set('page', String(page))
    params.set('limit', String(limit))

    const res = await fetch(`/api/admin/users?${params}`)
    const data = await res.json()
    setUsers(data.users || [])
    setTotal(data.total || 0)
    setLoading(false)
  }, [search, planFilter, roleFilter, page])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const totalPages = Math.ceil(total / limit)

  const roleBadge = (role: string) => {
    const colors: Record<string, string> = {
      superadmin: 'text-red-700 bg-red-50 border-red-200',
      admin: 'text-brand-700 bg-brand-50 border-brand-200',
      user: 'text-gray-500 bg-gray-50 border-gray-200',
    }
    return colors[role] || colors.user
  }

  const planBadge = (plan: string) => {
    const colors: Record<string, string> = {
      free: 'text-gray-600 bg-gray-100',
      payg: 'text-blue-600 bg-blue-50',
      starter: 'text-brand-600 bg-brand-50',
      couple: 'text-purple-600 bg-purple-50',
    }
    return colors[plan] || colors.free
  }

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <span className="text-sm text-gray-400">{total} total</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by email or name..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl text-sm border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
        />
        <select
          value={planFilter}
          onChange={(e) => { setPlanFilter(e.target.value); setPage(1) }}
          className="px-4 py-2.5 rounded-xl text-sm border border-gray-200 bg-white outline-none"
        >
          <option value="">All plans</option>
          <option value="free">Free</option>
          <option value="payg">Pay-as-you-go</option>
          <option value="starter">Starter</option>
          <option value="couple">Couple</option>
        </select>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
          className="px-4 py-2.5 rounded-xl text-sm border border-gray-200 bg-white outline-none"
        >
          <option value="">All roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="superadmin">Superadmin</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500">User</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Role</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Plan</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Email verified</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Joined</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td colSpan={7} className="px-4 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">No users found</td></tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${u.disabled ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{u.display_name || u.email}</p>
                        {u.display_name && <p className="text-xs text-gray-400">{u.email}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${roleBadge(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${planBadge(u.plan)}`}>
                        {u.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.email_confirmed_at ? (
                        <span className="text-xs text-green-600 font-medium">Yes</span>
                      ) : (
                        <span className="text-xs text-amber-600 font-medium">Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {u.disabled ? (
                        <span className="text-xs text-red-500 font-medium">Disabled</span>
                      ) : (
                        <span className={`text-xs font-medium ${u.plan_status === 'active' ? 'text-green-600' : 'text-gray-400'}`}>
                          {u.plan_status || 'inactive'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="text-xs font-medium text-brand-600 hover:text-brand-700"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 disabled:opacity-30 hover:bg-gray-50"
          >
            Prev
          </button>
          <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 disabled:opacity-30 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
