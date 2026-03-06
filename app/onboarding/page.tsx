'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase-browser'
import { assignVariant } from '@/lib/experiments'
import { trackEvent } from '@/lib/analytics'
import { useT } from '@/lib/i18n'
import TilesFirst from '@/components/onboarding/TilesFirst'
import IntakeFirst from '@/components/onboarding/IntakeFirst'
import SolviaLogo from '@/components/SolviaLogo'

export default function OnboardingPage() {
  const t = useT()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [variant, setVariant] = useState<'A' | 'B' | null>(null)

  useEffect(() => {
    const run = async () => {
      const supabase = createBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/')
        return
      }

      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('onboarding_completed')
        .eq('user_id', user.id)
        .single()

      if (prefs?.onboarding_completed) {
        router.replace('/demo')
        return
      }

      const v = assignVariant('onboarding')
      setVariant(v)
      setLoading(false)
    }
    run()
  }, [router])

  const handleComplete = async (modes: string[]) => {
    const supabase = createBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !variant) return

    await supabase.from('user_preferences').upsert(
      {
        user_id: user.id,
        onboarding_completed: true,
        onboarding_variant: variant,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

    if (modes.length > 0) {
      await supabase.from('user_modes').delete().eq('user_id', user.id)
      await supabase.from('user_modes').insert(
        modes.map((mode) => ({
          user_id: user.id,
          mode,
          is_active: true,
        }))
      )
    }

    trackEvent('onboarding_completed', { variant, modes }).catch(() => {})
    router.replace('/demo')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center">
        <div className="animate-pulse">
          <SolviaLogo size={48} className="text-brand-400" />
        </div>
        <p className="mt-4 text-sm text-gray-400">{t('onboarding.loading')}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-brand-500/5 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-brand-400/5 blur-2xl" />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 pt-12 sm:pt-16 pb-16">
        <div className="text-center mb-10">
          <SolviaLogo size={56} className="mx-auto mb-4" style={{
            boxShadow: '0 4px 20px rgba(34,197,94,0.25)',
          }} />
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {t('onboarding.welcomeTitle')}
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            {t('onboarding.welcomeSubtitle')}
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-gray-200/50 shadow-xl p-6 sm:p-8">
          {variant === 'A' && <TilesFirst onComplete={handleComplete} />}
          {variant === 'B' && <IntakeFirst onComplete={handleComplete} />}
        </div>
      </div>
    </div>
  )
}
