'use client'

import { useT } from '@/lib/i18n'

interface CrisisLine {
  labelKey: string
  number: string
  descKey?: string
}

const CRISIS_BY_COUNTRY: Record<string, CrisisLine[]> = {
  FI: [
    { labelKey: 'crisis.fi_kriisi', number: '09 2525 0111', descKey: 'crisis.fi_kriisiDesc' },
    { labelKey: 'crisis.fi_nolla', number: '080 005 005', descKey: 'crisis.fi_nollaDesc' },
    { labelKey: 'crisis.fi_paihde', number: '0800 900 45', descKey: 'crisis.fi_paihdeDesc' },
  ],
  SE: [
    { labelKey: 'crisis.se_mind', number: '90101', descKey: 'crisis.se_mindDesc' },
  ],
  DE: [
    { labelKey: 'crisis.de_telefon', number: '0800 111 0111', descKey: 'crisis.de_telefonDesc' },
  ],
  FR: [
    { labelKey: 'crisis.fr_sos', number: '09 72 39 40 50', descKey: 'crisis.fr_sosDesc' },
  ],
  ES: [
    { labelKey: 'crisis.es_esperanza', number: '717 003 717', descKey: 'crisis.es_esperanzaDesc' },
  ],
  IT: [
    { labelKey: 'crisis.it_amico', number: '02 2327 2327', descKey: 'crisis.it_amicoDesc' },
  ],
  NL: [
    { labelKey: 'crisis.nl_113', number: '0900-0113', descKey: 'crisis.nl_113Desc' },
  ],
  GB: [
    { labelKey: 'crisis.gb_samaritans', number: '116 123', descKey: 'crisis.gb_samaritansDesc' },
  ],
  IE: [
    { labelKey: 'crisis.gb_samaritans', number: '116 123', descKey: 'crisis.gb_samaritansDesc' },
  ],
}

interface CrisisResourcesProps {
  countryCode?: string
  triggerType?: string
}

export function CrisisResources({ countryCode = 'FI', triggerType }: CrisisResourcesProps) {
  const t = useT()
  const code = (countryCode || 'FI').toUpperCase().slice(0, 2)
  const lines = CRISIS_BY_COUNTRY[code] ?? CRISIS_BY_COUNTRY.FI

  return (
    <div className="flex flex-col gap-4">
      {/* EU 112 - always shown */}
      <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4">
        <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
          {t('crisis.eu112')}
        </p>
        <p className="text-xs text-amber-700/90 dark:text-amber-300/90 mb-2">
          {t('crisis.description112')}
        </p>
        <a
          href="tel:112"
          className="inline-flex items-center gap-2 text-lg font-bold text-amber-800 dark:text-amber-100 hover:underline"
        >
          <span>112</span>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </a>
      </div>

      {/* Country-specific lines */}
      {lines.map((line) => (
        <div
          key={line.labelKey}
          className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4"
        >
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
            {t(line.labelKey)}
          </p>
          {line.descKey && (
            <p className="text-xs text-amber-700/90 dark:text-amber-300/90 mb-2">
              {t(line.descKey)}
            </p>
          )}
          <a
            href={`tel:${line.number.replace(/\s/g, '').replace(/-/g, '')}`}
            className="inline-flex items-center gap-2 text-lg font-bold text-amber-800 dark:text-amber-100 hover:underline"
          >
            <span>{line.number}</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </a>
        </div>
      ))}
    </div>
  )
}
