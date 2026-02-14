import { EDGE_FUNCTION_URL } from './supabase'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface StreamCallbacks {
  onChunk: (text: string, conversationId: string) => void
  onDone: () => void
  onError: (error: string) => void
}

export async function streamChat(
  messages: ChatMessage[],
  sessionId: string,
  conversationId: string | null,
  callbacks: StreamCallbacks
): Promise<void> {
  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        session_id: sessionId,
        conversation_id: conversationId,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      callbacks.onError(`Virhe: ${response.status} - ${err}`)
      return
    }

    const reader = response.body?.getReader()
    if (!reader) {
      callbacks.onError('Ei voitu lukea vastausta')
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
    callbacks.onError(`Yhteysvirhe: ${String(err)}`)
  }
}
