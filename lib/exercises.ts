export interface Exercise {
  id: string
  mode: string
  title_key: string
  description_key: string
  duration_minutes: number
  type: 'breathing' | 'writing' | 'movement' | 'grounding' | 'reflection'
}

const EXERCISES: Exercise[] = [
  // conflict
  {
    id: 'conflict-calming-breath',
    mode: 'conflict',
    title_key: 'today.exercises.conflict.calmingBreath',
    description_key: 'today.exercises.conflict.calmingBreathDesc',
    duration_minutes: 2,
    type: 'breathing',
  },
  {
    id: 'conflict-perspective-shift',
    mode: 'conflict',
    title_key: 'today.exercises.conflict.perspectiveShift',
    description_key: 'today.exercises.conflict.perspectiveShiftDesc',
    duration_minutes: 3,
    type: 'writing',
  },
  {
    id: 'conflict-body-scan',
    mode: 'conflict',
    title_key: 'today.exercises.conflict.bodyScan',
    description_key: 'today.exercises.conflict.bodyScanDesc',
    duration_minutes: 3,
    type: 'grounding',
  },
  // breakup
  {
    id: 'breakup-urge-surfing',
    mode: 'breakup',
    title_key: 'today.exercises.breakup.urgeSurfing',
    description_key: 'today.exercises.breakup.urgeSurfingDesc',
    duration_minutes: 3,
    type: 'reflection',
  },
  {
    id: 'breakup-gratitude',
    mode: 'breakup',
    title_key: 'today.exercises.breakup.gratitude',
    description_key: 'today.exercises.breakup.gratitudeDesc',
    duration_minutes: 2,
    type: 'reflection',
  },
  {
    id: 'breakup-future-letter',
    mode: 'breakup',
    title_key: 'today.exercises.breakup.futureLetter',
    description_key: 'today.exercises.breakup.futureLetterDesc',
    duration_minutes: 3,
    type: 'writing',
  },
  // loneliness
  {
    id: 'loneliness-grounding',
    mode: 'loneliness',
    title_key: 'today.exercises.loneliness.grounding',
    description_key: 'today.exercises.loneliness.groundingDesc',
    duration_minutes: 2,
    type: 'grounding',
  },
  {
    id: 'loneliness-self-compassion',
    mode: 'loneliness',
    title_key: 'today.exercises.loneliness.selfCompassion',
    description_key: 'today.exercises.loneliness.selfCompassionDesc',
    duration_minutes: 3,
    type: 'reflection',
  },
  {
    id: 'loneliness-one-connection',
    mode: 'loneliness',
    title_key: 'today.exercises.loneliness.oneConnection',
    description_key: 'today.exercises.loneliness.oneConnectionDesc',
    duration_minutes: 2,
    type: 'reflection',
  },
  // calm
  {
    id: 'calm-478-breathing',
    mode: 'calm',
    title_key: 'today.exercises.calm.breathing478',
    description_key: 'today.exercises.calm.breathing478Desc',
    duration_minutes: 2,
    type: 'breathing',
  },
  {
    id: 'calm-progressive-relaxation',
    mode: 'calm',
    title_key: 'today.exercises.calm.progressiveRelaxation',
    description_key: 'today.exercises.calm.progressiveRelaxationDesc',
    duration_minutes: 3,
    type: 'movement',
  },
  {
    id: 'calm-worry-parking',
    mode: 'calm',
    title_key: 'today.exercises.calm.worryParking',
    description_key: 'today.exercises.calm.worryParkingDesc',
    duration_minutes: 2,
    type: 'writing',
  },
]

export function getExercisesForMode(mode: string): Exercise[] {
  return EXERCISES.filter((e) => e.mode === mode)
}

export function getRandomExercise(mode: string): Exercise | null {
  const exercises = getExercisesForMode(mode)
  if (exercises.length === 0) return null
  return exercises[Math.floor(Math.random() * exercises.length)]
}
