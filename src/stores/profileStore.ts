import { create } from 'zustand'

/* ═══════════════════════════════════════════════════════
   USER PROFILE – Asiakasprofilointi (EroCase)
   Rakennetaan automaattisesti keskusteluista.
   Inspiroiduttu Hedin-pilotista, sovitettu erokontekstiin.
   
   All user-facing strings are stored as translation keys
   (e.g. 'profileDynamic.exercise_emotion_wave') and
   resolved in the UI via useT().
   ═══════════════════════════════════════════════════════ */

export type EmotionalState =
  | 'hopeful' | 'neutral' | 'anxious' | 'overwhelmed'
  | 'angry' | 'grieving' | 'numb' | 'relieved' | 'confused'

export type SituationType =
  | 'considering_divorce' | 'partner_wants_divorce' | 'mutual_decision'
  | 'post_divorce' | 'reconciliation' | 'unknown'

export type DecisionStage =
  | 'exploring' | 'leaning_towards' | 'decided' | 'processing_aftermath' | 'unknown'

export type CommunicationStyle =
  | 'direct' | 'reflective' | 'emotional' | 'analytical' | 'unknown'

export type ResilienceLevel = 'high' | 'moderate' | 'low' | 'crisis'

export type SupportNeed =
  | 'emotional_support' | 'practical_advice' | 'tools_exercises'
  | 'crisis_support' | 'legal_info' | 'children_guidance' | 'self_discovery'

export type KeyConcern =
  | 'children_welfare' | 'finances' | 'housing' | 'loneliness'
  | 'identity' | 'social_stigma' | 'trust' | 'guilt'
  | 'anger_management' | 'co_parenting' | 'new_relationship'

export interface UserProfile {
  situationType: SituationType
  decisionStage: DecisionStage
  hasChildren: boolean | null
  relationshipDuration: 'short' | 'medium' | 'long' | null

  emotionalState: EmotionalState
  emotionalIntensity: number
  dominantEmotions: string[] // stores emotion keys, translated in UI

  communicationStyle: CommunicationStyle
  resilienceLevel: ResilienceLevel
  selfAwareness: 'high' | 'moderate' | 'low'
  copingMechanisms: string[]

  supportNeeds: SupportNeed[]
  keyConcerns: KeyConcern[]

  engagementLevel: 'high' | 'medium' | 'low'
  openness: 'very_open' | 'open' | 'guarded' | 'closed'
  readinessForChange: 'ready' | 'ambivalent' | 'resistant'

  // These store i18n keys (resolved via t() in UI)
  recommendedApproach: string[]
  suggestedExercises: string[]
  nextSteps: string[]
  riskFactors: string[]

  completenessScore: number
  messageCount: number
  lastUpdated: string
}

// Keywords for profile extraction (Finnish - the primary analysis language)
const EMOTION_KEYWORDS: Record<EmotionalState, string[]> = {
  hopeful: ['toivoa', 'toivon', 'onnellinen', 'parempi', 'positiivi', 'toiveikas', 'valoa', 'mahdollisuus'],
  neutral: [],
  anxious: ['pelkään', 'pelottaa', 'ahdistaa', 'huoli', 'jännittä', 'stressiä', 'levottomuus', 'epävar'],
  overwhelmed: ['liikaa', 'en jaksa', 'uupunut', 'väsynyt', 'ylivoimai', 'painaa', 'taakka', 'romaht'],
  angry: ['vihainen', 'vihaan', 'raivostuttaa', 'ärsyttää', 'pettynyt', 'pettymys', 'vituttaa', 'suututtaa', 'epäoikeud'],
  grieving: ['surua', 'surullinen', 'itkettää', 'itken', 'menetys', 'kaipaa', 'luopum', 'ikävä'],
  numb: ['tunne mitään', 'tyhjä', 'turta', 'tunteeton', 'en tunne', 'samanteke'],
  relieved: ['helpottu', 'vapautta', 'vapaa', 'helpompaa', 'kevyempi', 'rauhallisempi'],
  confused: ['hämmentyn', 'sekava', 'en tiedä', 'ymmärrä', 'miksi', 'epäselv'],
}

const SITUATION_KEYWORDS: Record<SituationType, string[]> = {
  considering_divorce: ['mietin eroa', 'pitäisikö erota', 'harkitsen eroa', 'erotako', 'parisuhde kriisi'],
  partner_wants_divorce: ['puoliso haluaa erota', 'hän haluaa erota', 'jättää minut', 'sai tietää erosta'],
  mutual_decision: ['yhdessä päätimme', 'molemmat', 'yhteinen päätös', 'sovinnollinen'],
  post_divorce: ['ero tapahtui', 'erottiin', 'ex-puoliso', 'eron jälkeen', 'entinen'],
  reconciliation: ['yritetään uudelleen', 'palata yhteen', 'korjata', 'antaa mahdollisuus'],
  unknown: [],
}

