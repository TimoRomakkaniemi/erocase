'use client'

import { type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import SolviaLogo from '@/components/SolviaLogo'
import ThemeToggle from '@/components/ThemeToggle'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: 'chart' },
  { href: '/admin/users', label: 'Users', icon: 'users' },
  { href: '/admin/analytics', label: 'Analytics', icon: 'analytics' },
  { href: '/admin/moderation', label: 'Moderation', icon: 'shield' },
  { href: '/admin/settings', label: 'Settings', icon: 'cog' },
] as const

function Icon({ name, className }: { name: string; className?: string }) {
  const cls = className || 'w-5 h-5'
  switch (name) {
    case 'chart': return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
    case 'users': return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
    case 'analytics': return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" /></svg>
    case 'shield': return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
    case 'cog': return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    default: return null
  }
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col shrink-0 hidden md:flex">
        <div className="p-4 flex items-center gap-3 border-b border-gray-800">
          <SolviaLogo size={32} />
          <div>
            <p className="text-sm font-bold">Solvia Admin</p>
            <p className="text-[0.6rem] text-gray-400">Management Panel</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ href, label, icon }) => {
            const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${active
                    ? 'bg-brand-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
              >
                <Icon name={icon} className="w-4.5 h-4.5" />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-gray-800 space-y-1">
          <Link
            href="/demo"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>
            Back to App
          </Link>
          <div className="px-3 py-1">
            <ThemeToggle variant="dark" />
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-12 bg-gray-900 text-white flex items-center px-4 gap-3 z-50">
        <SolviaLogo size={24} />
        <span className="text-sm font-bold flex-1">Admin</span>
        <nav className="flex gap-1">
          {NAV.map(({ href, icon }) => {
            const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
            return (
              <Link key={href} href={href} className={`p-2 rounded-lg ${active ? 'bg-brand-600' : 'hover:bg-gray-800'}`}>
                <Icon name={icon} className="w-4 h-4" />
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto bg-gray-50 md:pt-0 pt-12">
        {children}
      </div>
    </div>
  )
}
