import { useState } from 'react'

/* ═══════════════════════════════════════════════════
   TOOLKIT PANEL
   Self-help exercises and practical tools that
   add real value and can be used independently.
   ═══════════════════════════════════════════════════ */

interface Exercise {
  id: string
  icon: string
  title: string
  duration: string
  category: 'breathing' | 'writing' | 'reflection' | 'action' | 'mindfulness'
  description: string
  steps: string[]
  tip?: string
}

const EXERCISES: Exercise[] = [
  {
    id: 'breathing-calm',
    icon: '🌬️',
    title: '4-7-8 Rauhoittuminen',
    duration: '3 min',
    category: 'breathing',
    description: 'Aktivoi parasympaattinen hermosto ja lievitä ahdistusta tehokkaalla hengitystekniikalla.',
    steps: [
      'Hengitä nenän kautta sisään 4 sekuntia',
      'Pidätä hengitystä 7 sekuntia',
      'Puhalla suun kautta ulos 8 sekuntia',
      'Toista 4 kierrosta',
      'Huomaa miltä kehossasi tuntuu',
    ],
    tip: 'Tee tätä ennen nukkumaanmenoa tai aina kun ahdistus nousee.',
  },
  {
    id: 'grounding-54321',
    icon: '🌿',
    title: '5-4-3-2-1 Maadoitus',
    duration: '5 min',
    category: 'mindfulness',
    description: 'Kun tunteet vyöryvät yli, tämä tekniikka ankkuroi sinut nykyhetkeen.',
    steps: [
      'Nimeä 5 asiaa jotka näet ympärilläsi',
      'Nimeä 4 asiaa joihin voit koskea',
      'Nimeä 3 ääntä jotka kuulet',
      'Nimeä 2 tuoksua jotka haistat',
      'Nimeä 1 maku jota maistat',
    ],
    tip: 'Käytä tätä paniikkikohtauksen tai voimakkaan tunnekuohun aikana.',
  },
  {
    id: 'emotion-wave',
    icon: '🌊',
    title: 'Tunteiden aallokko',
    duration: '10 min',
    category: 'reflection',
    description: 'Opettele tarkkailemaan tunteitasi ilman tuomitsemista - ne tulevat ja menevät kuin aallot.',
    steps: [
      'Istu rauhallisesti ja sulje silmäsi',
      'Tunnista: mikä tunne on nyt vahvin?',
      'Missä kehossasi tunnet sen? Kuvaile tarkasti.',
      'Anna tunteen olla - älä yritä muuttaa sitä',
      'Huomaa: tunne muuttuu itsestään. Se on kuin aalto.',
      'Kirjoita ylös mitä huomasit',
    ],
    tip: 'Tunteita ei tarvitse korjata. Ne ovat tietoa, eivät totuuksia.',
  },
  {
    id: 'value-balance',
    icon: '⚖️',
    title: 'Arvopuntari',
    duration: '15 min',
    category: 'reflection',
    description: 'Selkiytä mitä todella haluat elämältäsi. Erossa tärkeintä on tietää omat arvosi.',
    steps: [
      'Kirjoita 5 arvoa jotka ovat sinulle tärkeimpiä (esim. turvallisuus, vapaus, rehellisyys)',
      'Anna jokaiselle pistemäärä 1-10: miten ne toteutuvat nyt?',
      'Mieti: miten ne toteutuisivat eron jälkeen?',
      'Entä jos yrittäisitte vielä?',
      'Vertaa tuloksia - mikä suunta tukee arvojasi?',
    ],
  },
  {
    id: 'guilt-release',
    icon: '📝',
    title: 'Syyllisyyskirje',
    duration: '15 min',
    category: 'writing',
    description: 'Syyllisyys on eron voimakkaimpia tunteita. Tämä harjoitus auttaa käsittelemään sitä turvallisesti.',
    steps: [
      'Kirjoita kirje itsellesi - aloita: "Rakas minä..."',
      'Kerro mistä tunnet syyllisyyttä',
      'Kirjoita sitten mitä sanoisit ystävällesi samassa tilanteessa',
      'Huomaa ero: olet itseäsi kohtaan paljon ankarampi',
      'Lopeta kirje anteeksiantoon: "Teit parhaasi sillä mitä tiesit"',
    ],
    tip: 'Syyllisyys on usein merkki siitä, että välität. Se ei tarkoita, että olet toiminut väärin.',
  },
  {
    id: 'safe-communication',
    icon: '🗣️',
    title: 'Turvallinen viesti',
    duration: '10 min',
    category: 'action',
    description: 'Opi kommunikoimaan vaikeista asioista ilman syyttelyä. Tehokas työkalu ristiriitojen hallintaan.',
    steps: [
      'Valitse yksi asia josta haluaisit puhua kumppanisi kanssa',
      'Muotoile se "Minä-viestinä": "Minä tunnen... kun... koska..."',
      'Vältä: "Sinä aina..." / "Sinä et koskaan..."',
      'Lisää toive: "Toivoisin, että voisimme..."',
      'Harjoittele ääneen - miltä se kuulostaa?',
    ],
    tip: '"Sinä olet" → "Minä tunnen". Tämä yksi muutos voi muuttaa kaiken.',
  },
  {
    id: 'daily-anchor',
    icon: '⚓',
    title: 'Päivän ankkurit',
    duration: '5 min',
    category: 'writing',
    description: 'Jokaisessa päivässä on jotain hyvää. Tämä harjoitus auttaa näkemään sen.',
    steps: [
      'Kirjoita 3 asiaa jotka kannattelevat sinua tänään',
      'Yksi asia jonka teit hyvin (pienikin riittää)',
      'Yksi asia jota odotat huomiselta',
      'Yksi henkilö jolle olet kiitollinen',
    ],
    tip: 'Tee tätä joka ilta. Aivot oppivat etsimään hyvää kun harjoittelet.',
  },
  {
    id: 'kids-emotion-map',
    icon: '🎨',
    title: 'Lasten tunnekartta',
    duration: '20 min',
    category: 'action',
    description: 'Konkreettinen työkalu lasten tunteiden ymmärtämiseen ja tukemiseen eron aikana.',
    steps: [
      'Ota paperia ja kyniä - tee tämä lapsen kanssa tai yksin',
      'Piirrä iso sydän ja jaa se osiin',
      'Jokaiseen osaan: yksi tunne jonka lapsi saattaa kokea',
      'Merkitse: mitä lapsi tarvitsee kunkin tunteen kanssa?',
      'Keskustelkaa yhdessä: "On ok tuntea kaikkia näitä"',
    ],
    tip: 'Lapset eivät tarvitse täydellisiä vastauksia. He tarvitsevat tiedon, että tunteilla on tilaa.',
  },
]

