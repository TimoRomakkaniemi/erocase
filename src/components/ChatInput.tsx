import { useState, useRef, useEffect } from 'react'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled: boolean
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = Math.min(el.scrollHeight, 150) + 'px'
    }
  }, [input])

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const hasText = input.trim().length > 0

  return (
    <div
      className="flex-shrink-0 px-4 py-3"
      style={{
        background: 'linear-gradient(180deg, rgba(250,248,246,0) 0%, #faf8f6 30%)',
      }}
    >
      <div className="max-w-2xl mx-auto">
        <div
          className={`flex items-end gap-2 rounded-2xl px-4 py-2.5 transition-all duration-200
            ${disabled ? 'opacity-60' : ''}`}
          style={{
            background: 'linear-gradient(145deg, #ffffff 0%, #faf8f6 100%)',
            boxShadow: hasText && !disabled
              ? '0 2px 12px rgba(34,197,94,0.1), 0 1px 4px rgba(0,0,0,0.05), inset 0 0 0 1.5px rgba(34,197,94,0.25)'
              : '0 1px 6px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03), inset 0 0 0 1px rgba(214,203,191,0.4)',
            transition: 'box-shadow 0.2s ease',
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Kerro tilanteestasi..."
            disabled={disabled}
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm text-gray-800 placeholder-warm-300
                       py-1.5 focus:outline-none disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={!hasText || disabled}
            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
            style={{
              background: hasText && !disabled
                ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                : 'transparent',
              boxShadow: hasText && !disabled
                ? '0 2px 8px rgba(22,163,74,0.25)'
                : 'none',
              color: hasText && !disabled ? '#fff' : '#d6cbbf',
              transform: hasText && !disabled ? 'scale(1)' : 'scale(0.92)',
              opacity: hasText && !disabled ? 1 : 0.6,
            }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
            </svg>
          </button>
        </div>

        {/* Subtle hint */}
        <p className="text-center text-[0.6rem] text-warm-300 mt-2 select-none">
          Enter lähettää · Shift+Enter rivinvaihto
        </p>
      </div>
    </div>
  )
}
