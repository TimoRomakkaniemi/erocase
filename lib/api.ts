import { t } from '@/lib/i18n'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface StreamCallbacks {
  onChunk: (text: string, conversationId: string) => void
  onDone: () => void
  onError: (error: string, code?: string) => void
  onWarning?: (warning: string) => void
  onMeta?: (meta: {
    conversation_id: string
    ai_session_id: string | null
    triage?: { type: string; confidence: string | null }
  }) => void
}

export async function streamChat(
  messages: ChatMessage[],
  sessionId: string,
  conversationId: string | null,
  language: string,
  callbacks: StreamCallbacks,
  mode?: string | null
): Promise<void> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        session_id: sessionId,
        conversation_id: conversationId,
        language,
        mode: mode || undefined,
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Unknown error' }))
      if (err.error === 'HARD_LIMIT') {
        callbacks.onWarning?.('HARD_LIMIT')
        callbacks.onError(err.message || 'Budget exhausted', 'HARD_LIMIT')
        return
      }
      if (err.error === 'NO_PLAN') {
        callbacks.onError(err.message || 'Please subscribe to use Solvia', 'NO_PLAN')
        return
      }
      if (err.error === 'PAYWALL') {
        callbacks.onError(err.message || "You've used your 3 free messages today. Subscribe to continue.", 'PAYWALL')
        return
      }
      callbacks.onError(t('errors.httpError', { status: response.status, details: err.error || err.details || '' }))
      return
    }

    const reader = response.body?.getReader()
    if (!reader) {
      callbacks.onError(t('errors.noResponse'))
      return
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim()
          if (data === '[DONE]') {
            callbacks.onDone()
            return
          }
          try {
            const parsed = JSON.parse(data)
            if (parsed.meta) {
              callbacks.onMeta?.(parsed)
              continue
            }
            if (parsed.warning) {
              callbacks.onWarning?.(parsed.warning)
              continue
            }
            if (parsed.text) {
              callbacks.onChunk(parsed.text, parsed.conversation_id)
            }
            if (parsed.error) {
              callbacks.onError(parsed.error)
              return
            }
          } catch {
            // skip unparseable
          }
        }
      }
    }

    callbacks.onDone()
  } catch (err) {
    callbacks.onError(t('errors.connectionError', { details: String(err) }), 'CONNECTION')
  }
}
