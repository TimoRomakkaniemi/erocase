'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useT } from '@/lib/i18n'
import NavBar from '@/components/NavBar'
import SolviaLogo from '@/components/SolviaLogo'

export default function PricingPage() {
  const t = useT()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleCheckout = async (plan: 'payg' | 'starter') => {
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
      } else if (data.error === 'Unauthorized') {
        router.push('/login?next=/pricing')
      }
    } catch {
      console.error('Checkout failed')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar currentView="home" onNavigate={(v) => {
        if (v === 'home') router.push('/')
        if (v === 'demo') router.push('/demo')
      }} />

      <div className="pt-24 pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
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

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
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
          </div>

          <p className="text-center text-xs text-gray-400 mt-8">
            {t('pricing.footer') || 'All prices in EUR. Billed monthly via Stripe. Cancel anytime.'}
          </p>
        </div>
      </div>
    </div>
  )
}