const CONCERN_KEYWORDS: Record<KeyConcern, string[]> = {
  children_welfare: ['lapset', 'lapsi', 'huoltajuus', 'tapaamis', 'koulu', 'päiväkoti', 'lasten'],
  finances: ['raha', 'talous', 'asuntolaina', 'elatusapu', 'palkka', 'velka', 'omaisuus'],
  housing: ['asunto', 'muutto', 'koti', 'asuminen', 'vuokra'],
  loneliness: ['yksin', 'yksinäi', 'eristy', 'kukaan', 'tukiverkko'],
  identity: ['kuka olen', 'identiteetti', 'oma elämä', 'unelm', 'itseni'],
  social_stigma: ['mitä muut', 'häpeä', 'arvostelu', 'sukulais', 'ympäristö', 'tuomitsev'],
  trust: ['luottamus', 'petti', 'uskottomuus', 'valehtel', 'petos'],
  guilt: ['syyllisyy', 'vika', 'oma syy', 'anteeksi', 'katumus'],
  anger_management: ['raivo', 'hallinta', 'menetän maltt', 'huudan', 'riidat'],
  co_parenting: ['yhteishuoltajuus', 'vanhemmuus', 'isä', 'äiti', 'kasvatuk', 'vuoroviik'],
  new_relationship: ['uusi suhde', 'deittai', 'tapaaminen', 'uusi kumppani'],
}

const NEED_KEYWORDS: Record<SupportNeed, string[]> = {
  emotional_support: ['tukea', 'kuuntele', 'ymmärrä', 'lohdut', 'jaksa', 'empatia'],
  practical_advice: ['neuvo', 'konkreetti', 'miten toimin', 'käytännö', 'askel'],
  tools_exercises: ['harjoitus', 'työkalu', 'tekniikka', 'menetelmä', 'keino'],
  crisis_support: ['hätä', 'kriisi', 'en kestä', 'itsetuhoi', 'vahingoitta'],
  legal_info: ['laki', 'oikeus', 'avioero', 'sopimus', 'asianajaja', 'oikeudellinen'],
  children_guidance: ['miten kerron lapsille', 'lasten hyvinvointi', 'kasvatus', 'suojem'],
  self_discovery: ['löytää itseni', 'kehittyä', 'kasv', 'vahvist', 'itsetunto'],
}

export function createEmptyProfile(): UserProfile {
  return {
    situationType: 'unknown',
    decisionStage: 'unknown',
    hasChildren: null,
    relationshipDuration: null,
    emotionalState: 'neutral',
    emotionalIntensity: 5,
    dominantEmotions: [],
    communicationStyle: 'unknown',
    resilienceLevel: 'moderate',
    selfAwareness: 'moderate',
    copingMechanisms: [],
    supportNeeds: [],
    keyConcerns: [],
    engagementLevel: 'medium',
    openness: 'open',
    readinessForChange: 'ambivalent',
    recommendedApproach: [],
    suggestedExercises: [],
    nextSteps: [],
    riskFactors: [],
    completenessScore: 0,
    messageCount: 0,
    lastUpdated: new Date().toISOString(),
  }
}

/**
 * Analyse user messages and extract/update profile.
 * User-facing strings are stored as translation keys.
 */