const CATEGORY_LABELS: Record<string, string> = {
  breathing: 'Hengitys',
  writing: 'Kirjoittaminen',
  reflection: 'Reflektio',
  action: 'Toiminta',
  mindfulness: 'Läsnäolo',
}

const CATEGORY_COLORS: Record<string, string> = {
  breathing: '#0ea5e9',
  writing: '#8b5cf6',
  reflection: '#f59e0b',
  action: '#22c55e',
  mindfulness: '#06b6d4',
}

interface ToolkitPanelProps {
  onClose: () => void
}

export default function ToolkitPanel({ onClose }: ToolkitPanelProps) {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [filter, setFilter] = useState<string | null>(null)

  const filtered = filter
    ? EXERCISES.filter((e) => e.category === filter)
    : EXERCISES

  if (selectedExercise) {
    return (
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
        <div
          className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl"
          style={{
            background: 'linear-gradient(180deg, #ffffff 0%, #faf8f6 100%)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
          }}
        >
          <div className="p-5">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedExercise.icon}</span>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{selectedExercise.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="text-[0.6rem] font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background: `${CATEGORY_COLORS[selectedExercise.category]}15`,
                        color: CATEGORY_COLORS[selectedExercise.category],
                      }}
                    >
                      {CATEGORY_LABELS[selectedExercise.category]}
                    </span>
                    <span className="text-[0.65rem] text-gray-400">⏱ {selectedExercise.duration}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedExercise(null)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed mb-5">{selectedExercise.description}</p>

            {/* Steps */}
            <div className="space-y-3 mb-5">
              {selectedExercise.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${CATEGORY_COLORS[selectedExercise.category]}, ${CATEGORY_COLORS[selectedExercise.category]}90)` }}
                  >
                    {i + 1}
                  </span>
                  <p className="text-sm text-gray-700 leading-relaxed pt-0.5">{step}</p>
                </div>
              ))}
            </div>

            {/* Tip */}
            {selectedExercise.tip && (
              <div
                className="rounded-xl p-3.5 mb-4"
                style={{ background: 'linear-gradient(135deg, #fef3c7, #fef9c3)' }}
              >
                <div className="flex items-start gap-2">
                  <span className="text-sm">💡</span>
                  <p className="text-xs text-amber-800 leading-relaxed">{selectedExercise.tip}</p>
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedExercise(null)}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                boxShadow: '0 2px 8px rgba(22,163,74,0.25)',
              }}
            >
              Valmis
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl flex flex-col"
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #faf8f6 100%)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
        }}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🧰</span>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Elinan työkalupakki</h2>
                <p className="text-xs text-gray-500">Tutkittuja harjoituksia ja tekniikoita itsehoitoon</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setFilter(null)}
              className={`text-[0.65rem] font-semibold px-2.5 py-1 rounded-full transition-all
                ${!filter ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              Kaikki
            </button>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(filter === key ? null : key)}
                className="text-[0.65rem] font-semibold px-2.5 py-1 rounded-full transition-all"
                style={filter === key ? {
                  background: CATEGORY_COLORS[key],
                  color: 'white',
                } : {
                  background: `${CATEGORY_COLORS[key]}12`,
                  color: CATEGORY_COLORS[key],
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise grid */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((exercise) => (
              <button
                key={exercise.id}
                onClick={() => setSelectedExercise(exercise)}
                className="text-left p-4 rounded-xl border border-gray-200 hover:border-gray-300
                           hover:shadow-md active:scale-[0.98] transition-all duration-150 group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl group-hover:scale-110 transition-transform">{exercise.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1">{exercise.title}</h3>
                    <p className="text-[0.7rem] text-gray-500 leading-relaxed line-clamp-2 mb-2">
                      {exercise.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[0.6rem] font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          background: `${CATEGORY_COLORS[exercise.category]}12`,
                          color: CATEGORY_COLORS[exercise.category],
                        }}
                      >
                        {CATEGORY_LABELS[exercise.category]}
                      </span>
                      <span className="text-[0.6rem] text-gray-400">⏱ {exercise.duration}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
