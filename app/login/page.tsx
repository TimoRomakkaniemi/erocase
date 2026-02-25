'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase-browser'
import { useT } from '@/lib/i18n'
import LanguageSelector from '@/components/LanguageSelector'
import SolviaLogo from '@/components/SolviaLogo'

export default function LoginPage() {
  const t = useT()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const [loading, setLoading] = useState(false)

  const supabase = createBrowserClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        })
        if (signUpError) throw signUpError
        router.push('/')
        router.refresh()
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
        if (signInError) throw signInError
        router.push('/')
        router.refresh()
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setError(msg)
      setShake(true)
      setTimeout(() => setShake(false), 500)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #22c55e 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 rounded-full opacity-8"
          style={{ background: 'radial-gradient(circle, #86efac 0%, transparent 70%)' }}
        />
      </div>

      <div className={`relative z-10 w-full max-w-sm mx-4 ${shake ? 'animate-shake' : ''}`}>
        <div
          className="rounded-2xl p-6 sm:p-8 backdrop-blur-xl"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
          }}
        >
          <div className="flex justify-end mb-6">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{t('auth.language')}</span>
              <LanguageSelector variant="dark" />
            </div>
          </div>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <SolviaLogo size={64} className="rounded-2xl" />
            </div>
            <h1 className="text-xl font-bold text-white mb-1">
              {isSignUp ? 'Create your account' : 'Sign in to Solvia'}
            </h1>
            <p className="text-sm text-gray-400">
              {isSignUp
                ? 'Start your wellbeing journey'
                : 'Welcome back'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError('') }}
              placeholder="Email"
              autoFocus
              required
              className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: error ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
              }}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              placeholder="Password"
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: error ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
              }}
            />
            {error && <p className="text-red-400 text-xs pl-1">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                boxShadow: '0 4px 12px rgba(34,197,94,0.3)',
              }}
            >
              {loading ? '...' : isSignUp ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError('') }}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
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
