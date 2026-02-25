'use client'

import { useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useChatStore } from '@/stores/chatStore'
import { useProfileStore } from '@/stores/profileStore'
import { useT } from '@/lib/i18n'
import MessageBubble from '@/components/MessageBubble'
import TypingIndicator from '@/components/TypingIndicator'
import ChatInput from '@/components/ChatInput'
import WelcomeScreen from '@/components/WelcomeScreen'
import ToolkitPanel from '@/components/ToolkitPanel'
import UserProfilePanel from '@/components/UserProfilePanel'
import SolviaLogo from '@/components/SolviaLogo'

function SessionTimer({ startTime }: { startTime: number }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [startTime])

  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60

  return (
    <span className="text-[0.6rem] text-warm-400 tabular-nums">
      {mins}:{secs.toString().padStart(2, '0')}
    </span>
  )
}

export default function ChatWindow() {
  const t = useT()
  const router = useRouter()

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
    softLimit,
    hardLimit,
    dismissSoftLimit,
    sessionStartTime,
    reportUsage,
  } = useChatStore()

  const { updateProfile, setProfileOpen, profileOpen } = useProfileStore()
  const [showToolkit, setShowToolkit] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText, isLoading])

  useEffect(() => {
    const userMessages = messages
      .filter((m) => m.role === 'user')
      .map((m) => m.content)
    if (userMessages.length > 0) {
      updateProfile(userMessages)
    }
  }, [messages, updateProfile])

  useEffect(() => {
    const handleUnload = () => {
      reportUsage()
    }
    window.addEventListener('beforeunload', handleUnload)
    return () => {
      window.removeEventListener('beforeunload', handleUnload)
      reportUsage()
    }
  }, [reportUsage])

  const hasMessages = messages.length > 0

  if (!hasMessages && !isLoading) {
    return (
      <div className="flex-1 flex flex-col min-w-0">
        <WelcomeScreen onSelectTopic={sendMessage} onOpenToolkit={() => setShowToolkit(true)} />
        {showToolkit && <ToolkitPanel onClose={() => setShowToolkit(false)} />}
      </div>
    )
  }

  return (
    <>
      <div className="flex-1 flex flex-col min-w-0">
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
            {sessionStartTime && <SessionTimer startTime={sessionStartTime} />}

            <button
              onClick={() => setShowToolkit(true)}
              className="p-2 rounded-lg hover:bg-warm-200/60 text-warm-400 hover:text-warm-500 transition-colors"
              title={t('header.toolkit')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.384 3.173A1 1 0 014.5 17.53V6.47a1 1 0 011.536-.814l5.384 3.174a1 1 0 010 1.628zM14.25 12h.008v.008h-.008V12zm2.25 0h.008v.008h-.008V12zm2.25 0h.008v.008h-.008V12z" />
              </svg>
            </button>

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

        {/* Soft limit warning banner */}
        {softLimit && !hardLimit && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between animate-fade-in-up">
            <div className="flex items-center gap-2">
              <span className="text-amber-500">⚠</span>
              <p className="text-xs text-amber-700 font-medium">
                {t('limits.softWarning') || 'You are approaching your usage limit. Responses may be shorter.'}
              </p>
            </div>
            <button
              onClick={dismissSoftLimit}
              className="text-xs text-amber-500 hover:text-amber-700 font-medium"
            >
              {t('common.close') || 'Close'}
            </button>
          </div>
        )}

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

          {/* Hard limit blocking overlay */}
          {hardLimit && (
            <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm mx-4 shadow-xl border border-gray-200 text-center animate-fade-in-up">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
                  <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {t('limits.hardTitle') || 'Usage limit reached'}
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  {t('limits.hardDesc') || 'Your AI budget for this billing period has been exhausted. Upgrade your plan or wait for the next period.'}
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => router.push('/pricing')}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
                    style={{
                      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                      boxShadow: '0 4px 12px rgba(34,197,94,0.3)',
                    }}
                  >
                    {t('limits.upgrade') || 'Upgrade plan'}
                  </button>
                  <button
                    onClick={() => router.push('/billing')}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-all"
                  >
                    {t('limits.viewBilling') || 'View billing'}
                  </button>
                  <button
                    onClick={() => {
                      reportUsage()
                      startNewConversation()
                    }}
                    className="text-xs text-gray-400 hover:text-gray-600 mt-1"
                  >
                    {t('limits.endSession') || 'End session'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <ChatInput onSend={sendMessage} disabled={isStreaming || hardLimit} />

        {showToolkit && <ToolkitPanel onClose={() => setShowToolkit(false)} />}
      </div>

      <UserProfilePanel />
    </>
  )
}
