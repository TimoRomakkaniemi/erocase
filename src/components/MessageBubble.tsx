interface MessageBubbleProps {
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

function formatContent(text: string): string {
  const blocks = text.split(/\n\n+/)
  return blocks
    .map((block) => {
      const trimmed = block.trim()
      if (!trimmed) return ''

      const lines = trimmed.split('\n').filter((l) => l.trim())

      // Check for "Työkalu:" or "Harjoitus:" blocks → wrap in tool-card
      if (lines[0] && /^\*\*(Työkalu|Harjoitus|Tehtävä|Tekniikka|Huomio|Vinkki):/.test(lines[0])) {
        const inner = lines.map(inline).join('<br/>')
        return `<div class="tool-card"><p>${inner}</p></div>`
      }

      // Check for empathy blocks (Elina's caring remarks)
      if (lines[0] && /^\*\*(Muistathan|Tärkeää|Sinulle):/.test(lines[0])) {
        const inner = lines.map(inline).join('<br/>')
        return `<div class="empathy-card"><p>${inner}</p></div>`
      }

      // Numbered list
      if (lines.every((l) => /^\d+\.\s/.test(l.trim()))) {
        const items = lines.map((l) => `<li>${inline(l.replace(/^\d+\.\s*/, ''))}</li>`).join('')
        return `<ol>${items}</ol>`
      }
      // Bullet list
      if (lines.every((l) => /^[-*]\s/.test(l.trim()))) {
        const items = lines.map((l) => `<li>${inline(l.replace(/^[-*]\s*/, ''))}</li>`).join('')
        return `<ul>${items}</ul>`
      }
      // Paragraph
      return `<p>${lines.map(inline).join('<br/>')}</p>`
    })
    .filter(Boolean)
    .join('')
}

function inline(t: string): string {
  return t
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
}

export default function MessageBubble({ role, content, isStreaming }: MessageBubbleProps) {
  const isUser = role === 'user'

  /* ── User message ── */
  if (isUser) {
    return (
      <div className="flex justify-end mb-5 animate-fade-in-up">
        <div className="max-w-[85%] md:max-w-[70%] relative">
          <div
            className="px-4 py-3 rounded-2xl rounded-br-md text-white text-[0.85rem] leading-relaxed"
            style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              boxShadow: '0 2px 12px rgba(22,163,74,0.2), 0 1px 3px rgba(0,0,0,0.06)',
            }}
          >
            <p>{content}</p>
          </div>
        </div>
      </div>
    )
  }

  /* ── Elina's message ── */
  return (
    <div className="mb-6 animate-fade-in-up">
      {/* Avatar row */}
      <div className="flex items-center gap-2.5 mb-2.5">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #22c55e 0%, #86efac 100%)',
            boxShadow: '0 2px 8px rgba(34,197,94,0.2)',
          }}
        >
          <span className="text-xs">🤝</span>
        </div>
        <span className="text-xs font-semibold text-gray-700 tracking-wide">Elina</span>
        {isStreaming && (
          <span className="text-[0.6rem] text-brand-500 font-medium animate-pulse">kirjoittaa...</span>
        )}
      </div>

      {/* Message card */}
      <div className="ml-[38px]">
        <div
          className="rounded-2xl rounded-tl-md px-4 py-3.5 text-[0.85rem] msg-prose"
          style={{
            background: 'linear-gradient(145deg, #ffffff 0%, #faf8f6 50%, #f5f0eb 100%)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)',
            border: '1px solid rgba(214,203,191,0.35)',
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: formatContent(content) }} />
          {isStreaming && (
            <span
              className="inline-block w-[2px] h-[1.05em] ml-0.5 align-text-bottom rounded-full"
              style={{
                background: 'linear-gradient(180deg, #22c55e, #86efac)',
                animation: 'blink 1s step-end infinite',
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
