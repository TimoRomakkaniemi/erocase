import { create } from 'zustand'

/* ═══════════════════════════════════════════════════════
   USER PROFILE – Asiakasprofilointi (Solvia)
   Rakennetaan automaattisesti keskusteluista.
   Kattava elämänhaasteiden tuki: parisuhde, yksinäisyys,
   mielenterveys, päihteet, vanhemmuus, talous, suru.
   
   All user-facing strings are stored as translation keys
   (e.g. 'profileDynamic.exercise_thought_record') and
   resolved in the UI via useT().
   ═══════════════════════════════════════════════════════ */

export type EmotionalState =
  | 'hopeful' | 'neutral' | 'anxious' | 'overwhelmed'
  | 'angry' | 'grieving' | 'numb' | 'relieved' | 'confused'

export type SituationType =
  | 'relationship_crisis' | 'loneliness' | 'anxiety_depression'
  | 'substance_use' | 'parenting' | 'financial_stress'
  | 'grief_loss' | 'burnout' | 'unknown'

export type DecisionStage =
  | 'exploring' | 'seeking_help' | 'making_changes' | 'in_recovery' | 'unknown'

export type CommunicationStyle =
  | 'direct' | 'reflective' | 'emotional' | 'analytical' | 'unknown'

export type ResilienceLevel = 'high' | 'moderate' | 'low' | 'crisis'

export type SupportNeed =
  | 'emotional_support' | 'practical_advice' | 'tools_exercises'
  | 'crisis_support' | 'addiction_support' | 'parenting_guidance'
  | 'financial_guidance' | 'grief_support' | 'self_discovery'

export type KeyConcern =
  | 'relationship' | 'loneliness' | 'anxiety' | 'depression'
  | 'substance_use' | 'self_harm' | 'finances' | 'housing'
  | 'parenting' | 'grief' | 'work_stress' | 'sleep'
  | 'identity' | 'anger_management'

export interface UserProfile {
  situationType: SituationType
  decisionStage: DecisionStage
  hasChildren: boolean | null
  relationshipDuration: 'short' | 'medium' | 'long' | null

  emotionalState: EmotionalState
  emotionalIntensity: number
  dominantEmotions: string[]

  communicationStyle: CommunicationStyle
  resilienceLevel: ResilienceLevel
  selfAwareness: 'high' | 'moderate' | 'low'
  copingMechanisms: string[]

  supportNeeds: SupportNeed[]
  keyConcerns: KeyConcern[]

  engagementLevel: 'high' | 'medium' | 'low'
  openness: 'very_open' | 'open' | 'guarded' | 'closed'
  readinessForChange: 'ready' | 'ambivalent' | 'resistant'

  recommendedApproach: string[]
  suggestedExercises: string[]
  nextSteps: string[]
  riskFactors: string[]

  completenessScore: number
  messageCount: number
  lastUpdated: string
}

const EMOTION_KEYWORDS: Record<EmotionalState, string[]> = {
  hopeful: ['toivoa', 'toivon', 'onnellinen', 'parempi', 'positiivi', 'toiveikas', 'valoa', 'mahdollisuus'],
  neutral: [],
  anxious: ['pelkään', 'pelottaa', 'ahdistaa', 'huoli', 'jännittä', 'stressiä', 'levottomuus', 'epävar', 'paniikki'],
  overwhelmed: ['liikaa', 'en jaksa', 'uupunut', 'väsynyt', 'ylivoimai', 'painaa', 'taakka', 'romaht', 'burnout', 'loppuun palanu'],
  angry: ['vihainen', 'vihaan', 'raivostuttaa', 'ärsyttää', 'pettynyt', 'pettymys', 'vituttaa', 'suututtaa', 'epäoikeud'],
  grieving: ['surua', 'surullinen', 'itkettää', 'itken', 'menetys', 'kaipaa', 'luopum', 'ikävä', 'kuollut', 'kuoli', 'menehty'],
  numb: ['tunne mitään', 'tyhjä', 'turta', 'tunteeton', 'en tunne', 'samanteke', 'apaattinen'],
  relieved: ['helpottu', 'vapautta', 'vapaa', 'helpompaa', 'kevyempi', 'rauhallisempi'],
  confused: ['hämmentyn', 'sekava', 'en tiedä', 'ymmärrä', 'miksi', 'epäselv'],
}

