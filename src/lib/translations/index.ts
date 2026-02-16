import { fi } from './fi'
import { sv } from './sv'
import { en } from './en'
import { es } from './es'
import { it } from './it'
import { fr } from './fr'
import { de } from './de'
import type { Lang } from '../i18n'

export type TranslationTree = typeof fi

export const translations: Record<Lang, TranslationTree> = { fi, sv, en, es, it, fr, de }
