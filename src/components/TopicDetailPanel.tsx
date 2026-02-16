import { useT } from '../lib/i18n'

type TopicKey = 'relationship' | 'loneliness' | 'anxiety' | 'depression' | 'substances' | 'parenting' | 'finances' | 'grief'

interface TopicDetailPanelProps {
  topicKey: TopicKey
  topicIcon: string
  onClose: () => void
  onStartChat: (prompt: string) => void
  chatPrompt: string
}

const TOPIC_COLORS: Record<TopicKey, string> = {
  relationship: '#e11d48',
  loneliness: '#6366f1',
  anxiety: '#f59e0b',
  depression: '#6b7280',
  substances: '#7c3aed',
  parenting: '#0ea5e9',
  finances: '#059669',
  grief: '#78716c',
}

const TOPIC_BG: Record<TopicKey, string> = {
  relationship: 'from-rose-50 to-white',
  loneliness: 'from-indigo-50 to-white',
  anxiety: 'from-amber-50 to-white',
  depression: 'from-gray-100 to-white',
  substances: 'from-purple-50 to-white',
  parenting: 'from-sky-50 to-white',
  finances: 'from-emerald-50 to-white',
  grief: 'from-stone-100 to-white',
}

export default function TopicDetailPanel({ topicKey, topicIcon, onClose, onStartChat, chatPrompt }: TopicDetailPanelProps) {
  const t = useT()
  const color = TOPIC_COLORS[topicKey]
  const bgGrad = TOPIC_BG[topicKey]

  const td = (key: string) => t(`topicDetail.${topicKey}.${key}`)

  const signs = [1, 2, 3, 4, 5].map(i => td(`sign${i}`))
  const tips = [1, 2, 3, 4].map(i => ({
    title: td(`tip${i}title`),
    desc: td(`tip${i}desc`),
  }))
  const stats = [1, 2, 3].map(i => ({
    value: td(`stat${i}value`),
    label: td(`stat${i}label`),
  }))
  const methods = [1, 2].map(i => ({
    name: td(`method${i}name`),
    desc: td(`method${i}desc`),
  }))
  const exercises = [1, 2, 3].map(i => td(`exercise${i}`))

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div
        className="w-full max-w-2xl max-h-[95vh] sm:max-h-[92vh] overflow-y-auto rounded-2xl animate-fade-in-up"
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #faf8f6 100%)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.18)',
        }}
      >
        {/* Header */}
        <div className={`bg-gradient-to-b ${bgGrad} px-5 sm:px-6 pt-5 pb-4 rounded-t-2xl`}>
          <div className="flex items-start justify-between mb-4">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              {t('topicDetail.backButton')}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-black/5 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 mb-3">
            <span className="text-3xl sm:text-4xl">{topicIcon}</span>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-extrabold text-gray-900 leading-tight">{td('title')}</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{td('subtitle')}</p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{td('heroDesc')}</p>
        </div>

        <div className="px-4 sm:px-6 pb-6">

          {/* Stats */}
          <div className="py-4 sm:py-5 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t('topicDetail.statsTitle')}</h3>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {stats.map((s, i) => (
                <div key={i} className="text-center p-2 sm:p-3 rounded-xl bg-gray-50/80 border border-gray-100">
                  <div className="text-lg sm:text-2xl font-extrabold" style={{ color }}>{s.value}</div>
                  <div className="text-[0.6rem] sm:text-xs text-gray-500 mt-1 leading-tight">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Signs */}
          <div className="py-4 sm:py-5 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t('topicDetail.signsTitle')}</h3>
            <ul className="space-y-2">
              {signs.map((sign, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <span
                    className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[0.6rem] font-bold text-white mt-0.5"
                    style={{ background: color }}
                  >
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{sign}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tips */}
          <div className="py-4 sm:py-5 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t('topicDetail.tipsTitle')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {tips.map((tip, i) => (
                <div
                  key={i}
                  className="p-3 sm:p-4 rounded-xl border border-gray-100 bg-white"
                  style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: color }}
                    >
                      {i + 1}
                    </span>
                    <h4 className="text-sm font-bold text-gray-900">{tip.title}</h4>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{tip.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Methods */}
          <div className="py-4 sm:py-5 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t('topicDetail.methodsTitle')}</h3>
            <div className="space-y-3">
              {methods.map((m, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border-l-4"
                  style={{
                    borderColor: color,
                    background: `${color}08`,
                  }}
                >
                  <h4 className="text-sm font-bold text-gray-900 mb-1">{m.name}</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Exercises */}
          <div className="py-4 sm:py-5 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t('topicDetail.exercisesTitle')}</h3>
            <div className="space-y-2">
              {exercises.map((ex, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/80 border border-gray-100 hover:border-gray-200 transition-colors"
                >
                  <span className="text-lg">{['🌬️', '🧭', '📝'][i]}</span>
                  <span className="text-sm font-medium text-gray-800">{ex}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Professional help */}
          <div className="py-4 sm:py-5 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t('topicDetail.professionalTitle')}</h3>
            <div
              className="p-4 rounded-xl border border-amber-200 bg-amber-50/50"
            >
              <div className="flex items-start gap-2">
                <span className="text-lg flex-shrink-0">⚠️</span>
                <p className="text-sm text-amber-900 leading-relaxed">{td('professional')}</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="pt-5">
            <button
              onClick={() => onStartChat(chatPrompt)}
              className="w-full h-12 flex items-center justify-center gap-2 rounded-xl
                         text-white text-sm font-bold
                         active:scale-[0.98] transition-all duration-150"
              style={{
                background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                boxShadow: `0 4px 16px ${color}30`,
              }}
            >
              <span className="text-lg">💬</span>
              {t('topicDetail.startChat')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