const SITUATION_KEYWORDS: Record<SituationType, string[]> = {
  relationship_crisis: ['mietin eroa', 'pitäisikö erota', 'harkitsen eroa', 'erotako', 'parisuhde kriisi', 'suhde', 'puoliso', 'kumppani', 'ero', 'avioero', 'riitely', 'pettäminen', 'uskottomuus'],
  loneliness: ['yksinäi', 'eristy', 'kukaan ei', 'yksin', 'ei ystäviä', 'ei kavereita', 'sosiaalinen', 'ulkopuoli'],
  anxiety_depression: ['ahdistus', 'masennus', 'masentunut', 'paniikki', 'ahdistuneisuus', 'depressio', 'mielenterveys', 'mielialahäiriö'],
  substance_use: ['alkoholi', 'huume', 'päihde', 'juominen', 'riippuvuus', 'addiktio', 'pelaaminen', 'peliongelma', 'tupakka', 'kannabis', 'lääkkeet', 'viina'],
  parenting: ['lapset', 'lapsi', 'vanhemmuus', 'kasvatus', 'teini', 'murrosikä', 'huoltajuus', 'perhe', 'äiti', 'isä', 'koulu'],
  financial_stress: ['raha', 'talous', 'velka', 'laina', 'toimeentulo', 'työtön', 'köyhyys', 'vuokra', 'lasku', 'ulosotto', 'maksuhäiriö'],
  grief_loss: ['kuolema', 'kuoli', 'menetys', 'suru', 'sureva', 'hautajais', 'menehty', 'itsemurha', 'läheisen kuolema'],
  burnout: ['burnout', 'loppuun palanu', 'työuupumus', 'ylikuormit', 'työ stressaa', 'jaksaminen', 'väsymys'],
  unknown: [],
}

const CONCERN_KEYWORDS: Record<KeyConcern, string[]> = {
  relationship: ['suhde', 'puoliso', 'kumppani', 'ero', 'rakkaus', 'parisuht'],
  loneliness: ['yksin', 'yksinäi', 'eristy', 'kukaan', 'tukiverkko', 'ulkopuoli'],
  anxiety: ['ahdist', 'pelkää', 'pelottaa', 'huoli', 'paniikki', 'jännittä'],
  depression: ['masennus', 'masentunut', 'en jaksa', 'toivottomuus', 'merkityksetön'],
  substance_use: ['alkohol', 'päihde', 'juominen', 'huume', 'riippuvuus', 'addikti', 'pelaaminen'],
  self_harm: ['itsetuhoi', 'vahingoitta', 'viiltely', 'haluan kuolla', 'en halua elää'],
  finances: ['raha', 'talous', 'velka', 'laina', 'toimeentulo', 'lasku'],
  housing: ['asunto', 'muutto', 'koti', 'asuminen', 'vuokra', 'koditon'],
  parenting: ['lapsi', 'lapset', 'vanhemmuus', 'kasvatus', 'huoltajuus', 'perhe'],
  grief: ['suru', 'menetys', 'kuolema', 'luopum', 'ikävä', 'kaipaa'],
  work_stress: ['työ', 'burnout', 'pomo', 'työpaikka', 'irtisanomi', 'työtön'],
  sleep: ['uni', 'nukku', 'unettomuus', 'valvon', 'heräile', 'väsynyt'],
  identity: ['kuka olen', 'identiteetti', 'oma elämä', 'itseni', 'itsetunto'],
  anger_management: ['raivo', 'hallinta', 'menetän maltt', 'huudan', 'riidat', 'aggressii'],
}

