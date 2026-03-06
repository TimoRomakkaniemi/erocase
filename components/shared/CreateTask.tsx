'use client'

import { useState } from 'react'
import { useT } from '@/lib/i18n'

interface CreateTaskProps {
  spaceId: string
  onCreated: () => void
  onCancel: () => void
}

export default function CreateTask({ spaceId, onCreated, onCancel }: CreateTaskProps) {
  const t = useT()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/shared/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          space_id: spaceId,
          title: title.trim(),
          description: description.trim() || undefined,
          due_date: dueDate || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t('errors.httpError', { status: res.status, details: '' }))
        return
      }
      onCreated()
    } catch (err) {
      setError(t('errors.connectionError', { details: String(err) }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-warm-200 bg-white p-4 shadow-sm">
      <h3 className="mb-4 font-semibold text-gray-900">{t('task.add')}</h3>
      <div className="space-y-4">
        <div>
          <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 mb-1">
            {t('task.title')} *
          </label>
          <input
            id="task-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('task.titlePlaceholder')}
            required
            maxLength={200}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
          />
        </div>
        <div>
          <label htmlFor="task-desc" className="block text-sm font-medium text-gray-700 mb-1">
            {t('task.description')}
          </label>
          <textarea
            id="task-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('task.descriptionPlaceholder')}
            rows={3}
            maxLength={1000}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 resize-none"
          />
        </div>
        <div>
          <label htmlFor="task-due" className="block text-sm font-medium text-gray-700 mb-1">
            {t('task.dueDate')}
          </label>
          <input
            id="task-due"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900
              focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
          />
        </div>
      </div>
      {error && (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      )}
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-gray-200 px-4 py-3 font-medium text-gray-700
            hover:bg-warm-50 transition-colors"
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="flex-1 rounded-xl bg-brand-500 px-4 py-3 font-semibold text-white
            hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? t('task.creating') : t('task.create')}
        </button>
      </div>
    </form>
  )
}
