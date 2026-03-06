'use client'

import { useSOSStore } from '@/stores/sosStore'
import { useT } from '@/lib/i18n'
import { useRouter } from 'next/navigation'

export function ReliefRating() {
  const t = useT()
  const router = useRouter()
  const { reliefRating, setReliefRating, completeSOS } = useSOSStore()

  const handleContinueChat = async () => {
    await completeSOS('escalated_to_chat')
    router.push('/demo')
  }

  const handleStartToday = async () => {
    await completeSOS('completed')
    router.push('/today')
  }

  const handleClose = async () => {
    await completeSOS('completed')
  }

  return (
    <div className="flex min-h-[60vh] flex-col justify-center gap-8 anim-in">
      <h2 className="text-center text-2xl font-semibold text-white">
        {t('sos.relief.title')}
      </h2>

      {/* 0-10 rating */}
      <div className="flex flex-wrap justify-center gap-2">
        {Array.from({ length: 11 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setReliefRating(i)}
            className={`flex h-12 w-12 items-center justify-center rounded-xl text-lg font-semibold transition ${
              reliefRating === i
                ? 'bg-brand-500 text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {i}
          </button>
        ))}
      </div>

      {/* Next step buttons */}
      <div className="mt-4 flex flex-col gap-3">
        <button
          type="button"
          onClick={handleContinueChat}
          className="rounded-xl bg-brand-500 px-6 py-4 font-semibold text-white transition hover:bg-brand-600"
        >
          {t('sos.relief.continueChat')}
        </button>
        <button
          type="button"
          onClick={handleStartToday}
          className="rounded-xl bg-white/10 px-6 py-4 font-semibold text-white transition hover:bg-white/20"
        >
          {t('sos.relief.startToday')}
        </button>
        <button
          type="button"
          onClick={handleClose}
          className="rounded-xl border border-white/20 px-6 py-4 font-medium text-white/80 transition hover:bg-white/5"
        >
          {t('sos.relief.close')}
        </button>
      </div>
    </div>
  )
}
