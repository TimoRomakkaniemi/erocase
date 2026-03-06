'use client'

import { useTriageStore } from '@/stores/triageStore'
import { TriageFlow } from './TriageFlow'

export function TriageFlowWrapper() {
  const { result, countryCode, closeTriage } = useTriageStore()

  if (!result?.triggered || !result.type) return null

  return (
    <TriageFlow
      triageResult={result}
      onClose={closeTriage}
      countryCode={countryCode}
    />
  )
}
