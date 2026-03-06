'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase-browser'
import { useT } from '@/lib/i18n'

interface SaveInsightButtonProps {
  content: string
  conversationId?: string
}

export default function SaveInsightButton({ content, conversationId }: SaveInsightButtonProps) {
  const t = useT()
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<'idle' | 'saved' | 'error'>('idle')

  const handleSave = async () => {
    if (!content.trim() || saving) return

    setSaving(true)
    setToast('idle')

    try {
      const supabase = createBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setToast('error')
        return
      }

      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('auto_delete_days')
        .eq('user_id', user.id)
        .single()

      let auto_delete_at: string | null = null
      const autoDeleteDays = prefs?.auto_delete_days ?? 0
      if (autoDeleteDays > 0) {
        const d = new Date()
        d.setDate(d.getDate() + autoDeleteDays)
        auto_delete_at = d.toISOString()
      }

      const { error } = await supabase.from('journal_entries').insert({
        user_id: user.id,
        conversation_id: conversationId || null,
        content: content.trim(),
        mood_score: null,
        mode: null,
        auto_delete_at,
      })

      if (error) throw error
      setToast('saved')
      setTimeout(() => setToast('idle'), 2500)
    } catch {
      setToast('error')
      setTimeout(() => setToast('idle'), 2500)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="relative mt-2">
      <button
        onClick={handleSave}
        disabled={saving}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium
          text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200/60
          transition-colors disabled:opacity-60"
        title={t('journal.saveToJournal')}
      >
        {saving ? (
          <span className="animate-pulse">{t('journal.saving')}</span>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            {t('journal.saveToJournal')}
          </>
        )}
      </button>
      {toast === 'saved' && (
        <span
          className="absolute left-0 top-full mt-1 text-xs text-brand-600 font-medium animate-fade-in-up"
          role="status"
        >
          {t('journal.savedToJournal')}
        </span>
      )}
      {toast === 'error' && (
        <span
          className="absolute left-0 top-full mt-1 text-xs text-red-600 font-medium animate-fade-in-up"
          role="alert"
        >
          {t('journal.saveError')}
        </span>
      )}
    </div>
  )
}
