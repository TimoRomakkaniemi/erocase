import { create } from 'zustand'
import { streamChat, type ChatMessage } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { useI18nStore } from '@/lib/i18n'
import { useModeStore } from '@/stores/modeStore'
import { useTriageStore } from '@/stores/triageStore'

function getSessionId(): string {
  if (typeof window === 'undefined') return 'ssr-placeholder'
  const key = 'solvia_session_id'
  let id = localStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(key, id)
  }
  return id
}

export interface Conversation {
  id: string
  title: string | null
  mood: string | null
  created_at: string
  updated_at: string
}

interface ChatState {
  sessionId: string
  aiSessionId: string | null
  conversations: Conversation[]
  currentConversationId: string | null
  messages: ChatMessage[]
  isLoading: boolean
  isStreaming: boolean
  streamingText: string
  error: string | null
  errorCode: string | null
  sidebarOpen: boolean

  softLimit: boolean
  hardLimit: boolean
  sessionStartTime: number | null

  sendMessage: (content: string) => Promise<void>
  startNewConversation: () => void
  loadConversation: (conversationId: string) => Promise<void>
  loadConversations: () => Promise<void>
  setSidebarOpen: (open: boolean) => void
  clearError: () => void
  dismissSoftLimit: () => void
  reportUsage: () => Promise<void>
}

export const useChatStore = create<ChatState>((set, get) => ({
  sessionId: getSessionId(),
  aiSessionId: null,
  conversations: [],
  currentConversationId: null,
  messages: [],
  isLoading: false,
  isStreaming: false,
  streamingText: '',
  error: null,
  errorCode: null,
  sidebarOpen: false,
  softLimit: false,
  hardLimit: false,
  sessionStartTime: null,

  sendMessage: async (content: string) => {
    const { messages, sessionId, currentConversationId, isStreaming, hardLimit } = get()
    if (isStreaming || hardLimit) return

    const userMessage: ChatMessage = { role: 'user', content }
    const newMessages = [...messages, userMessage]

    set({
      messages: newMessages,
      isLoading: true,
      isStreaming: true,
      streamingText: '',
      error: null,
      errorCode: null,
      sessionStartTime: get().sessionStartTime || Date.now(),
    })

    let receivedConvId = currentConversationId
    const language = useI18nStore.getState().lang
    const activeMode = useModeStore.getState().activeMode

    await streamChat(
      newMessages,
      sessionId,
      currentConversationId,
      language,
      {
        onMeta: (meta) => {
          if (meta.conversation_id && !receivedConvId) {
            receivedConvId = meta.conversation_id
            set({ currentConversationId: meta.conversation_id })
          }
          if (meta.ai_session_id) {
            set({ aiSessionId: meta.ai_session_id })
          }
          if (meta.triage?.type) {
            useTriageStore.getState().showTriage(
              {
                triggered: true,
                type: meta.triage.type as 'self_harm' | 'dv' | 'crisis' | 'high_intensity',
                confidence: meta.triage.confidence as 'keyword' | 'pattern' | null,
                keywords: [],
              },
              undefined
            )
          }
        },
        onChunk: (text: string, conversationId: string) => {
          if (!receivedConvId && conversationId) {
            receivedConvId = conversationId
            set({ currentConversationId: conversationId })
          }
          set((state) => ({
            streamingText: state.streamingText + text,
            isLoading: false,
          }))
        },
        onDone: () => {
          const { streamingText } = get()
          if (streamingText) {
            set((state) => ({
              messages: [
                ...state.messages,
                { role: 'assistant' as const, content: streamingText },
              ],
              streamingText: '',
              isStreaming: false,
              isLoading: false,
            }))
          } else {
            set({ isStreaming: false, isLoading: false })
          }
          get().loadConversations()
        },
        onError: (error: string, code?: string) => {
          set({
            error,
            errorCode: code || null,
            isStreaming: false,
            isLoading: false,
            streamingText: '',
          })
        },
        onWarning: (warning: string) => {
          if (warning === 'SOFT_LIMIT') {
            set({ softLimit: true })
          }
          if (warning === 'HARD_LIMIT') {
            set({ hardLimit: true })
          }
        },
      },
      activeMode
    )
  },

  startNewConversation: () => {
    set({
      currentConversationId: null,
      aiSessionId: null,
      messages: [],
      streamingText: '',
      isLoading: false,
      isStreaming: false,
      error: null,
      errorCode: null,
      softLimit: false,
      hardLimit: false,
      sessionStartTime: null,
    })
  },

  loadConversation: async (conversationId: string) => {
    set({ isLoading: true, error: null })

    const { data: msgs, error } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) {
      set({ error: error.message, isLoading: false })
      return
    }

    set({
      currentConversationId: conversationId,
      messages: (msgs || []).map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      isLoading: false,
      sidebarOpen: false,
    })
  },

  loadConversations: async () => {
    const { sessionId } = get()
    const { data, error } = await supabase
      .from('conversations')
      .select('id, title, mood, created_at, updated_at')
      .eq('session_id', sessionId)
      .order('updated_at', { ascending: false })

    if (!error && data) {
      set({ conversations: data })
    }
  },

  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
  clearError: () => set({ error: null, errorCode: null }),
  dismissSoftLimit: () => set({ softLimit: false }),

  reportUsage: async () => {
    const { aiSessionId } = get()
    if (!aiSessionId) return
    try {
      await fetch('/api/usage/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: aiSessionId }),
      })
    } catch {
      // Best effort
    }
  },
}))
