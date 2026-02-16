import { useRef, useEffect, useState } from 'react'
import { useChatStore } from '../stores/chatStore'
import { useProfileStore } from '../stores/profileStore'
import { useT } from '../lib/i18n'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import ChatInput from './ChatInput'
import WelcomeScreen from './WelcomeScreen'
import ToolkitPanel from './ToolkitPanel'
import UserProfilePanel from './UserProfilePanel'
import SolviaLogo from './SolviaLogo'

export default function ChatWindow() {
  const t = useT()

  const {
    messages,
    isLoading,
    isStreaming,
    streamingText,
    error,
    sendMessage,
    clearError,
    setSidebarOpen,
    startNewConversation,
  } = useChatStore()

  const { updateProfile, setProfileOpen, profileOpen } = useProfileStore()
  const [showToolkit, setShowToolkit] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText, isLoading])

  // Update profile when messages change
  useEffect(() => {
    const userMessages = messages
      .filter((m) => m.role === 'user')
      .map((m) => m.content)
    if (userMessages.length > 0) {
      updateProfile(userMessages)
    }
  }, [messages, updateProfile])

  const hasMessages = messages.length > 0

  /* ── Landing page (no messages yet) ── */
  if (!hasMessages && !isLoading) {
    return (
      <div className="flex-1 flex flex-col min-w-0">
        <WelcomeScreen onSelectTopic={sendMessage} onOpenToolkit={() => setShowToolkit(true)} />
        {showToolkit && <ToolkitPanel onClose={() => setShowToolkit(false)} />}
      </div>
    )
  }

  /* ── Chat view (has messages) ── */
  return (
    <>
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header with Solvia persona */}
        <header
          className="h-14 flex-shrink-0 px-4 flex items-center justify-between z-10"
          style={{
            background: 'linear-gradient(180deg, #faf8f6 0%, #f5f0eb 100%)',
            boxShadow: '0 1px 6px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)',
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-1 rounded-lg hover:bg-warm-200/60 text-warm-400 hover:text-warm-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <SolviaLogo size={32} className="rounded-full" />
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-warm-50"
                  style={{ background: '#22c55e', animation: 'breathe 3s ease-in-out infinite' }}
                />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-gray-800 leading-none">Solvia</h1>
                <p className="text-[0.6rem] sm:text-[0.65rem] text-warm-400 mt-0.5 leading-none">
                  {isStreaming ? t('header.typing') : t('header.subtitle')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Toolkit button */}
            <button
              onClick={() => setShowToolkit(true)}
              className="p-2 rounded-lg hover:bg-warm-200/60 text-warm-400 hover:text-warm-500 transition-colors"
              title={t('header.toolkit')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.384 3.173A1 1 0 014.5 17.53V6.47a1 1 0 011.536-.814l5.384 3.174a1 1 0 010 1.628zM14.25 12h.008v.008h-.008V12zm2.25 0h.008v.008h-.008V12zm2.25 0h.008v.008h-.008V12z" />
              </svg>
            </button>

            {/* Profile button */}
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className={`p-2 rounded-lg transition-colors ${
                profileOpen
                  ? 'bg-indigo-50 text-indigo-500'
                  : 'hover:bg-warm-200/60 text-warm-400 hover:text-warm-500'
              }`}
              title={t('header.profile')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </button>

            {/* New conversation */}
            <button
              onClick={() => startNewConversation()}
              className="p-2 rounded-lg hover:bg-warm-200/60 text-warm-400 hover:text-warm-500 transition-colors"
              title={t('header.newChat')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          </div>
        </header>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto relative chat-bg">
          <div className="relative z-[1] max-w-2xl mx-auto px-4 py-8">
            {messages.length <= 2 && (
              <div className="mb-6 text-center animate-fade-in-up">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50/80 border border-brand-100 text-xs sm:text-[0.65rem] text-brand-700 font-medium">
                  <span>🌿</span>
                  {t('chat.trustBadge')}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <MessageBubble key={i} role={msg.role} content={msg.content} />
            ))}
            {isStreaming && streamingText && (
              <MessageBubble role="assistant" content={streamingText} isStreaming />
            )}
            {isLoading && !streamingText && <TypingIndicator />}
            {error && (
              <div className="my-4 p-3 rounded-xl bg-red-50/80 border border-red-200/50 animate-fade-in-up backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <span className="text-red-400 text-sm">⚠</span>
                  <p className="text-sm text-red-700 flex-1">{error}</p>
                  <button onClick={clearError} className="text-xs text-red-400 hover:text-red-600 font-medium">
                    {t('common.close')}
                  </button>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <ChatInput onSend={sendMessage} disabled={isStreaming} />

        {showToolkit && <ToolkitPanel onClose={() => setShowToolkit(false)} />}
      </div>

      <UserProfilePanel />
    </>
  )
}
