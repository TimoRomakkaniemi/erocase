'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastContextValue {
  toast: (message: string, type?: 'success' | 'error' | 'info') => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

let nextId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = ++nextId
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  const dismiss = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const typeStyles = {
    success: 'bg-brand-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-gray-800 text-white',
  }

  const typeIcons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-fade-in-up ${typeStyles[t.type]}`}
            style={{ animation: 'fadeInScale 0.2s ease-out' }}
          >
            <span className="text-xs font-bold w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              {typeIcons[t.type]}
            </span>
            <span className="flex-1">{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="opacity-60 hover:opacity-100 ml-2 text-xs">
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
