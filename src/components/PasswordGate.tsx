import { useState } from 'react'
import { useT } from '../lib/i18n'
import LanguageSelector from './LanguageSelector'
import SolviaLogo from './SolviaLogo'

const CORRECT_PASSWORD = 'tenkanen'

interface Props {
  onAuthenticated: () => void
}

export default function PasswordGate({ onAuthenticated }: Props) {
  const t = useT()
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password.trim().toLowerCase() === CORRECT_PASSWORD) {
      sessionStorage.setItem('solvia_auth', '1')
      onAuthenticated()
    } else {
      setError(true)
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      }}
    >
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #22c55e 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 rounded-full opacity-8"
          style={{ background: 'radial-gradient(circle, #86efac 0%, transparent 70%)' }} />
      </div>

      {/* Login card */}
      <div className={`relative z-10 w-full max-w-sm mx-4 ${shake ? 'animate-shake' : ''}`}>
        <div className="rounded-2xl p-6 sm:p-8 backdrop-blur-xl"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
          }}
        >
          {/* Language selector – top of card */}
          <div className="flex justify-end mb-6">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{t('auth.language')}</span>
              <LanguageSelector variant="dark" />
            </div>
          </div>

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <SolviaLogo size={64} className="rounded-2xl" />
            </div>
            <h1 className="text-xl font-bold text-white mb-1">{t('auth.title')}</h1>
            <p className="text-sm text-gray-400">{t('auth.subtitle')}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false) }}
                placeholder={t('auth.placeholder')}
                autoFocus
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: error ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
                }}
              />
              {error && (
                <p className="text-red-400 text-xs mt-2 pl-1">{t('auth.error')}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full h-11 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                boxShadow: '0 4px 12px rgba(34,197,94,0.3)',
              }}
            >
              {t('auth.button')}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          50% { transform: translateX(8px); }
          75% { transform: translateX(-4px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </div>
  )
}
