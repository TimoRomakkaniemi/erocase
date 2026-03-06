'use client'

import { useState, useEffect } from 'react'
import { useT } from '@/lib/i18n'
import TaskCard, { type SharedTask } from './TaskCard'
import CreateTask from './CreateTask'

interface TaskListProps {
  spaceId: string
}

export default function TaskList({ spaceId }: TaskListProps) {
  const t = useT()
  const [tasks, setTasks] = useState<SharedTask[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/shared/tasks?space_id=${encodeURIComponent(spaceId)}`)
      if (!res.ok) {
        setTasks([])
        return
      }
      const data = await res.json()
      setTasks(data.tasks ?? [])
      setCurrentUserId(data.current_user_id ?? null)
    } catch {
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [spaceId])

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/shared/tasks?id=' + encodeURIComponent(id), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, status: status as SharedTask['status'] } : t))
        )
      }
    } catch {
      // ignore
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch('/api/shared/tasks?id=' + encodeURIComponent(id), {
        method: 'DELETE',
      })
      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== id))
      }
    } catch {
      // ignore
    }
  }

  const grouped = {
    open: tasks.filter((t) => t.status === 'open'),
    in_progress: tasks.filter((t) => t.status === 'in_progress'),
    completed: tasks.filter((t) => t.status === 'completed'),
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-warm-200 bg-white p-6">
        <p className="text-center text-gray-500">{t('task.loading')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">{t('task.titleList')}</h2>
        {!showCreate && (
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
          >
            {t('task.add')}
          </button>
        )}
      </div>

      {showCreate && (
        <CreateTask
          spaceId={spaceId}
          onCreated={() => {
            setShowCreate(false)
            fetchTasks()
          }}
          onCancel={() => setShowCreate(false)}
        />
      )}

      <div className="space-y-6">
        {(['open', 'in_progress', 'completed'] as const).map((status) => (
          <div key={status}>
            <h3 className="mb-3 text-sm font-medium text-gray-600">
              {t(`task.status.${status}`)} ({grouped[status].length})
            </h3>
            <div className="space-y-3">
              {grouped[status].length === 0 ? (
                <p className="rounded-xl border border-dashed border-warm-300 bg-warm-50/50 py-4 text-center text-sm text-gray-500">
                  {t('task.empty')}
                </p>
              ) : (
                grouped[status].map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                    isCreator={currentUserId === task.created_by}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
