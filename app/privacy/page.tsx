'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useT } from '@/lib/i18n'
import NavBar from '@/components/NavBar'
import ConsentManager from '@/components/privacy/ConsentManager'
import AuditTrailView from '@/components/privacy/AuditTrailView'
import DataExport from '@/components/privacy/DataExport'
import AutoDeleteSettings from '@/components/privacy/AutoDeleteSettings'

const SECTIONS = [
  { id: 'consents', key: 'privacy.consents', icon: '✓' },
  { id: 'audit', key: 'privacy.auditTrail', icon: '📋' },
  { id: 'export', key: 'privacy.dataExport', icon: '↓' },
  { id: 'autodelete', key: 'privacy.autoDelete', icon: '🗑' },
] as const

type SectionId = (typeof SECTIONS)[number]['id']

export default function PrivacyPage() {
  const t = useT()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<SectionId>('consents')

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar
        currentView="home"
        onNavigate={(v) => {
          if (v === 'home') router.push('/')
          if (v === 'demo') router.push('/demo')
        }}
      />
      <div className="pt-24 pb-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 text-brand-600 font-medium hover:text-brand-700 mb-6"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {t('settings.backToSettings')}
          </Link>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
            {t('privacy.title')}
          </h1>

          <div className="flex flex-wrap gap-2 mb-8">
            {SECTIONS.map(({ id, key, icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveSection(id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${activeSection === id
                    ? 'bg-brand-500 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
              >
                <span>{icon}</span>
                {t(key)}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6">
              {activeSection === 'consents' && (
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('privacy.consents')}
                  </h2>
                  <ConsentManager />
                </section>
              )}
              {activeSection === 'audit' && (
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('privacy.auditTrail')}
                  </h2>
                  <AuditTrailView />
                </section>
              )}
              {activeSection === 'export' && (
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('privacy.dataExport')}
                  </h2>
                  <DataExport />
                </section>
              )}
              {activeSection === 'autodelete' && (
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('privacy.autoDelete')}
                  </h2>
                  <AutoDeleteSettings />
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
