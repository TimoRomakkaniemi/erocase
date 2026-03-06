'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useT } from '@/lib/i18n'

interface VoiceInputProps {
  onTranscript: (text: string) => void
  disabled?: boolean
  language?: string
}

type VoiceState = 'idle' | 'listening' | 'processing'

export default function VoiceInput({ onTranscript, disabled = false, language }: VoiceInputProps) {
  const t = useT()
  const [state, setState] = useState<VoiceState>('idle')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [finalTranscript, setFinalTranscript] = useState('')
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  const SpeechRecognitionAPI =
    typeof window !== 'undefined'
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : undefined

  const stopListening = useCallback(() => {
    const rec = recognitionRef.current
    if (rec) {
      try {
        rec.stop()
      } catch {
        // ignore
      }
      recognitionRef.current = null
    }
    setState((s) => (s === 'listening' ? 'processing' : s))
  }, [])

  const startListening = useCallback(() => {
    if (!SpeechRecognitionAPI || disabled) return

    setInterimTranscript('')
    setFinalTranscript('')
    setState('listening')

    const rec = new SpeechRecognitionAPI()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = language || navigator.language || 'en'

    rec.onresult = (event: SpeechRecognitionEvent) => {
      let interim = ''
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const text = result[0].transcript
        if (result.isFinal) {
          final += text
        } else {
          interim += text
        }
      }
      setFinalTranscript((prev) => prev + final)
      setInterimTranscript(interim)
    }

    rec.onend = () => {
      if (recognitionRef.current === rec) {
        recognitionRef.current = null
        setState((s) => (s === 'listening' ? 'processing' : s))
      }
    }

    rec.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'no-speech' || event.error === 'aborted') return
      setState('idle')
      setInterimTranscript('')
      setFinalTranscript('')
    }

    recognitionRef.current = rec
    try {
      rec.start()
    } catch {
      setState('idle')
    }
  }, [SpeechRecognitionAPI, disabled, language])

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch {
          // ignore
        }
      }
    }
  }, [])

  const handleDone = () => {
    stopListening()
    const text = (finalTranscript + interimTranscript).trim()
    if (text) {
      onTranscript(text)
    }
    setFinalTranscript('')
    setInterimTranscript('')
    setState('idle')
  }

  if (!isSupported) {
    return (
      <div className="px-3 py-2 rounded-xl bg-warm-100 text-warm-500 text-xs">
        {t('voice.notSupported')}
      </div>
    )
  }

  const isListening = state === 'listening'
  const isProcessing = state === 'processing'

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <button
        type="button"
        onClick={isListening ? handleDone : startListening}
        disabled={disabled && !isListening}
        className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all touch-manipulation
          ${isListening
            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
            : 'bg-brand-500 text-white hover:bg-brand-600 shadow-lg shadow-brand-500/25'}`}
        aria-label={isListening ? t('voice.stop') : t('voice.start')}
      >
        <svg
          className="w-6 h-6"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1 3.93c-3.95-.49-7-3.85-7-7.93h2c0 3.31 2.69 6 6 6s6-2.69 6-6h2c0 4.08-3.05 7.44-7 7.93V21h-2v-3.07z" />
        </svg>
        {isListening && (
          <span
            className="absolute inset-0 rounded-full animate-voice-pulse"
            aria-hidden
          />
        )}
      </button>

      <div className="text-center min-h-[2.5rem]">
        {isListening && (
          <p className="text-sm text-gray-600">
            {t('voice.listening')}
          </p>
        )}
        {isProcessing && (
          <p className="text-sm text-gray-500 animate-pulse">
            {t('voice.processing')}
          </p>
        )}
        {(finalTranscript || interimTranscript) && (
          <p className="text-sm text-gray-700 max-w-xs">
            {finalTranscript}
            {interimTranscript && (
              <span className="text-warm-400">{interimTranscript}</span>
            )}
          </p>
        )}
      </div>
    </div>
  )
}
