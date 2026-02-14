import {
  useProfileStore,
  EMOTION_LABELS,
  EMOTION_COLORS,
  EMOTION_ICONS,
  SITUATION_LABELS,
  DECISION_LABELS,
  CONCERN_LABELS,
  NEED_LABELS,
  RESILIENCE_LABELS,
  RESILIENCE_COLORS,
  type UserProfile,
} from '../stores/profileStore'

/* ═══════════════════════════════════════════════════
   USER PROFILE PANEL
   Right-side panel showing real-time user insights
   extracted from conversation.
   ═══════════════════════════════════════════════════ */

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
  const hasData = profile.completenessScore > 0

  if (!hasData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="text-4xl mb-3 opacity-40">🔍</div>
        <p className="text-sm font-medium text-gray-500 mb-1">Profiili rakentuu</p>
        <p className="text-[0.7rem] text-gray-400 leading-relaxed">
          Kun keskustelet Elinan kanssa, profiilisi rakentuu automaattisesti ja autan sinua yhä paremmin.
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 pb-4">
      {/* ── Completeness ── */}
      <SectionTitle>Profiilin kattavuus</SectionTitle>
      <div className="flex items-center gap-2 mb-1">
        <ProgressBar value={profile.completenessScore} color="#22c55e" />
        <span className="text-xs font-bold text-gray-600 min-w-[2.5rem] text-right">
          {profile.completenessScore}%
        </span>
      </div>
      <p className="text-[0.6rem] text-gray-400">
        {profile.completenessScore < 30 && 'Kerro lisää tilanteestasi'}
        {profile.completenessScore >= 30 && profile.completenessScore < 60 && 'Hyvä alku! Jatka kertomista'}
        {profile.completenessScore >= 60 && profile.completenessScore < 80 && 'Profiili hahmottuu hyvin'}
        {profile.completenessScore >= 80 && 'Erinomainen kuva tilanteestasi'}
      </p>

      {/* ── Emotional state ── */}
      <SectionTitle>Tunnetila</SectionTitle>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{EMOTION_ICONS[profile.emotionalState]}</span>
        <div>
          <p className="text-sm font-semibold text-gray-800">
            {EMOTION_LABELS[profile.emotionalState]}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[0.6rem] text-gray-400">Intensiteetti</span>
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
            <span key={e} className="text-[0.6rem] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
              {e}
            </span>
          ))}
        </div>
      )}

      {/* ── Situation ── */}
      {profile.situationType !== 'unknown' && (
        <>
          <SectionTitle>Tilanne</SectionTitle>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <span className="text-[0.6rem]">📋</span>
              </div>
              <span className="text-xs font-medium text-gray-700">{SITUATION_LABELS[profile.situationType]}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                <span className="text-[0.6rem]">🧭</span>
              </div>
              <span className="text-xs font-medium text-gray-700">{DECISION_LABELS[profile.decisionStage]}</span>
            </div>
            {profile.hasChildren && (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-pink-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-[0.6rem]">👨‍👩‍👧</span>
                </div>
                <span className="text-xs font-medium text-gray-700">Perheessä lapsia</span>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Resilience ── */}
      <SectionTitle>Voimavarat</SectionTitle>
      <div className="flex items-center gap-2 mb-2">
        <Badge
          label={RESILIENCE_LABELS[profile.resilienceLevel]}
          color={RESILIENCE_COLORS[profile.resilienceLevel]}
          icon={profile.resilienceLevel === 'crisis' ? '⚠️' : profile.resilienceLevel === 'high' ? '💪' : '🌿'}
        />
        <span className="text-[0.6rem] text-gray-400">
          {profile.resilienceLevel === 'high' && 'Hyvät selviytymiskeinot'}
          {profile.resilienceLevel === 'moderate' && 'Tukea saatavilla'}
          {profile.resilienceLevel === 'low' && 'Vahvistusta tarvitaan'}
          {profile.resilienceLevel === 'crisis' && 'Akuutti avuntarve'}
        </span>
      </div>

      {/* ── Key concerns ── */}
      {profile.keyConcerns.length > 0 && (
        <>
          <SectionTitle>Päähuolet</SectionTitle>
          <div className="flex flex-wrap gap-1">
            {profile.keyConcerns.map((c) => (
              <Badge key={c} label={CONCERN_LABELS[c]} color="#6366f1" />
            ))}
          </div>
        </>
      )}

      {/* ── Support needs ── */}
      {profile.supportNeeds.length > 0 && (
        <>
          <SectionTitle>Tuen tarpeet</SectionTitle>
          <div className="flex flex-wrap gap-1">
            {profile.supportNeeds.map((n) => (
              <Badge key={n} label={NEED_LABELS[n]} color="#0891b2" />
            ))}
          </div>
        </>
      )}

      {/* ── Suggested exercises ── */}
      {profile.suggestedExercises.length > 0 && (
        <>
          <SectionTitle>Suositellut harjoitukset</SectionTitle>
          <div className="space-y-1">
            {profile.suggestedExercises.map((ex, i) => (
              <div key={i} className="flex items-start gap-2 py-1">
                <span
                  className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[0.55rem] font-bold text-white mt-0.5"
                  style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
                >
                  {i + 1}
                </span>
                <span className="text-[0.7rem] text-gray-700 leading-snug">{ex}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Next steps ── */}
      {profile.nextSteps.length > 0 && (
        <>
          <SectionTitle>Seuraavat askeleet</SectionTitle>
          <div className="space-y-1.5">
            {profile.nextSteps.map((step, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-brand-500 mt-0.5">→</span>
                <span className="text-[0.7rem] text-gray-700 leading-snug">{step}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Risk factors ── */}
      {profile.riskFactors.length > 0 && (
        <>
          <SectionTitle>Huomioitavaa</SectionTitle>
          {profile.riskFactors.map((risk, i) => (
            <div key={i} className="flex items-start gap-2 py-0.5">
              <span className="text-amber-500 text-xs mt-0.5">⚠</span>
              <span className="text-[0.7rem] text-amber-700 leading-snug">{risk}</span>
            </div>
          ))}
        </>
      )}

      {/* ── Psychology snapshot ── */}
      <SectionTitle>Psykologinen profiili</SectionTitle>
      <div className="grid grid-cols-2 gap-1.5">
        <MiniStat label="Kommunikaatio" value={
          profile.communicationStyle === 'direct' ? 'Suora' :
          profile.communicationStyle === 'reflective' ? 'Pohdiskeleva' :
          profile.communicationStyle === 'emotional' ? 'Tunnevetoinen' :
          profile.communicationStyle === 'analytical' ? 'Analyyttinen' : '–'
        } />
        <MiniStat label="Avoimuus" value={
          profile.openness === 'very_open' ? 'Erittäin avoin' :
          profile.openness === 'open' ? 'Avoin' :
          profile.openness === 'guarded' ? 'Varovainen' : 'Sulkeutunut'
        } />
        <MiniStat label="Sitoutuminen" value={
          profile.engagementLevel === 'high' ? 'Korkea' :
          profile.engagementLevel === 'medium' ? 'Keskitaso' : 'Matala'
        } />
        <MiniStat label="Muutosvalmius" value={
          profile.readinessForChange === 'ready' ? 'Valmis' :
          profile.readinessForChange === 'ambivalent' ? 'Ristiriitainen' : 'Vastustava'
        } />
      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg px-2.5 py-2 text-center">
      <p className="text-[0.55rem] text-gray-400 font-medium mb-0.5">{label}</p>
      <p className="text-[0.7rem] font-semibold text-gray-700">{value}</p>
    </div>
  )
}

export default function UserProfilePanel() {
  const { profile, profileOpen, setProfileOpen } = useProfileStore()

  return (
    <>
      {/* ── Mobile overlay ── */}
      {profileOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 xl:hidden"
          onClick={() => setProfileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 right-0 h-full w-[280px] z-50 flex flex-col
                     transform transition-transform duration-200 ease-out
                     ${profileOpen ? 'translate-x-0' : 'translate-x-full'}
                     xl:relative xl:translate-x-0 xl:z-auto
                     ${profileOpen ? '' : 'xl:hidden'}`}
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #faf8f6 100%)',
          borderLeft: '1px solid rgba(214,203,191,0.4)',
        }}
      >
        {/* ── Header ── */}
        <div className="p-3 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)' }}
            >
              <span className="text-[0.55rem]">👤</span>
            </div>
            <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">Profiili</span>
          </div>
          <button
            onClick={() => setProfileOpen(false)}
            className="xl:hidden p-1 rounded-lg hover:bg-gray-100 text-gray-400"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Content ── */}
        <ProfileContent profile={profile} />

        {/* ── Footer ── */}
        <div className="p-3 border-t border-gray-100">
          <p className="text-[0.55rem] text-gray-400 text-center leading-relaxed">
            Profiili päivittyy automaattisesti keskustelun edetessä. Tietoja ei jaeta eteenpäin.
          </p>
        </div>
      </aside>
    </>
  )
}
