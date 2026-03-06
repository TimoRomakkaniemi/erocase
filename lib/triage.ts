/**
 * Triage detection logic for safety screening.
 * Keyword-based detection with multi-language support (Finnish + English).
 */

export interface TriageResult {
  triggered: boolean
  type: 'self_harm' | 'dv' | 'crisis' | 'high_intensity' | null
  confidence: 'keyword' | 'pattern' | null
  keywords: string[]
}

const SELF_HARM_KEYWORDS = [
  'itsemurha',
  'tappaa itseni',
  'suicide',
  'haluan kuolla',
  'en jaksa enää',
  'want to die',
  'self-harm',
  'viiltely',
  'itsetuho',
  'end my life',
  'kill myself',
  'take my life',
  'ei ole järkeä elää',
  'no reason to live',
]

const DV_KEYWORDS = [
  'lyö minua',
  'väkivalta',
  'pelkään puolisoa',
  'uhkaa',
  'pakottaa',
  'hits me',
  'domestic violence',
  'afraid of partner',
  'vasten tahtoa',
  'against my will',
  'lyönyt',
  'hakkaa',
  'perheväkivalta',
  'puolisoväkivalta',
  'kumppaniväkivalta',
  'battered',
  'abusive partner',
  'pelkään kumppaniani',
  'pakotetaan',
  'coerced',
]

const CRISIS_KEYWORDS = [
  'hätä',
  'en pysty',
  'ei ole turvallista',
  'emergency',
  'not safe',
  'ei turvallista',
  'en selviä',
  'can\'t cope',
  'ei jaksa enää',
  'kriisi',
  'crisis',
  'heti apua',
  'need help now',
  'välitön apu',
  'immediate help',
]

const URGENT_WORDS = [
  'apu',
  'help',
  'heti',
  'now',
  'nyt',
  'kiire',
  'urgent',
  'hätä',
  'emergency',
  'please',
  'pyydän',
  'tarvitsen',
  'need',
]

function normalizeText(text: string): string {
  return text.toLowerCase().trim().normalize('NFD').replace(/\p{Diacritic}/gu, '')
}

function findMatches(text: string, keywords: string[]): string[] {
  const normalized = normalizeText(text)
  const matches: string[] = []
  for (const kw of keywords) {
    const normalizedKw = normalizeText(kw)
    if (normalized.includes(normalizedKw)) {
      matches.push(kw)
    }
  }
  return matches
}

function detectHighIntensity(text: string): boolean {
  const trimmed = text.trim()
  if (trimmed.length < 10) return false

  // Multiple exclamation marks
  const exclamationCount = (trimmed.match(/!/g) || []).length
  if (exclamationCount >= 2) return true

  // ALL CAPS (more than 50% of letters)
  const letters = trimmed.replace(/\s/g, '').replace(/[^a-zA-ZäöåÄÖÅ]/g, '')
  if (letters.length >= 5) {
    const upperCount = (letters.match(/[A-ZÄÖÅ]/g) || []).length
    if (upperCount / letters.length >= 0.7) return true
  }

  // Repeated urgent words
  const normalized = normalizeText(text)
  let urgentCount = 0
  for (const word of URGENT_WORDS) {
    const wordNorm = normalizeText(word)
    const regex = new RegExp(wordNorm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
    const matches = normalized.match(regex) || []
    urgentCount += matches.length
  }
  if (urgentCount >= 2) return true

  return false
}

/**
 * Check a message for triage triggers.
 * Priority: self_harm > dv > crisis > high_intensity
 */
export function checkTriage(message: string): TriageResult {
  if (!message || typeof message !== 'string') {
    return { triggered: false, type: null, confidence: null, keywords: [] }
  }

  const selfHarmMatches = findMatches(message, SELF_HARM_KEYWORDS)
  if (selfHarmMatches.length > 0) {
    return {
      triggered: true,
      type: 'self_harm',
      confidence: 'keyword',
      keywords: selfHarmMatches,
    }
  }

  const dvMatches = findMatches(message, DV_KEYWORDS)
  if (dvMatches.length > 0) {
    return {
      triggered: true,
      type: 'dv',
      confidence: 'keyword',
      keywords: dvMatches,
    }
  }

  const crisisMatches = findMatches(message, CRISIS_KEYWORDS)
  if (crisisMatches.length > 0) {
    return {
      triggered: true,
      type: 'crisis',
      confidence: 'keyword',
      keywords: crisisMatches,
    }
  }

  if (detectHighIntensity(message)) {
    return {
      triggered: true,
      type: 'high_intensity',
      confidence: 'pattern',
      keywords: [],
    }
  }

  return { triggered: false, type: null, confidence: null, keywords: [] }
}
