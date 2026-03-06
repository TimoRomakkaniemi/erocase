'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useT } from '@/lib/i18n'

const CONFIRM_STRING = 'DELETE_ALL_MY_DATA'

export default function DataExport() {
  const t = useT()
  const router = useRouter()
  const [exporting, setExporting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async () => {
    setExporting(true)
    setError(null)
    try {
      const res = await fetch('/api/privacy/export')
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Export failed')
        return
      }
      const blob = await res.blob()
      const disposition = res.headers.get('Content-Disposition')
      const match = disposition?.match(/filename="([^"]+)"/)
      const filename = match?.[1] ?? `solvia-export-${new Date().toISOString().slice(0, 10)}.json`
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  const handleDelete = async () => {
    if (deleteConfirm !== CONFIRM_STRING) return
    setDeleting(true)
    setError(null)
    try {
      const res = await fetch('/api/privacy/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: CONFIRM_STRING }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? 'Deletion failed')
        return
      }
      setShowDeleteConfirm(false)
      setDeleteConfirm('')
      router.push('/')
      router.refresh()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-600 mb-3">{t('privacy.exportDescription')}</p>
        <button
          type="button"
          disabled={exporting}
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
            bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-60 transition-all"
        >
          {exporting ? t('onboarding.loading') : t('privacy.exportButton')}
        </button>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          {t('privacy.deleteWarning')}
        </p>
        {!showDeleteConfirm ? (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
              bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-all"
          >
            {t('privacy.deleteButton')}
          </button>
        ) : (
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 block mb-1">
                {t('privacy.deleteConfirm')}
              </span>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="DELETE_ALL_MY_DATA"
                className="w-full max-w-md rounded-lg border border-gray-300 px-3 py-2 text-sm
                  focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={deleting || deleteConfirm !== CONFIRM_STRING}
                onClick={handleDelete}
                className="px-4 py-2.5 rounded-xl text-sm font-medium
                  bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {deleting ? t('onboarding.loading') : t('privacy.deleteButton')}
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setDeleteConfirm('')
                  setError(null)
                }}
                className="px-4 py-2.5 rounded-xl text-sm font-medium
                  bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>
      )}
    </div>
  )
}