export function extractProfile(
  userMessages: string[],
  existingProfile: UserProfile
): UserProfile {
  const profile = { ...existingProfile }
  const allText = userMessages.join(' ').toLowerCase()
  const messageCount = userMessages.length

  profile.messageCount = messageCount
  profile.lastUpdated = new Date().toISOString()

  // ── Emotional state ──
  let maxEmotionScore = 0
  const detectedEmotions: string[] = []

  for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
    let score = 0
    for (const kw of keywords) {
      const regex = new RegExp(kw, 'gi')
      const matches = allText.match(regex)
      if (matches) score += matches.length
    }
    if (score > 0) {
      detectedEmotions.push(emotion) // store emotion key, not label
      if (score > maxEmotionScore) {
        maxEmotionScore = score
        profile.emotionalState = emotion as EmotionalState
      }
    }
  }
  profile.dominantEmotions = detectedEmotions.slice(0, 4)

  // Emotional intensity from language patterns
  const intensifiers = ['todella', 'erittäin', 'hirveästi', 'ihan', 'täysin', 'aivan', 'niin paljon']
  let intensityBoost = 0
  for (const word of intensifiers) {
    if (allText.includes(word)) intensityBoost++
  }
  profile.emotionalIntensity = Math.min(10, Math.max(1, 5 + intensityBoost + (maxEmotionScore > 3 ? 2 : 0)))

  // ── Situation type ──
  for (const [situation, keywords] of Object.entries(SITUATION_KEYWORDS)) {
    for (const kw of keywords) {
      if (allText.includes(kw)) {
        profile.situationType = situation as SituationType
        break
      }
    }
  }

  // ── Children ──
  const childKeywords = ['lapsi', 'lapset', 'lasten', 'lapseni', 'poika', 'tytär', 'teini', 'vauva']
  if (childKeywords.some(kw => allText.includes(kw))) {
    profile.hasChildren = true
  }

  // ── Key concerns ──
  const concerns = new Set(profile.keyConcerns)
  for (const [concern, keywords] of Object.entries(CONCERN_KEYWORDS)) {
    for (const kw of keywords) {
      if (allText.includes(kw)) {
        concerns.add(concern as KeyConcern)
        break
      }
    }
  }
  profile.keyConcerns = Array.from(concerns)

  // ── Support needs ──
  const needs = new Set(profile.supportNeeds)
  for (const [need, keywords] of Object.entries(NEED_KEYWORDS)) {
    for (const kw of keywords) {
      if (allText.includes(kw)) {
        needs.add(need as SupportNeed)
        break
      }
    }
  }
  profile.supportNeeds = Array.from(needs)

  // ── Communication style ──
  const questionMarks = (allText.match(/\?/g) || []).length
  const exclamationMarks = (allText.match(/!/g) || []).length
  const avgMsgLength = allText.length / Math.max(messageCount, 1)

  let detectedStyle: CommunicationStyle = 'unknown'
  if (avgMsgLength > 200 && questionMarks > 2) detectedStyle = 'analytical'
  else if (exclamationMarks > 2 || maxEmotionScore > 5) detectedStyle = 'emotional'
  else if (avgMsgLength < 50) detectedStyle = 'direct'
  else if (messageCount >= 2) detectedStyle = 'reflective'
  if (detectedStyle !== 'unknown') profile.communicationStyle = detectedStyle

  // ── Engagement level ──
  if (messageCount >= 8) profile.engagementLevel = 'high'
  else if (messageCount >= 4) profile.engagementLevel = 'medium'
  else profile.engagementLevel = 'low'

  // ── Openness ──
  const personalWords = ['tunnen', 'pelkään', 'rakastan', 'vihaan', 'toivon', 'haluan', 'uskon', 'luulen']
  const personalCount = personalWords.filter(w => allText.includes(w)).length
  if (personalCount >= 4) profile.openness = 'very_open'
  else if (personalCount >= 2) profile.openness = 'open'
  else if (messageCount > 3 && personalCount === 0) profile.openness = 'guarded'

  // ── Decision stage ──
  if (allText.includes('päätimme') || allText.includes('päätin') || allText.includes('ero on tapahtunut')) {
    profile.decisionStage = 'decided'
  } else if (allText.includes('eron jälkeen') || allText.includes('erottiin')) {
    profile.decisionStage = 'processing_aftermath'
  } else if (allText.includes('kallistun') || allText.includes('luultavasti') || allText.includes('ehkä pitäisi')) {
    profile.decisionStage = 'leaning_towards'
  } else if (allText.includes('mietin') || allText.includes('harkitsen') || allText.includes('en tiedä')) {
    profile.decisionStage = 'exploring'
  }

  // ── Resilience ──
  const crisisWords = ['en kestä', 'en jaksa', 'haluan kuolla', 'itsetuhoi', 'lopettaa']
  const strengthWords = ['selviydy', 'pystyn', 'voin', 'jaksan', 'vahva', 'onnistun']
  const crisisCount = crisisWords.filter(w => allText.includes(w)).length
  const strengthCount = strengthWords.filter(w => allText.includes(w)).length

  if (crisisCount > 0) profile.resilienceLevel = 'crisis'
  else if (strengthCount > crisisCount + 1) profile.resilienceLevel = 'high'
  else if (profile.emotionalIntensity > 7) profile.resilienceLevel = 'low'

  // ── Risk factors (translation keys) ──
  const risks: string[] = []
  if (crisisCount > 0) risks.push('profileDynamic.risk_crisis')
  if (profile.emotionalIntensity > 8) risks.push('profileDynamic.risk_intense')
  if (profile.openness === 'closed') risks.push('profileDynamic.risk_closed')
  if (concerns.has('loneliness')) risks.push('profileDynamic.risk_loneliness')
  profile.riskFactors = risks

  // ── Recommended approach (translation keys) ──
  const approaches: string[] = []
  if (profile.communicationStyle === 'emotional') approaches.push('profileDynamic.approach_empathy')
  if (profile.communicationStyle === 'analytical') approaches.push('profileDynamic.approach_analytical')
  if (profile.communicationStyle === 'direct') approaches.push('profileDynamic.approach_direct')
  if (profile.resilienceLevel === 'crisis') approaches.push('profileDynamic.approach_crisis')
  if (profile.decisionStage === 'exploring') approaches.push('profileDynamic.approach_explore')
  if (approaches.length === 0) approaches.push('profileDynamic.approach_default')
  profile.recommendedApproach = approaches

  // ── Suggested exercises (translation keys) ──
  const exercises: string[] = []
  if (profile.emotionalIntensity > 6) exercises.push('profileDynamic.exercise_emotion_wave')
  if (concerns.has('guilt')) exercises.push('profileDynamic.exercise_guilt_release')
  if (profile.decisionStage === 'exploring') exercises.push('profileDynamic.exercise_value_balance')
  if (concerns.has('children_welfare')) exercises.push('profileDynamic.exercise_kids_emotion_map')
  if (profile.emotionalState === 'anxious') exercises.push('profileDynamic.exercise_grounding')
  if (profile.emotionalState === 'angry') exercises.push('profileDynamic.exercise_anger_release')
  if (concerns.has('identity')) exercises.push('profileDynamic.exercise_identity')
  if (concerns.has('trust')) exercises.push('profileDynamic.exercise_trust_inventory')
  exercises.push('profileDynamic.exercise_daily_journal')
  profile.suggestedExercises = exercises.slice(0, 5)

  // ── Next steps (translation keys, some with variables handled via special syntax) ──
  const steps: string[] = []
  if (profile.resilienceLevel === 'crisis') {
    steps.push('profileDynamic.step_crisis_phone')
    steps.push('profileDynamic.step_crisis_professional')
  }
  if (profile.decisionStage === 'exploring') steps.push('profileDynamic.step_explore')
  if (profile.keyConcerns.length > 0) {
    // Store key + first concern key for variable interpolation in UI
    steps.push(`profileDynamic.step_next_concern|${profile.keyConcerns[0]}`)
  }
  if (messageCount < 5) steps.push('profileDynamic.step_tell_more')
  else steps.push('profileDynamic.step_try_exercise')
  profile.nextSteps = steps.slice(0, 3)

  // ── Completeness score ──
  let score = 0
  if (profile.situationType !== 'unknown') score += 15
  if (profile.decisionStage !== 'unknown') score += 10
  if (profile.hasChildren !== null) score += 10
  if (profile.emotionalState !== 'neutral') score += 10
  if (profile.dominantEmotions.length > 0) score += 10
  if (profile.keyConcerns.length > 0) score += 10
  if (profile.keyConcerns.length > 2) score += 5
  if (profile.supportNeeds.length > 0) score += 10
  if (profile.communicationStyle !== 'unknown') score += 10
  if (messageCount >= 3) score += 5
  if (messageCount >= 6) score += 5
  profile.completenessScore = Math.min(100, score)

  return profile
}