const NEED_KEYWORDS: Record<SupportNeed, string[]> = {
  emotional_support: ['tukea', 'kuuntele', 'ymmärrä', 'lohdut', 'jaksa', 'empatia'],
  practical_advice: ['neuvo', 'konkreetti', 'miten toimin', 'käytännö', 'askel'],
  tools_exercises: ['harjoitus', 'työkalu', 'tekniikka', 'menetelmä', 'keino'],
  crisis_support: ['hätä', 'kriisi', 'en kestä', 'itsetuhoi', 'vahingoitta'],
  addiction_support: ['lopettaa juomisen', 'vähentää', 'raittius', 'retkahdus', 'vieroitus'],
  parenting_guidance: ['miten kerron lapsille', 'lasten hyvinvointi', 'kasvatus', 'suojem'],
  financial_guidance: ['talousneuvonta', 'velkaneuvonta', 'budjet', 'säästäminen'],
  grief_support: ['surutyö', 'käsitellä surua', 'menetyksen', 'luopuminen'],
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
      detectedEmotions.push(emotion)
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
    if (situation === 'unknown') continue
    for (const kw of keywords) {
      if (allText.includes(kw)) {
        profile.situationType = situation as SituationType
        break
      }
    }
    if (profile.situationType !== 'unknown') break
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

  // ── Decision stage (broadened to change stage) ──
  if (allText.includes('olen toipumassa') || allText.includes('menee paremmin') || allText.includes('edistynyt')) {
    profile.decisionStage = 'in_recovery'
  } else if (allText.includes('teen muutoksia') || allText.includes('olen aloittanut') || allText.includes('lopettanut')) {
    profile.decisionStage = 'making_changes'
  } else if (allText.includes('tarvitsen apua') || allText.includes('haen apua') || allText.includes('haluaisin puhua')) {
    profile.decisionStage = 'seeking_help'
  } else if (allText.includes('mietin') || allText.includes('harkitsen') || allText.includes('en tiedä') || allText.includes('pohdiskelen')) {
    profile.decisionStage = 'exploring'
  }

  // ── Resilience ──
  const crisisWords = ['en kestä', 'en jaksa', 'haluan kuolla', 'itsetuhoi', 'lopettaa', 'en halua elää', 'viiltely']
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
  if (concerns.has('substance_use')) risks.push('profileDynamic.risk_substance')
  if (concerns.has('sleep')) risks.push('profileDynamic.risk_sleep')
  profile.riskFactors = risks

  // ── Recommended approach (translation keys) ──
  const approaches: string[] = []
  if (profile.communicationStyle === 'emotional') approaches.push('profileDynamic.approach_empathy')
  if (profile.communicationStyle === 'analytical') approaches.push('profileDynamic.approach_analytical')
  if (profile.communicationStyle === 'direct') approaches.push('profileDynamic.approach_direct')
  if (profile.resilienceLevel === 'crisis') approaches.push('profileDynamic.approach_crisis')
  if (profile.decisionStage === 'exploring') approaches.push('profileDynamic.approach_explore')
  if (concerns.has('substance_use')) approaches.push('profileDynamic.approach_motivational')
  if (approaches.length === 0) approaches.push('profileDynamic.approach_default')
  profile.recommendedApproach = approaches

  // ── Suggested exercises (translation keys) ──
  const exercises: string[] = []
  if (profile.emotionalIntensity > 7) exercises.push('profileDynamic.exercise_tipp')
  if (concerns.has('anxiety')) exercises.push('profileDynamic.exercise_breathing')
  if (concerns.has('anxiety') || concerns.has('depression')) exercises.push('profileDynamic.exercise_thought_record')
  if (concerns.has('depression') || profile.emotionalState === 'numb') exercises.push('profileDynamic.exercise_behavioral_activation')
  if (concerns.has('substance_use')) exercises.push('profileDynamic.exercise_urge_surfing')
  if (concerns.has('sleep')) exercises.push('profileDynamic.exercise_sleep_hygiene')
  if (concerns.has('identity') || profile.decisionStage === 'exploring') exercises.push('profileDynamic.exercise_value_compass')
  if (profile.emotionalState === 'anxious') exercises.push('profileDynamic.exercise_grounding')
  exercises.push('profileDynamic.exercise_daily_journal')
  profile.suggestedExercises = exercises.slice(0, 5)

  // ── Next steps (translation keys) ──
  const steps: string[] = []
  if (profile.resilienceLevel === 'crisis') {
    steps.push('profileDynamic.step_crisis_phone')
    steps.push('profileDynamic.step_crisis_professional')
  }
  if (profile.decisionStage === 'exploring') steps.push('profileDynamic.step_explore')
  if (profile.keyConcerns.length > 0) {
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
