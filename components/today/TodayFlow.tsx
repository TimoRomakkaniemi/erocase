'use client'

import { useT } from '@/lib/i18n'
import { useTodayStore } from '@/stores/todayStore'
import CheckIn from './CheckIn'
import Exercise from './Exercise'
import OneAction from './OneAction'
import TodayComplete from './TodayComplete'

const STEPS = 3 // check-in, exercise, action (complete is step 4 but not counted in progress)

export default function TodayFlow() {
  const t = useT()
  const {
    currentStep,
    mode,
    checkInScore,
    checkInWord,
    exerciseId,
    actionText,
    nextStep,
    prevStep,
    setCheckIn,
    setExerciseCompleted,
    setAction,
    completeAction,
    saveSession,
    reset,
  } = useTodayStore()

  const stepIndex = Math.min(currentStep, STEPS - 1)
  const progress = ((stepIndex + 1) / STEPS) * 100

  const handleCheckInComplete = (score: number, word: string) => {
    setCheckIn(score, word)
    nextStep()
  }

  const handleExerciseComplete = (id: string) => {
    setExerciseCompleted(id)
    nextStep()
  }

  const handleActionComplete = (text: string) => {
    setAction(text)
    completeAction()
    nextStep()
  }

  const handleCompleteContinueChat = async () => {
    await saveSession()
    window.location.href = '/demo'
  }

  const handleCompleteClose = async () => {
    await saveSession()
    reset()
    window.location.href = '/demo'
  }

  if (!mode) return null

  return (
    <div className="flex flex-col min-h-0 flex-1">
      {/* Step indicator & progress bar */}
      {currentStep < 3 && (
        <div className="px-4 sm:px-6 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              {stepIndex + 1}/{STEPS}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-warm-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Step content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-8">
        {currentStep === 0 && <CheckIn onComplete={handleCheckInComplete} />}
        {currentStep === 1 && (
          <Exercise mode={mode} onComplete={handleExerciseComplete} />
        )}
        {currentStep === 2 && (
          <OneAction mode={mode} onComplete={handleActionComplete} />
        )}
        {currentStep === 3 && (
          <TodayComplete
            score={checkInScore}
            word={checkInWord}
            exerciseId={exerciseId}
            actionText={actionText}
            onContinueChat={handleCompleteContinueChat}
            onClose={handleCompleteClose}
            mode={mode}
          />
        )}
      </div>

      {/* Back button (when not on first or complete step) */}
      {currentStep > 0 && currentStep < 3 && (
        <div className="px-4 sm:px-6 pt-4 pb-6 border-t border-warm-200/60">
          <button
            type="button"
            onClick={prevStep}
            className="w-full py-3 rounded-xl font-medium text-gray-600 bg-warm-100 hover:bg-warm-200
              transition-all border border-warm-200"
          >
            ← {t('today.back')}
          </button>
        </div>
      )}
    </div>
  )
}
