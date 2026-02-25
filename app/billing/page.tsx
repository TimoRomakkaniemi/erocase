'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useT } from '@/lib/i18n'
import NavBar from '@/components/NavBar'
import { createBrowserClient } from '@/lib/supabase-browser'

interface UsageData {
  plan: string
  plan_status: string
  included_minutes_remaining: number
  current_period_start: string | null
  current_period_end: string | null
  estimated_cost_eur: number
  budget_eur: number
  tokens_in: number
  tokens_out: number
}

export default function BillingPage() {
  const t = useT()
  const router = useRouter()
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    async function fetchUsage() {
      const supabase = createBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      const { data: ledger } = await supabase
        .from('ai_usage_ledger')
        .select('*')
        .eq('user_id', user.id)
        .gte('period_end', new Date().toISOString())
        .order('period_start', { ascending: false })
        .limit(1)
        .single()

      setUsage({
        plan: profile?.plan || 'free',
        plan_status: profile?.plan_status || 'inactive',
        included_minutes_remaining: profile?.included_minutes_remaining || 0,
        current_period_start: profile?.current_period_start,
        current_period_end: profile?.current_period_end,
        estimated_cost_eur: ledger?.estimated_cost_eur || 0,
        budget_eur: ledger?.budget_eur || 0,
        tokens_in: ledger?.tokens_in || 0,
        tokens_out: ledger?.tokens_out || 0,
      })
      setLoading(false)
    }
    fetchUsage()
  }, [router])

  const handlePortal = async () => {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      console.error('Portal error')
    } finally {
      setPortalLoading(false)
    }
  }

  const budgetPercent = usage && usage.budget_eur > 0
    ? Math.min(100, (usage.estimated_cost_eur / usage.budget_eur) * 100)
    : 0

  const planLabels: Record<string, string> = {
    free: 'Free',
    payg: 'Pay-as-you-go',
    starter: 'Starter',
  }

  const statusColors: Record<string, string> = {
    active: 'text-green-700 bg-green-50 border-green-200',
    past_due: 'text-amber-700 bg-amber-50 border-amber-200',
    canceled: 'text-red-700 bg-red-50 border-red-200',
    inactive: 'text-gray-500 bg-gray-50 border-gray-200',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar currentView="home" onNavigate={(v) => {
        if (v === 'home') router.push('/')
        if (v === 'demo') router.push('/demo')
      }} />

      <div className="pt-24 pb-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
            {t('billing.title') || 'Billing & Usage'}
          </h1>

          {loading ? (
            <div className="text-center py-16 text-gray-400">Loading...</div>
          ) : !usage || usage.plan === 'free' ? (
            <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center">
              <p className="text-gray-600 mb-4">
                {t('billing.noPlan') || "You don't have an active plan yet."}
              </p>
              <button
                onClick={() => router.push('/pricing')}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
                style={{
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  boxShadow: '0 4px 12px rgba(34,197,94,0.3)',
                }}
              >
                {t('billing.choosePlan') || 'Choose a plan'}
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Plan Card */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
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
                  <p className="text-xs text-gray-400">
                    {t('billing.periodEnds') || 'Current period ends'}: {new Date(usage.current_period_end).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* Usage Card */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                  {t('billing.usage') || 'Usage this period'}
                </h3>

                {usage.plan === 'starter' && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{t('billing.includedMinutes') || 'Included minutes remaining'}</span>
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

                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{t('billing.aiBudget') || 'AI budget used'}</span>
                    <span>€{usage.estimated_cost_eur.toFixed(2)} / €{usage.budget_eur.toFixed(2)}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${budgetPercent >= 80 ? 'bg-amber-400' : 'bg-brand-400'} ${budgetPercent >= 100 ? '!bg-red-400' : ''}`}
                      style={{ width: `${budgetPercent}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400">{t('billing.tokensIn') || 'Tokens in'}</p>
                    <p className="text-sm font-semibold text-gray-900">{usage.tokens_in.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400">{t('billing.tokensOut') || 'Tokens out'}</p>
                    <p className="text-sm font-semibold text-gray-900">{usage.tokens_out.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Estimated Invoice */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  {t('billing.estimatedInvoice') || 'Estimated invoice'}
                </h3>
                <p className="text-3xl font-bold text-gray-900">
                  €{usage.plan === 'starter'
                    ? (100 + Math.max(0, (900 - usage.included_minutes_remaining) - 900) * (10 / 60)).toFixed(2)
                    : usage.estimated_cost_eur.toFixed(2)
                  }
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {t('billing.estimateNote') || 'This is an estimate. Final amount may vary.'}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handlePortal}
                  disabled={portalLoading}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                  {portalLoading ? '...' : t('billing.manageBilling') || 'Manage billing'}
                </button>
                <button
                  onClick={() => router.push('/pricing')}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
                  style={{
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    boxShadow: '0 4px 12px rgba(34,197,94,0.3)',
                  }}
                >
                  {t('billing.upgradePlan') || 'Upgrade plan'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
