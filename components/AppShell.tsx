'use client'

import { useState, useEffect, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase-browser'
import { useT } from '@/lib/i18n'
import SolviaLogo from '@/components/SolviaLogo'
import ThemeToggle from '@/components/ThemeToggle'
import UserMenu from '@/components/UserMenu'
import LanguageSelector from '@/components/LanguageSelector'

interface UserData {
  email: string
  display_name: string | null
  role: string
  avatar: string | null
}

const NAV_ITEMS = [
  { href: '/demo', key: 'nav.chat', icon: 'chat' },
  { href: '/today', key: 'nav.today', icon: 'sun' },
  { href: '/journal', key: 'nav.journal', icon: 'book' },
  { href: '/space', key: 'nav.space', icon: 'users' },
] as const

function NavIcon({ icon, className }: { icon: string; className?: string }) {
  const cls = className || 'w-5 h-5'
  switch (icon) {
    case 'chat':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
    case 'sun':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>
    case 'book':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
    case 'users':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>
    default:
      return null
  }
}

export default function AppShell({ children }: { children: ReactNode }) {
  const t = useT()
  const pathname = usePathname()
  const [user, setUser] = useState<UserData | null>(null)
  const [mobileNav, setMobileNav] = useState(false)

  useEffect(() => {
    const load = async () => {
      const supabase = createBrowserClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('email, display_name, role, avatar')
        .eq('id', authUser.id)
        .single()

      if (profile) {
        setUser({
          email: profile.email || authUser.email || '',
          display_name: profile.display_name,
          role: profile.role || 'user',
          avatar: profile.avatar,
        })
      }
    }
    load()
  }, [])

  return (
    <div className="h-full flex flex-col">
      {/* Top bar */}
      <header className="h-14 flex-shrink-0 bg-white/95 backdrop-blur-xl border-b border-gray-100 z-40 sticky top-0">
        <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
          {/* Left: logo + mobile hamburger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNav(!mobileNav)}
              className="p-2 -ml-1 rounded-lg hover:bg-gray-100 text-gray-500 md:hidden"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                {mobileNav
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
            <Link href="/demo" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <SolviaLogo size={28} />
              <span className="font-bold text-base text-gray-900 hidden sm:block">Solvia</span>
            </Link>
          </div>

          {/* Center: desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ href, key, icon }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${active
                      ? 'text-brand-700 bg-brand-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  <NavIcon icon={icon} className="w-4 h-4" />
                  {t(key) || key.split('.')[1]}
                </Link>
              )
            })}
          </nav>

          {/* Right: theme, lang, user */}
          <div className="flex items-center gap-1">
            <ThemeToggle variant="light" />
            <LanguageSelector variant="light" />
            {user && (
              <UserMenu
                email={user.email}
                displayName={user.display_name}
                role={user.role}
                avatar={user.avatar}
              />
            )}
          </div>
        </div>
      </header>

      {/* Mobile nav overlay */}
      {mobileNav && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 md:hidden" onClick={() => setMobileNav(false)} />
          <div className="fixed top-14 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-30 md:hidden animate-fade-in-up">
            <nav className="px-4 py-3 space-y-1">
              {NAV_ITEMS.map(({ href, key, icon }) => {
                const active = pathname === href || pathname.startsWith(href + '/')
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileNav(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                      ${active
                        ? 'text-brand-700 bg-brand-50'
                        : 'text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <NavIcon icon={icon} />
                    {t(key) || key.split('.')[1]}
                  </Link>
                )
              })}
            </nav>
          </div>
        </>
      )}

      {/* Main content */}
      <main className="flex-1 min-h-0">
        {children}
      </main>
    </div>
  )
}
