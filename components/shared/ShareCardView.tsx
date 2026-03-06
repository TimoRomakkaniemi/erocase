'use client'

import { useT } from '@/lib/i18n'

export interface ShareCard {
  id: string
  sender_id: string
  space_id: string
  source_journal_id: string | null
  safe_content: string
  status: string
  reply_conversation_id: string | null
  revoked_at: string | null
  created_at: string
  sender_name?: string | null
}

interface ShareCardViewProps {
  card: ShareCard
  onReply?: (cardId: string) => void
}

export default function ShareCardView({ card, onReply }: ShareCardViewProps) {
  const t = useT()
  const isRevoked = !!card.revoked_at

  const formatDate = (d: string) => {
    const date = new Date(d)
    return date.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm ${
        isRevoked
          ? 'border-gray-200 bg-gray-50 opacity-75'
          : 'border-warm-200 bg-white'
      }`}
    >
      {isRevoked && (
        <p className="mb-2 text-sm font-medium text-amber-700">{t('cards.revoked')}</p>
      )}
      <p className="text-gray-900 whitespace-pre-wrap">{card.safe_content}</p>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {card.sender_name || t('cards.anonymous')} · {formatDate(card.created_at)}
        </span>
        {!isRevoked && onReply && (
          <button
            type="button"
            onClick={() => onReply(card.id)}
            className="rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-600"
          >
            {t('cards.reply')}
          </button>
        )}
      </div>
    </div>
  )
}
