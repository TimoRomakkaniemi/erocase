'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useT } from '@/lib/i18n'
import AppShell from '@/components/AppShell'
import SolviaLogo from '@/components/SolviaLogo'
import { createBrowserClient } from '@/lib/supabase-browser'

interface UsageData {
  plan: string
  plan_status: string
  included_minutes_remaining: number
  current_period_end: string | null
  estimated_cost_eur: number
  budget_eur: number
  tokens_in: number
  tokens_out: number
  total_billable_minutes: number
  linked_partner_id: string | null
  partner_display: string | null
}

export default function PricingPage() {
  const t = useT()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [usageLoading, setUsageLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    async function fetchUsage() {
      try {
        const supabase = createBrowserClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setUsageLoading(false); return }

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (!profile || profile.plan === 'free') { setUsageLoading(false); return }

        let partnerDisplay: string | null = null
        if (profile.plan === 'couple') {
          if (profile.linked_partner_id) {
            const { data: sub } = await supabase
              .from('profiles')
              .select('email, display_name')
              .eq('id', profile.linked_partner_id)
              .single()
            partnerDisplay = sub?.display_name || sub?.email || null
          } else {
            const { data: partner } = await supabase
              .from('profiles')
              .select('email, display_name')
              .eq('linked_partner_id', user.id)
              .single()
            partnerDisplay = partner?.display_name || partner?.email || null
          }
        }

        const { data: ledger } = await supabase
          .from('ai_usage_ledger')
          .select('*')
          .eq('user_id', user.id)
          .gte('period_end', new Date().toISOString())
          .order('period_start', { ascending: false })
          .limit(1)
          .single()

        const { data: sessions } = await supabase
          .from('ai_sessions')
          .select('billable_minutes')
          .eq('user_id', user.id)
          .eq('status', 'ENDED')

        const totalBillableMinutes = (sessions || []).reduce(
          (sum: number, s: { billable_minutes: number }) => sum + (s.billable_minutes || 0), 0
        )

        setUsage({
          plan: profile.plan,
          plan_status: profile.plan_status || 'inactive',
          included_minutes_remaining: profile.included_minutes_remaining || 0,
          current_period_end: profile.current_period_end,
          estimated_cost_eur: ledger?.estimated_cost_eur || 0,
          budget_eur: ledger?.budget_eur || 0,
          tokens_in: ledger?.tokens_in || 0,
          tokens_out: ledger?.tokens_out || 0,
          total_billable_minutes: totalBillableMinutes,
          linked_partner_id: profile.linked_partner_id || null,
          partner_display: partnerDisplay,
        })
      } catch {
        // User not logged in or error — just show pricing
      } finally {
        setUsageLoading(false)
      }
    }
    fetchUsage()
  }, [])

  const handleCheckout = async (plan: 'payg' | 'starter' | 'couple') => {
    setCheckoutError(null)
    setLoading(plan)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
        return
      }
      if (res.status === 401) {
        router.push('/login?next=/pricing')
        return
      }
      if (res.status === 503 || res.status === 500 || !res.ok) {
        setCheckoutError(t('errors.checkoutUnavailable'))
        return
      }
    } catch {
      setCheckoutError(t('errors.checkoutUnavailable'))
    } finally {
      setLoading(null)
    }
  }

  const handlePortal = async () => {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      // Portal error
    } finally {
      setPortalLoading(false)
    }
  }

  const budgetPercent = usage && usage.budget_eur > 0
    ? Math.min(100, (usage.estimated_cost_eur / usage.budget_eur) * 100)
    : 0

  const planLabels: Record<string, string> = {
    payg: 'Pay-as-you-go',
    starter: 'Starter',
    couple: 'Couple',
  }

  const statusColors: Record<string, string> = {
    active: 'text-green-700 bg-green-50 border-green-200',
    past_due: 'text-amber-700 bg-amber-50 border-amber-200',
    canceled: 'text-red-700 bg-red-50 border-red-200',
    inactive: 'text-gray-500 bg-gray-50 border-gray-200',
  }

  const estimatedInvoice = usage
    ? usage.plan === 'starter' || usage.plan === 'couple'
      ? (100 + Math.max(0, usage.total_billable_minutes - 900) * (10 / 60))
      : usage.plan === 'payg'
        ? usage.total_billable_minutes * (10 / 60)
        : usage.estimated_cost_eur
    : 0

  return (
    <AppShell>
      <div className="py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {checkoutError && (
            <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <span className="text-amber-500 mt-0.5">⚠</span>
              <p className="flex-1 text-sm font-medium text-amber-800">{checkoutError}</p>
              <button
                type="button"
                onClick={() => setCheckoutError(null)}
                className="text-amber-600 hover:text-amber-800 text-sm font-medium"
              >
                {t('common.close')}
              </button>
            </div>
          )}

          {/* Current Plan & Usage (if subscribed) */}
          {!usageLoading && usage && (
            <div className="mb-10 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                      {t('billing.currentPlan') || 'Current plan'}
                    </p>
                    <h2 className="text-lg font-bold text-gray-900">
                      {planLabels[usage.plan] || usage.plan}
                    </h2>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[usage.plan_status] || statusColors.inactive}`}>
                    {usage.plan_status}
                  </span>
                </div>

                {usage.current_period_end && (
                  <p className="text-xs text-gray-400 mb-4">
                    {t('billing.periodEnds') || 'Current period ends'}: {new Date(usage.current_period_end).toLocaleDateString()}
                  </p>
                )}

                {usage.plan === 'couple' && usage.partner_display && (
                  <p className="text-xs text-gray-600 mb-4">
                    {t('billing.partnerIncluded') || 'Partner included'}: {usage.partner_display}
                  </p>
                )}

                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  {(usage.plan === 'starter' || usage.plan === 'couple') && (
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{t('billing.includedMinutes') || 'Included minutes'}</span>
                        <span>{usage.included_minutes_remaining} min</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-400 rounded-full transition-all"
                          style={{ width: `${Math.min(100, (usage.included_minutes_remaining / 900) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{t('billing.aiBudget') || 'AI budget'}</span>
                      <span>€{usage.estimated_cost_eur.toFixed(2)} / €{usage.budget_eur.toFixed(2)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${budgetPercent >= 80 ? 'bg-amber-400' : 'bg-brand-400'} ${budgetPercent >= 100 ? '!bg-red-400' : ''}`}
                        style={{ width: `${budgetPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-400">{t('billing.tokensIn') || 'Tokens in'}</p>
                      <p className="text-sm font-semibold text-gray-900">{usage.tokens_in.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400">{t('billing.tokensOut') || 'Tokens out'}</p>
                      <p className="text-sm font-semibold text-gray-900">{usage.tokens_out.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400">{t('billing.estimatedInvoice') || 'Estimated'}</p>
                      <p className="text-sm font-bold text-gray-900">€{estimatedInvoice.toFixed(2)}</p>
                    </div>
                  </div>
                  <button
                    onClick={handlePortal}
                    disabled={portalLoading}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-50"
                  >
                    {portalLoading ? '...' : t('billing.manageBilling') || 'Manage billing'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Pricing header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center mb-4">
              <SolviaLogo size={48} />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              {t('pricing.title') || 'Simple, transparent pricing'}
            </h1>
            <p className="text-gray-500 max-w-xl mx-auto">
              {t('pricing.subtitle') || 'Choose the plan that works best for you. Cancel anytime.'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* PAYG Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 hover:border-brand-300 transition-all hover:shadow-lg">
              <div className="mb-6">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-100 mb-3">
                  {t('pricing.payg') || 'Pay-as-you-go'}
                </span>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold text-gray-900">€10</span>
                  <span className="text-gray-500 text-sm">/ {t('pricing.hour') || 'hour'}</span>
                </div>
                <p className="text-sm text-gray-500">
                  {t('pricing.paygDesc') || 'Billed monthly based on usage'}
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  t('pricing.paygFeat1') || 'No commitment, pay only for what you use',
                  t('pricing.paygFeat2') || 'Per-minute billing, rounded to the minute',
                  t('pricing.paygFeat3') || 'Full access to all Solvia features',
                  t('pricing.paygFeat4') || 'Cancel anytime',
                ].map((feat, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {feat}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout('payg')}
                disabled={loading !== null}
                className="w-full py-3 rounded-xl text-sm font-semibold text-brand-700 bg-brand-50 border border-brand-200 hover:bg-brand-100 transition-all disabled:opacity-50"
              >
                {loading === 'payg' ? '...' : t('pricing.paygCta') || 'Get started'}
              </button>
            </div>

            {/* Starter Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-brand-400 hover:shadow-lg transition-all relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-brand-500 shadow-sm">
                  {t('pricing.popular') || 'Most popular'}
                </span>
              </div>

              <div className="mb-6">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-100 mb-3">
                  Starter
                </span>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold text-gray-900">€100</span>
                  <span className="text-gray-500 text-sm">/ {t('pricing.month') || 'month'}</span>
                </div>
                <p className="text-sm text-gray-500">
                  {t('pricing.starterDesc') || '15 hours included, then €10/hr overage'}
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  t('pricing.starterFeat1') || '15 hours of Solvia included per month',
                  t('pricing.starterFeat2') || 'Overage billed at €10/hour',
                  t('pricing.starterFeat3') || 'Priority support',
                  t('pricing.starterFeat4') || 'Usage dashboard & billing portal',
                ].map((feat, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {feat}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout('starter')}
                disabled={loading !== null}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  boxShadow: '0 4px 12px rgba(34,197,94,0.3)',
                }}
              >
                {loading === 'starter' ? '...' : t('pricing.starterCta') || 'Subscribe now'}
              </button>
            </div>

            {/* Couple Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 hover:border-brand-300 transition-all hover:shadow-lg">
              <div className="mb-6">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-100 mb-3">
                  {t('pricing.coupleTitle') || 'Couple'}
                </span>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold text-gray-900">
                    {process.env.NEXT_PUBLIC_COUPLE_PRICE || t('pricing.couplePrice') || 'TBD'}
                  </span>
                  <span className="text-gray-500 text-sm">/ {t('pricing.month') || 'month'}</span>
                </div>
                <p className="text-sm text-gray-500">
                  {t('pricing.coupleDesc') || 'Partner plan for two'}
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  t('pricing.coupleFeature1') || 'For two',
                  t('pricing.coupleFeature2') || 'Partner Space included',
                  t('pricing.coupleFeature3') || '15h shared usage',
                  t('pricing.coupleFeature4') || 'One person pays',
                ].map((feat, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {feat}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout('couple')}
                disabled={loading !== null}
                className="w-full py-3 rounded-xl text-sm font-semibold text-brand-700 bg-brand-50 border border-brand-200 hover:bg-brand-100 transition-all disabled:opacity-50"
              >
                {loading === 'couple' ? '...' : t('pricing.starterCta') || 'Subscribe now'}
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-8">
            {t('pricing.footer') || 'All prices in EUR. Billed monthly via Stripe. Cancel anytime.'}
          </p>
        </div>
      </div>
    </AppShell>
  )
}
