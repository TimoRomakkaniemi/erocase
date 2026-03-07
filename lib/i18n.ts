import { create } from 'zustand'

/* ═══════════════════════════════════════════════════════
   i18n – Internationalization system for Solvia
   Supports: FI, SV, EN, ES, IT, FR, DE
   Uses {{variable}} syntax for interpolation.
   ═══════════════════════════════════════════════════════ */

export type Lang = 'fi' | 'sv' | 'en' | 'es' | 'it' | 'fr' | 'de' | 'nl'

const VALID_LANGS: Lang[] = ['fi', 'sv', 'en', 'es', 'it', 'fr', 'de', 'nl']

export const LANGUAGES: { code: Lang; label: string; flag: string }[] = [
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
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

/** Lookup: flat root key first (e.g. 'auth.emailPlaceholder'), then nested (e.g. auth.title). */
function getTranslationValue(dict: Record<string, unknown>, key: string): string | undefined {
  const flat = dict[key]
  if (typeof flat === 'string') return flat
  return getNestedValue(dict, key)
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
  if (typeof window === 'undefined') return 'fi'
  try {
    const stored = localStorage.getItem('solvia_lang')
    if (stored && VALID_LANGS.includes(stored as Lang)) return stored as Lang
    const browser = navigator.language.slice(0, 2).toLowerCase()
    if (VALID_LANGS.includes(browser as Lang)) return browser as Lang
  } catch {
    // SSR or localStorage unavailable
  }
  return 'fi'
}

export const useI18nStore = create<I18nState>((set) => ({
  lang: getInitialLang(),
  setLang: (lang: Lang) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('solvia_lang', lang)
    }
    set({ lang })
  },
}))

/* ── Translation lookup ── */

import { translations } from '@/lib/translations'

export function t(key: string, vars?: Record<string, string | number>): string {
  const lang = useI18nStore.getState().lang
  const dict = translations[lang] as unknown as Record<string, unknown>
  const value = getTranslationValue(dict, key)
  if (value) return interpolate(value, vars)
  const fallback = getTranslationValue(translations.fi as unknown as Record<string, unknown>, key)
  if (fallback) return interpolate(fallback, vars)
  return key
}

/* ── React hook ── */

export function useT() {
  const lang = useI18nStore((s) => s.lang)
  return (key: string, vars?: Record<string, string | number>): string => {
    const dict = translations[lang] as unknown as Record<string, unknown>
    const value = getTranslationValue(dict, key)
    if (value) return interpolate(value, vars)
    const fallback = getTranslationValue(translations.fi as unknown as Record<string, unknown>, key)
    if (fallback) return interpolate(fallback, vars)
    return key
  }
}

/* ── Locale for date formatting ── */
export function getLocale(): string {
  const lang = useI18nStore.getState().lang
  const map: Record<Lang, string> = {
    fi: 'fi-FI', sv: 'sv-SE', en: 'en-GB', es: 'es-ES',
    it: 'it-IT', fr: 'fr-FR', de: 'de-DE', nl: 'nl-NL',
  }
  return map[lang]
}
