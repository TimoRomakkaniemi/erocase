import { create } from 'zustand'

/* ═══════════════════════════════════════════════════════
   i18n – Internationalization system for Solvia
   Supports: FI, SV, EN, ES, IT, FR, DE
   Uses {{variable}} syntax for interpolation.
   ═══════════════════════════════════════════════════════ */

export type Lang = 'fi' | 'sv' | 'en' | 'es' | 'it' | 'fr' | 'de'

const VALID_LANGS: Lang[] = ['fi', 'sv', 'en', 'es', 'it', 'fr', 'de']

export const LANGUAGES: { code: Lang; label: string; flag: string }[] = [
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'fi', label: 'Suomi', flag: '🇫🇮' },
  { code: 'sv', label: 'Svenska', flag: '🇸🇪' },
]

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.')
  let current: unknown = obj
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[key]
  }
  return typeof current === 'string' ? current : undefined
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(vars[key] ?? `{{${key}}}`))
}

/* ── Zustand store ── */

interface I18nState {
  lang: Lang
  setLang: (lang: Lang) => void
}

function getInitialLang(): Lang {
  const stored = localStorage.getItem('solvia_lang')
  if (stored && VALID_LANGS.includes(stored as Lang)) return stored as Lang
  const browser = navigator.language.slice(0, 2).toLowerCase()
  if (VALID_LANGS.includes(browser as Lang)) return browser as Lang
  return 'fi'
}

export const useI18nStore = create<I18nState>((set) => ({
  lang: getInitialLang(),
  setLang: (lang: Lang) => {
    localStorage.setItem('solvia_lang', lang)
    set({ lang })
  },
}))

/* ── Translation lookup ── */

import { translations } from './translations'

export function t(key: string, vars?: Record<string, string | number>): string {
  const lang = useI18nStore.getState().lang
  const dict = translations[lang]
  const value = getNestedValue(dict as unknown as Record<string, unknown>, key)
  if (value) return interpolate(value, vars)
  const fallback = getNestedValue(translations.fi as unknown as Record<string, unknown>, key)
  if (fallback) return interpolate(fallback, vars)
  return key
}

/* ── React hook ── */

export function useT() {
  const lang = useI18nStore((s) => s.lang)
  return (key: string, vars?: Record<string, string | number>): string => {
    const dict = translations[lang]
    const value = getNestedValue(dict as unknown as Record<string, unknown>, key)
    if (value) return interpolate(value, vars)
    const fallback = getNestedValue(translations.fi as unknown as Record<string, unknown>, key)
    if (fallback) return interpolate(fallback, vars)
    return key
  }
}

/* ── Locale for date formatting ── */
export function getLocale(): string {
  const lang = useI18nStore.getState().lang
  const map: Record<Lang, string> = {
    fi: 'fi-FI', sv: 'sv-SE', en: 'en-GB', es: 'es-ES',
    it: 'it-IT', fr: 'fr-FR', de: 'de-DE',
  }
  return map[lang]
}
