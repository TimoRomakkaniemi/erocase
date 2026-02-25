'use client'

import { useState, useRef, useEffect } from 'react'
import { useI18nStore, LANGUAGES, type Lang } from '@/lib/i18n'

interface Props {
  variant?: 'dark' | 'light'
}

export default function LanguageSelector({ variant = 'dark' }: Props) {
  const { lang, setLang } = useI18nStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isDark = variant === 'dark'

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const current = LANGUAGES.find((l) => l.code === lang)!

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold transition-colors select-none
                   ${isDark ? 'hover:bg-white/10' : 'hover:bg-warm-200/60'}`}
        style={{ color: isDark ? 'rgba(255,255,255,0.7)' : '#a08977' }}
      >
        <span className="text-sm">{current.flag}</span>
        <span className="uppercase tracking-wide">{current.code}</span>
        <svg
          className={`w-3 h-3 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 w-36 rounded-xl overflow-hidden z-50 animate-fade-in-up"
          style={{
            background: 'linear-gradient(180deg, #1f2937 0%, #111827 100%)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code as Lang); setOpen(false) }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors
                ${l.code === lang
                  ? 'bg-brand-500/20 text-brand-400'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
            >
              <span className="text-sm">{l.flag}</span>
              <span className="flex-1 text-left">{l.label}</span>
              {l.code === lang && (
                <svg className="w-3.5 h-3.5 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
