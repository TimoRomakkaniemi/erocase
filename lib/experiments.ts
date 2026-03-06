const STORAGE_PREFIX = 'experiment_'

function getStorageKey(experimentName: string): string {
  return `${STORAGE_PREFIX}${experimentName}`
}

export function assignVariant(experimentName: string): 'A' | 'B' {
  if (typeof window === 'undefined') {
    return Math.random() < 0.5 ? 'A' : 'B'
  }
  const key = getStorageKey(experimentName)
  const stored = localStorage.getItem(key)
  if (stored === 'A' || stored === 'B') {
    return stored
  }
  const variant: 'A' | 'B' = Math.random() < 0.5 ? 'A' : 'B'
  localStorage.setItem(key, variant)
  return variant
}

export function getVariant(experimentName: string): 'A' | 'B' | null {
  if (typeof window === 'undefined') {
    return null
  }
  const stored = localStorage.getItem(getStorageKey(experimentName))
  if (stored === 'A' || stored === 'B') {
    return stored
  }
  return null
}