// Colors and icons (not translatable)
export const EMOTION_COLORS: Record<EmotionalState, string> = {
  hopeful: '#22c55e',
  neutral: '#94a3b8',
  anxious: '#f59e0b',
  overwhelmed: '#ef4444',
  angry: '#dc2626',
  grieving: '#6366f1',
  numb: '#9ca3af',
  relieved: '#10b981',
  confused: '#f97316',
}

export const EMOTION_ICONS: Record<EmotionalState, string> = {
  hopeful: '🌱',
  neutral: '😐',
  anxious: '😰',
  overwhelmed: '😫',
  angry: '😠',
  grieving: '😢',
  numb: '😶',
  relieved: '😌',
  confused: '🤔',
}

/* ── Zustand store ── */

interface ProfileState {
  profile: UserProfile
  profileOpen: boolean
  updateProfile: (userMessages: string[]) => void
  setProfileOpen: (open: boolean) => void
  resetProfile: () => void
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: createEmptyProfile(),
  profileOpen: false,

  updateProfile: (userMessages: string[]) => {
    const current = get().profile
    const updated = extractProfile(userMessages, current)
    set({ profile: updated })
  },

  setProfileOpen: (open: boolean) => set({ profileOpen: open }),

  resetProfile: () => set({ profile: createEmptyProfile() }),
}))
