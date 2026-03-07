'use client'

import { Suspense, useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase-browser'
import { useT } from '@/lib/i18n'
import LanguageSelector from '@/components/LanguageSelector'
import SolviaLogo from '@/components/SolviaLogo'

type Step = 'email' | 'otp'

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const t = useT()
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextUrl = searchParams.get('next') || '/demo'

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const supabase = createBrowserClient()

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  const handleSignInWithPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) return
    setError('')
    setLoading(true)
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      })
      if (signInError) throw signInError
      router.push(nextUrl)
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setError(msg)
      triggerShake()
    } finally {
      setLoading(false)
    }
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextUrl)}`,
        },
      })
      if (otpError) throw otpError
      setStep('otp')
      setCountdown(60)
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setError(msg)
      triggerShake()
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    const code = otp.join('')
    if (code.length !== 6) return
    setError('')
    setLoading(true)
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code,
        type: 'email',
      })
      if (verifyError) throw verifyError
      router.push(nextUrl)
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setError(msg)
      setOtp(['', '', '', '', '', ''])
      triggerShake()
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    setError('')
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
    if (newOtp.every(d => d !== '') && newOtp.join('').length === 6) {
      setTimeout(() => handleVerifyOtp(), 50)
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus()
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 0) return
    const newOtp = [...otp]
    for (let i = 0; i < 6; i++) newOtp[i] = pasted[i] || ''
    setOtp(newOtp)
    if (pasted.length === 6) setTimeout(() => handleVerifyOtp(), 50)
    else inputRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  const handleResend = async () => {
    if (countdown > 0) return
    setError('')
    setLoading(true)
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextUrl)}`,
        },
      })
      if (otpError) throw otpError
      setCountdown(60)
      setOtp(['', '', '', '', '', ''])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 500) }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #22c55e 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 rounded-full opacity-8"
          style={{ background: 'radial-gradient(circle, #86efac 0%, transparent 70%)' }} />
      </div>

      <div className={`relative z-10 w-full max-w-sm mx-4 transition-transform ${shake ? 'animate-shake' : ''}`}>
        <div className="rounded-2xl p-6 sm:p-8 backdrop-blur-xl"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}>
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
              {step === 'email' ? (t('auth.title') || 'Sign in to Solvia') : (t('auth.otpTitle') || 'Enter verification code')}
            </h1>
            <p className="text-sm text-gray-400">
              {step === 'email' ? (t('auth.subtitle') || "We'll send you a login code") : (t('auth.otpSubtitle')?.replace('{email}', email) || `Code sent to ${email}`)}
            </p>
          </div>

          {step === 'email' ? (
            <div className="space-y-4">
              <form onSubmit={(e) => { e.preventDefault(); (password.trim() ? handleSignInWithPassword(e) : handleSendOtp(e)) }} className="space-y-4">
                <input type="email" value={email}
                  onChange={(e) => { setEmail(e.target.value); setError('') }}
                  placeholder={t('auth.emailPlaceholder') || 'your@email.com'}
                  autoFocus required
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition-all focus:ring-2 focus:ring-brand-500/50"
                  style={{ background: 'rgba(255,255,255,0.08)', border: error ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)' }} />
                <input type="password" value={password}
                  onChange={(e) => { setPassword(e.target.value); setError('') }}
                  placeholder={t('auth.passwordPlaceholder') || 'Password'}
                  autoComplete="current-password"
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition-all focus:ring-2 focus:ring-brand-500/50"
                  style={{ background: 'rgba(255,255,255,0.08)', border: error ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)' }} />
                {error && <p className="text-red-400 text-xs pl-1">{error}</p>}
                <button type="submit" disabled={loading || !email.trim()}
                  className="w-full h-11 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', boxShadow: '0 4px 12px rgba(34,197,94,0.3)' }}>
                  {loading
                    ? (t('auth.sending') || 'Sending...')
                    : password.trim()
                      ? (t('auth.signInWithPassword') || 'Sign in with password')
                      : (t('auth.sendCode') || 'Send login code')}
                </button>
              </form>
              <p className="text-center text-xs text-gray-500">{t('auth.magicLinkHint') || "You'll receive a code and a magic link via email"}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input key={i} ref={(el) => { inputRefs.current[i] = el }}
                    type="text" inputMode="numeric" maxLength={1} value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-11 h-13 text-center text-lg font-bold text-white rounded-xl outline-none transition-all focus:ring-2 focus:ring-brand-500/50"
                    style={{ background: 'rgba(255,255,255,0.08)', border: error ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.15)' }} />
                ))}
              </div>
              {error && <p className="text-red-400 text-xs text-center">{error}</p>}
              {loading && <div className="flex justify-center"><div className="w-5 h-5 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" /></div>}
              <div className="flex flex-col items-center gap-2 mt-4">
                <button onClick={handleResend} disabled={countdown > 0 || loading}
                  className="text-xs text-gray-400 hover:text-white transition-colors disabled:opacity-40">
                  {countdown > 0 ? `${t('auth.resendIn') || 'Resend in'} ${countdown}s` : (t('auth.resend') || 'Resend code')}
                </button>
                <button onClick={() => { setStep('email'); setOtp(['', '', '', '', '', '']); setError('') }}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                  {t('auth.changeEmail') || 'Use a different email'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}50%{transform:translateX(8px)}75%{transform:translateX(-4px)}}.animate-shake{animation:shake .4s ease-in-out}`}</style>
    </div>
  )
}
