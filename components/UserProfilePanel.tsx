'use client'

import {
  useProfileStore,
  EMOTION_COLORS,
  EMOTION_ICONS,
  type UserProfile,
} from '@/stores/profileStore'
import { useT } from '@/lib/i18n'

function Badge({ label, color, icon }: { label: string; color: string; icon?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.65rem] font-semibold"
      style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}
    >
      {icon && <span className="text-[0.6rem]">{icon}</span>}
      {label}
    </span>
  )
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{ width: `${value}%`, background: color }}
      />
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider mb-2 mt-4 first:mt-0">
      {children}
    </h3>
  )
}

function ProfileContent({ profile }: { profile: UserProfile }) {
  const t = useT()
  const hasData = profile.completenessScore > 0

  if (!hasData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="text-4xl mb-3 opacity-40">🔍</div>
        <p className="text-sm font-medium text-gray-500 mb-1">{t('profile.building')}</p>
        <p className="text-xs sm:text-[0.7rem] text-gray-400 leading-relaxed">{t('profile.buildingDesc')}</p>
      </div>
    )
  }

  const RESILIENCE_COLORS: Record<string, string> = {
    high: '#22c55e',
    moderate: '#f59e0b',
    low: '#ef4444',
    crisis: '#dc2626',
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 pb-4">
      {/* ── Completeness ── */}
      <SectionTitle>{t('profile.completeness')}</SectionTitle>
      <div className="flex items-center gap-2 mb-1">
        <ProgressBar value={profile.completenessScore} color="#22c55e" />
        <span className="text-xs font-bold text-gray-600 min-w-[2.5rem] text-right">
          {profile.completenessScore}%
        </span>
      </div>
      <p className="text-xs sm:text-[0.6rem] text-gray-400">
        {profile.completenessScore < 30 && t('profile.completenessLow')}
        {profile.completenessScore >= 30 && profile.completenessScore < 60 && t('profile.completenessMedLow')}
        {profile.completenessScore >= 60 && profile.completenessScore < 80 && t('profile.completenessMedHigh')}
        {profile.completenessScore >= 80 && t('profile.completenessHigh')}
      </p>

      {/* ── Emotional state ── */}
      <SectionTitle>{t('profile.emotionalState')}</SectionTitle>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{EMOTION_ICONS[profile.emotionalState]}</span>
        <div>
          <p className="text-sm font-semibold text-gray-800">
            {t(`emotions.${profile.emotionalState}`)}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs sm:text-[0.6rem] text-gray-400">{t('profile.intensity')}</span>
            <div className="flex gap-[2px]">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[6px] h-3 rounded-sm transition-all duration-300"
                  style={{
                    background: i < profile.emotionalIntensity
                      ? EMOTION_COLORS[profile.emotionalState]
                      : '#e5e7eb',
                    opacity: i < profile.emotionalIntensity ? 1 : 0.4,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      {profile.dominantEmotions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {profile.dominantEmotions.map((e) => (
            <span key={e} className="text-xs sm:text-[0.6rem] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
              {t(`emotions.${e}`)}
            </span>
          ))}
        </div>
      )}

      {/* ── Situation ── */}
      {profile.situationType !== 'unknown' && (
        <>
          <SectionTitle>{t('profile.situation')}</SectionTitle>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <span className="text-[0.6rem]">📋</span>
              </div>
              <span className="text-xs font-medium text-gray-700">{t(`situations.${profile.situationType}`)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                <span className="text-[0.6rem]">🧭</span>
              </div>
              <span className="text-xs font-medium text-gray-700">{t(`decisions.${profile.decisionStage}`)}</span>
            </div>
            {profile.hasChildren && (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-pink-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-[0.6rem]">👨‍👩‍👧</span>
                </div>
                <span className="text-xs font-medium text-gray-700">{t('profile.hasChildren')}</span>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Resilience ── */}
      <SectionTitle>{t('profile.resilience')}</SectionTitle>
      <div className="flex items-center gap-2 mb-2">
        <Badge
          label={t(`resilienceLabels.${profile.resilienceLevel}`)}
          color={RESILIENCE_COLORS[profile.resilienceLevel]}
          icon={profile.resilienceLevel === 'crisis' ? '⚠️' : profile.resilienceLevel === 'high' ? '💪' : '🌿'}
        />
        <span className="text-xs sm:text-[0.6rem] text-gray-400">
          {profile.resilienceLevel === 'high' && t('profile.resilienceHighDesc')}
          {profile.resilienceLevel === 'moderate' && t('profile.resilienceModerateDesc')}
          {profile.resilienceLevel === 'low' && t('profile.resilienceLowDesc')}
          {profile.resilienceLevel === 'crisis' && t('profile.resilienceCrisisDesc')}
        </span>
      </div>

      {/* ── Key concerns ── */}
      {profile.keyConcerns.length > 0 && (
        <>
          <SectionTitle>{t('profile.keyConcerns')}</SectionTitle>
          <div className="flex flex-wrap gap-1">
            {profile.keyConcerns.map((c) => (
              <Badge key={c} label={t(`concerns.${c}`)} color="#6366f1" />
            ))}
          </div>
        </>
      )}

      {/* ── Support needs ── */}
      {profile.supportNeeds.length > 0 && (
        <>
          <SectionTitle>{t('profile.supportNeeds')}</SectionTitle>
          <div className="flex flex-wrap gap-1">
            {profile.supportNeeds.map((n) => (
              <Badge key={n} label={t(`needs.${n}`)} color="#0891b2" />
            ))}
          </div>
        </>
      )}

      {/* ── Suggested exercises ── */}
      {profile.suggestedExercises.length > 0 && (
        <>
          <SectionTitle>{t('profile.suggestedExercises')}</SectionTitle>
          <div className="space-y-1">
            {profile.suggestedExercises.map((ex, i) => (
              <div key={i} className="flex items-start gap-2 py-1">
                <span
                  className="flex-shrink-0 w-5 h-5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center text-[0.55rem] font-bold text-white mt-0.5"
                  style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
                >
                  {i + 1}
                </span>
                <span className="text-xs sm:text-[0.7rem] text-gray-700 leading-snug">{t(ex)}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Next steps ── */}
      {profile.nextSteps.length > 0 && (
        <>
          <SectionTitle>{t('profile.nextSteps')}</SectionTitle>
          <div className="space-y-1.5">
            {profile.nextSteps.map((step, i) => {
              // Handle steps with variable syntax: "key|concernKey"
              const parts = step.split('|')
              const text = parts.length > 1
                ? t(parts[0], { concern: t(`concerns.${parts[1]}`) })
                : t(step)
              return (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-brand-500 mt-0.5">→</span>
                  <span className="text-xs sm:text-[0.7rem] text-gray-700 leading-snug">{text}</span>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* ── Risk factors ── */}
      {profile.riskFactors.length > 0 && (
        <>
          <SectionTitle>{t('profile.riskFactors')}</SectionTitle>
          {profile.riskFactors.map((risk, i) => (
            <div key={i} className="flex items-start gap-2 py-0.5">
              <span className="text-amber-500 text-xs mt-0.5">⚠</span>
              <span className="text-xs sm:text-[0.7rem] text-amber-700 leading-snug">{t(risk)}</span>
            </div>
          ))}
        </>
      )}

      {/* ── Psychology snapshot ── */}
      <SectionTitle>{t('profile.psychology')}</SectionTitle>
      <div className="grid grid-cols-2 gap-1.5">
        <MiniStat label={t('profile.communication')} value={
          profile.communicationStyle === 'direct' ? t('profile.commDirect') :
          profile.communicationStyle === 'reflective' ? t('profile.commReflective') :
          profile.communicationStyle === 'emotional' ? t('profile.commEmotional') :
          profile.communicationStyle === 'analytical' ? t('profile.commAnalytical') : '–'
        } />
        <MiniStat label={t('profile.openness')} value={
          profile.openness === 'very_open' ? t('profile.openVeryOpen') :
          profile.openness === 'open' ? t('profile.openOpen') :
          profile.openness === 'guarded' ? t('profile.openGuarded') : t('profile.openClosed')
        } />
        <MiniStat label={t('profile.engagement')} value={
          profile.engagementLevel === 'high' ? t('profile.engHigh') :
          profile.engagementLevel === 'medium' ? t('profile.engMedium') : t('profile.engLow')
        } />
        <MiniStat label={t('profile.readiness')} value={
          profile.readinessForChange === 'ready' ? t('profile.readyReady') :
          profile.readinessForChange === 'ambivalent' ? t('profile.readyAmbivalent') : t('profile.readyResistant')
        } />
      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg px-2.5 py-2 text-center">
      <p className="text-xs sm:text-[0.55rem] text-gray-400 font-medium mb-0.5">{label}</p>
      <p className="text-xs sm:text-[0.7rem] font-semibold text-gray-700">{value}</p>
    </div>
  )
}

export default function UserProfilePanel() {
  const t = useT()
  const { profile, profileOpen, setProfileOpen } = useProfileStore()

  return (
    <>
      {profileOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 xl:hidden"
          onClick={() => setProfileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 right-0 h-full w-[85vw] max-w-[280px] z-50 flex flex-col
                     transform transition-transform duration-200 ease-out
                     ${profileOpen ? 'translate-x-0' : 'translate-x-full'}
                     xl:relative xl:translate-x-0 xl:z-auto
                     ${profileOpen ? '' : 'xl:hidden'}`}
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #faf8f6 100%)',
          borderLeft: '1px solid rgba(214,203,191,0.4)',
        }}
      >
        <div className="p-3 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)' }}
            >
              <span className="text-[0.55rem]">👤</span>
            </div>
            <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">{t('profile.title')}</span>
          </div>
          <button
            onClick={() => setProfileOpen(false)}
            className="xl:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-400"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <ProfileContent profile={profile} />

        <div className="p-3 border-t border-gray-100">
          <p className="text-xs sm:text-[0.55rem] text-gray-400 text-center leading-relaxed">{t('profile.footer')}</p>
        </div>
      </aside>
    </>
  )
}
