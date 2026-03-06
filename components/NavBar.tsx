'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useT } from '@/lib/i18n'
import LanguageSelector from '@/components/LanguageSelector'
import SolviaLogo from '@/components/SolviaLogo'

interface Props {
  currentView: 'home' | 'demo'
  onNavigate: (view: 'home' | 'demo') => void
}

export default function NavBar({ currentView, onNavigate }: Props) {
  const t = useT()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)

  const isDemo = currentView === 'demo'
  const forceLight = isDemo || scrolled

  useEffect(() => {
    if (isDemo) { setScrolled(true); return }
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [isDemo])

  const handleNavClick = (id: string) => {
    setMobileMenu(false)
    if (isDemo) {
      onNavigate('home')
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const NAV = [
    { label: t('home.navHome'), id: 'hero' },
    { label: t('home.navAbout'), id: 'about' },
    { label: t('home.navFeatures'), id: 'features' },
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
      ${forceLight
        ? 'bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100'
        : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <SolviaLogo size={28} />
          <span className={`font-bold text-base transition-colors ${forceLight ? 'text-gray-900' : 'text-white'}`}>
            Solvia
          </span>
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-5">
          {NAV.map(n => (
            <button key={n.id} onClick={() => handleNavClick(n.id)}
              className={`text-sm font-medium transition-colors hover:text-brand-500
                ${forceLight ? 'text-gray-600' : 'text-white/80'}`}
            >
              {n.label}
            </button>
          ))}
          <Link href="/pricing"
            className={`text-sm font-medium transition-colors hover:text-brand-500
              ${forceLight ? 'text-gray-600' : 'text-white/80'}`}
          >
            {t('nav.pricing') || 'Pricing'}
          </Link>
          <Link href="/billing"
            className={`text-sm font-medium transition-colors hover:text-brand-500
              ${forceLight ? 'text-gray-600' : 'text-white/80'}`}
          >
            {t('nav.billing') || 'Billing'}
          </Link>
          <Link href="/settings"
            className={`p-2 rounded-lg transition-colors hover:text-brand-500
              ${forceLight ? 'text-gray-600' : 'text-white/80'}`}
            title={t('nav.settings') || 'Settings'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
          <LanguageSelector variant={forceLight ? 'light' : 'dark'} />
          {isDemo ? (
            <span className="px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-600 bg-brand-50 border border-brand-100">
              Demo
            </span>
          ) : (
            <button onClick={() => onNavigate('demo')}
              className="px-4 py-1.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                boxShadow: '0 2px 8px rgba(34,197,94,0.3)',
              }}
            >
              {t('home.navDemo')}
            </button>
          )}
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageSelector variant={forceLight ? 'light' : 'dark'} />
          <button onClick={() => setMobileMenu(!mobileMenu)}
            className={`p-2 rounded-lg transition-colors ${forceLight ? 'text-gray-600' : 'text-white'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              {mobileMenu
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenu && (
        <div className="md:hidden bg-white border-b border-gray-100 shadow-lg animate-fade-in-up">
          <div className="px-4 py-3 space-y-1">
            {NAV.map(n => (
              <button key={n.id} onClick={() => handleNavClick(n.id)}
                className="block w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50"
              >
                {n.label}
              </button>
            ))}
            <Link href="/pricing" onClick={() => setMobileMenu(false)}
              className="block w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50"
            >
              {t('nav.pricing') || 'Pricing'}
            </Link>
            <Link href="/billing" onClick={() => setMobileMenu(false)}
              className="block w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50"
            >
              {t('nav.billing') || 'Billing'}
            </Link>
            <Link href="/settings" onClick={() => setMobileMenu(false)}
              className="flex items-center gap-2 w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {t('nav.settings') || 'Settings'}
            </Link>
            {isDemo ? (
              <button onClick={() => { setMobileMenu(false); onNavigate('home') }}
                className="block w-full text-left px-3 py-2.5 text-sm font-medium text-gray-500 rounded-lg hover:bg-gray-50"
              >
                {t('home.navHome')}
              </button>
            ) : (
              <button onClick={() => { setMobileMenu(false); onNavigate('demo') }}
                className="block w-full text-left px-3 py-2.5 text-sm font-semibold text-brand-600 rounded-lg hover:bg-brand-50"
              >
                {t('home.navDemo')}
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
