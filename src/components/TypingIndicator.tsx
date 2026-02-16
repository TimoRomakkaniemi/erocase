import { useT } from '../lib/i18n'

export default function TypingIndicator() {
  const t = useT()

  return (
    <div className="mb-6 animate-fade-in-up">
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
        <span className="text-[0.6rem] text-brand-500 font-medium animate-pulse">{t('header.thinking')}</span>
      </div>

      <div className="ml-[38px]">
        <div
          className="inline-flex items-center gap-1.5 rounded-2xl rounded-tl-md px-5 py-3.5"
          style={{
            background: 'linear-gradient(145deg, #ffffff 0%, #faf8f6 50%, #f5f0eb 100%)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)',
            border: '1px solid rgba(214,203,191,0.35)',
          }}
        >
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full typing-dot" style={{ background: 'linear-gradient(135deg, #22c55e, #86efac)' }} />
            <div className="w-2 h-2 rounded-full typing-dot" style={{ background: 'linear-gradient(135deg, #22c55e, #86efac)' }} />
            <div className="w-2 h-2 rounded-full typing-dot" style={{ background: 'linear-gradient(135deg, #22c55e, #86efac)' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
