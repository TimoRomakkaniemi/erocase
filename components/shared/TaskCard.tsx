'use client'

import { useT } from '@/lib/i18n'

export interface SharedTask {
  id: string
  space_id: string
  created_by: string
  title: string
  description: string | null
  status: 'open' | 'in_progress' | 'completed'
  due_date: string | null
  created_at: string
  updated_at: string
  created_by_name?: string
}

interface TaskCardProps {
  task: SharedTask
  onStatusChange: (id: string, status: string) => void
  onDelete?: (id: string) => void
  isCreator?: boolean
}

const STATUS_ORDER = ['open', 'in_progress', 'completed'] as const

export default function TaskCard({ task, onStatusChange, onDelete, isCreator }: TaskCardProps) {
  const t = useT()
  const idx = STATUS_ORDER.indexOf(task.status)
  const nextStatus = idx < STATUS_ORDER.length - 1 ? STATUS_ORDER[idx + 1] : null
  const prevStatus = idx > 0 ? STATUS_ORDER[idx - 1] : null

  const formatDate = (d: string | null) => {
    if (!d) return null
    const date = new Date(d)
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="rounded-2xl border border-warm-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900">{task.title}</h3>
          {task.description && (
            <p className="mt-1 line-clamp-2 text-sm text-gray-600">
              {task.description}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                task.status === 'open'
                  ? 'bg-amber-100 text-amber-800'
                  : task.status === 'in_progress'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-brand-100 text-brand-800'
              }`}
            >
              {t(`task.status.${task.status}`)}
            </span>
            {task.due_date && (
              <span className="text-xs text-gray-500">
                {t('task.due')}: {formatDate(task.due_date)}
              </span>
            )}
            {task.created_by_name && (
              <span className="text-xs text-gray-500">
                {t('task.by')} {task.created_by_name}
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <div className="flex gap-1">
            {prevStatus && (
              <button
                type="button"
                onClick={() => onStatusChange(task.id, prevStatus)}
                className="rounded-lg px-2 py-1 text-xs font-medium text-gray-600 hover:bg-warm-100"
              >
                ←
              </button>
            )}
            {nextStatus && (
              <button
                type="button"
                onClick={() => onStatusChange(task.id, nextStatus)}
                className="rounded-lg px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50"
              >
                →
              </button>
            )}
          </div>
          {isCreator && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(task.id)}
              className="text-xs text-red-600 hover:text-red-700"
            >
              {t('task.delete')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
