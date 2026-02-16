import { useState } from 'react'
import { useT } from '../lib/i18n'

interface WelcomeScreenProps {
  onSelectTopic: (topic: string) => void
  onOpenToolkit: () => void
}

export default function WelcomeScreen({ onSelectTopic, onOpenToolkit }: WelcomeScreenProps) {
  const t = useT()
  const [freeText, setFreeText] = useState('')
  const [showMoodCheck, setShowMoodCheck] = useState(false)

  const handleFreeSubmit = () => {
    const txt = freeText.trim()
    if (txt) onSelectTopic(txt)
  }

  const TOPICS = [
    { icon: '⚖️', title: t('welcome.topic1title'), prompt: t('welcome.topic1prompt'), tag: t('welcome.topic1tag') },
    { icon: '💔', title: t('welcome.topic2title'), prompt: t('welcome.topic2prompt'), tag: t('welcome.topic2tag') },
    { icon: '👨‍👩‍👧‍👦', title: t('welcome.topic3title'), prompt: t('welcome.topic3prompt'), tag: t('welcome.topic3tag') },
    { icon: '🔥', title: t('welcome.topic4title'), prompt: t('welcome.topic4prompt'), tag: t('welcome.topic4tag') },
    { icon: '🗣️', title: t('welcome.topic5title'), prompt: t('welcome.topic5prompt'), tag: t('welcome.topic5tag') },
    { icon: '🌅', title: t('welcome.topic6title'), prompt: t('welcome.topic6prompt'), tag: t('welcome.topic6tag') },
  ]

  const STATS = [
    { value: t('welcome.stat1value'), label: t('welcome.stat1label'), icon: '📈' },
    { value: t('welcome.stat2value'), label: t('welcome.stat2label'), icon: '🧠' },
    { value: t('welcome.stat3value'), label: t('welcome.stat3label'), icon: '🕐' },
  ]

  const MOOD_OPTIONS = [
    { emoji: '😢', label: t('welcome.moodSad'), prompt: t('welcome.moodSadPrompt') },
    { emoji: '😰', label: t('welcome.moodAnxious'), prompt: t('welcome.moodAnxiousPrompt') },
    { emoji: '😠', label: t('welcome.moodAngry'), prompt: t('welcome.moodAngryPrompt') },
    { emoji: '😶', label: t('welcome.moodEmpty'), prompt: t('welcome.moodEmptyPrompt') },
    { emoji: '🤔', label: t('welcome.moodConfused'), prompt: t('welcome.moodConfusedPrompt') },
    { emoji: '😌', label: t('welcome.moodCalm'), prompt: t('welcome.moodCalmPrompt') },
  ]

  const TESTIMONIALS = [
    { text: t('welcome.testimonial1text'), author: t('welcome.testimonial1author'), situation: t('welcome.testimonial1situation') },
    { text: t('welcome.testimonial2text'), author: t('welcome.testimonial2author'), situation: t('welcome.testimonial2situation') },
    { text: t('welcome.testimonial3text'), author: t('welcome.testimonial3author'), situation: t('welcome.testimonial3situation') },
  ]

  return (
    <div className="flex-1 overflow-y-auto">
      {/* ── HERO ── */}
      <section className="bg-gray-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-brand-500/5 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-brand-400/5 blur-2xl" />
        </div>

        <div className="relative max-w-3xl mx-auto px-5 pt-14 pb-12 text-center">
          <div className="anim-in mb-6">
            <div className="inline-flex flex-col items-center">
              <div className="relative mb-3">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-3xl"
                  style={{
                    background: 'linear-gradient(135deg, #22c55e 0%, #86efac 50%, #a7f3d0 100%)',
                    boxShadow: '0 4px 20px rgba(34,197,94,0.25), 0 0 0 3px rgba(34,197,94,0.1)',
                  }}
                >
                  🤝
                </div>
                <div
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-[3px] border-gray-950 flex items-center justify-center"
                  style={{ background: '#22c55e', animation: 'breathe 3s ease-in-out infinite' }}
                >
                  <div className="w-2 h-2 rounded-full bg-white/80" />
                </div>
              </div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-3.5 py-1.5 text-xs font-medium text-brand-300 border border-white/10">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-400" />
                </span>
                {t('welcome.online')}
              </div>
            </div>
          </div>

          <h1 className="anim-in text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1] mb-4" style={{animationDelay:'0.05s'}}>
            {t('welcome.heroTitle1')} <span className="text-brand-400">{t('welcome.heroTitle2')}</span>.<br />
            <span className="text-gray-300 font-bold">{t('welcome.heroTitle3')}</span>
          </h1>

          <p className="anim-in text-base sm:text-lg text-gray-400 max-w-xl mx-auto mb-3 leading-relaxed" style={{animationDelay:'0.1s'}}>
            {t('welcome.heroDesc')}
          </p>

          <p className="anim-in text-sm text-gray-500 max-w-md mx-auto mb-7" style={{animationDelay:'0.12s'}}>
            {t('welcome.heroConfidential')}
          </p>

          <div className="anim-in max-w-lg mx-auto" style={{animationDelay:'0.15s'}}>
            <div className="flex items-center gap-2 bg-white/5 border border-white/15 rounded-xl p-1.5 focus-within:border-brand-500/50 focus-within:bg-white/10 transition-colors">
              <input
                type="text"
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFreeSubmit()}
                placeholder={t('welcome.heroPlaceholder')}
                className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm px-3 py-2.5 focus:outline-none"
              />
              <button
                onClick={handleFreeSubmit}
                disabled={!freeText.trim()}
                className="flex-shrink-0 h-10 px-5 bg-brand-500 hover:bg-brand-600 disabled:opacity-30 disabled:hover:bg-brand-500
                           text-white text-sm font-semibold rounded-lg transition-all active:scale-95"
              >
                {t('welcome.heroButton')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── MOOD CHECK-IN ── */}
      <section className="border-b border-gray-200 bg-gradient-to-b from-brand-50/50 to-white">
        <div className="max-w-3xl mx-auto px-5 py-8">
          <button
            onClick={() => setShowMoodCheck(!showMoodCheck)}
            className="w-full text-center group"
          >
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1 group-hover:text-brand-600 transition-colors">
              <span>💭</span>
              {t('welcome.moodTitle')}
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${showMoodCheck ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <p className="text-xs text-gray-400">{t('welcome.moodSubtitle')}</p>
          </button>

          {showMoodCheck && (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4 animate-fade-in-up">
              {MOOD_OPTIONS.map((mood) => (
                <button
                  key={mood.label}
                  onClick={() => onSelectTopic(mood.prompt)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-200
                             hover:border-brand-300 hover:bg-brand-50/50 active:scale-[0.96]
                             transition-all duration-150"
                >
                  <span className="text-2xl">{mood.emoji}</span>
                  <span className="text-[0.65rem] font-medium text-gray-600">{mood.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="border-b border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-5 py-6 grid grid-cols-3 gap-4">
          {STATS.map((s) => (
            <div key={s.value} className="text-center">
              <div className="text-lg mb-1">{s.icon}</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">{s.value}</div>
              <div className="text-[0.65rem] sm:text-xs text-gray-500 mt-0.5 leading-tight">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TOPICS ── */}
      <section className="max-w-3xl mx-auto px-5 py-10">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{t('welcome.topicsTitle')}</h2>
          <p className="text-sm text-gray-500">{t('welcome.topicsSubtitle')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 stagger">
          {TOPICS.map((tp) => (
            <button
              key={tp.title}
              onClick={() => onSelectTopic(tp.prompt)}
              className="anim-in group text-left p-4 rounded-xl border border-gray-200
                         hover:border-brand-300 hover:bg-brand-50/50
                         active:scale-[0.98] transition-all duration-150
                         focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl leading-none mt-0.5">{tp.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1.5">{tp.title}</h3>
                  <span className="inline-block text-[0.65rem] font-semibold text-brand-700 bg-brand-100 px-2 py-0.5 rounded-full">
                    {tp.tag}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-3xl mx-auto px-5 py-10">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 text-center">{t('welcome.howTitle')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { step: '1', icon: '💬', title: t('welcome.how1title'), desc: t('welcome.how1desc') },
              { step: '2', icon: '🔍', title: t('welcome.how2title'), desc: t('welcome.how2desc') },
              { step: '3', icon: '🧰', title: t('welcome.how3title'), desc: t('welcome.how3desc') },
            ].map((s) => (
              <div key={s.step} className="text-center p-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-sm border border-gray-200 text-xl mb-3">
                  {s.icon}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1.5">{s.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOOLKIT PREVIEW ── */}
      <section className="max-w-3xl mx-auto px-5 py-10">
        <div className="text-center mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{t('welcome.toolkitTitle')}</h2>
          <p className="text-sm text-gray-500">{t('welcome.toolkitSubtitle')}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { icon: '🌬️', title: t('welcome.toolkitPreview1'), color: '#0ea5e9' },
            { icon: '🌊', title: t('welcome.toolkitPreview2'), color: '#f59e0b' },
            { icon: '⚖️', title: t('welcome.toolkitPreview3'), color: '#8b5cf6' },
            { icon: '📝', title: t('welcome.toolkitPreview4'), color: '#22c55e' },
          ].map((tool) => (
            <button
              key={tool.title}
              onClick={onOpenToolkit}
              className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md
                         active:scale-[0.97] transition-all duration-150 text-center group"
            >
              <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform">{tool.icon}</span>
              <p className="text-[0.7rem] font-semibold text-gray-700 whitespace-pre-line leading-tight">{tool.title}</p>
            </button>
          ))}
        </div>

        <button
          onClick={onOpenToolkit}
          className="mx-auto flex items-center gap-2 px-5 py-2.5 rounded-xl border border-brand-200
                     text-brand-700 text-sm font-semibold hover:bg-brand-50 active:scale-[0.97] transition-all"
        >
          <span>🧰</span>
          {t('welcome.toolkitOpen')}
        </button>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-3xl mx-auto px-5 py-10">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 text-center">{t('welcome.testimonialsTitle')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {TESTIMONIALS.map((tst, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-white border border-gray-200"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
              >
                <p className="text-sm text-gray-700 leading-relaxed mb-3 italic">{tst.text}</p>
                <div>
                  <p className="text-xs font-semibold text-gray-800">{tst.author}</p>
                  <p className="text-[0.6rem] text-gray-400">{tst.situation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ELINA'S PROMISE ── */}
      <section className="max-w-3xl mx-auto px-5 py-10">
        <div
          className="rounded-2xl p-6 text-center"
          style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0fdf4 100%)',
            border: '1px solid #dcfce7',
          }}
        >
          <span className="text-3xl mb-3 inline-block">🤝</span>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{t('welcome.promiseTitle')}</h3>
          <div className="max-w-md mx-auto space-y-2 text-sm text-gray-600 leading-relaxed">
            <p><strong className="text-gray-800">{t('welcome.promise1strong')}</strong> {t('welcome.promise1text')}</p>
            <p><strong className="text-gray-800">{t('welcome.promise2strong')}</strong> {t('welcome.promise2text')}</p>
            <p><strong className="text-gray-800">{t('welcome.promise3strong')}</strong> {t('welcome.promise3text')}</p>
            <p><strong className="text-gray-800">{t('welcome.promise4strong')}</strong> {t('welcome.promise4text')}</p>
          </div>
        </div>
      </section>

      {/* ── METHODS ── */}
      <section className="bg-gray-950 text-white">
        <div className="max-w-3xl mx-auto px-5 py-10">
          <h2 className="text-lg sm:text-xl font-bold mb-2 text-center">{t('welcome.methodsTitle')}</h2>
          <p className="text-xs text-gray-500 text-center mb-6">{t('welcome.methodsSubtitle')}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { name: 'Gottman', desc: t('welcome.methodGottman'), icon: '💑' },
              { name: 'CBT', desc: t('welcome.methodCBT'), icon: '🧠' },
              { name: 'EFT', desc: t('welcome.methodEFT'), icon: '❤️‍🩹' },
              { name: 'MI', desc: t('welcome.methodMI'), icon: '🧭' },
            ].map((m) => (
              <div key={m.name} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-xl mb-1.5">{m.icon}</div>
                <div className="text-brand-400 font-bold text-lg mb-1">{m.name}</div>
                <div className="text-[0.65rem] text-gray-400 leading-snug">{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <section className="border-t border-gray-200">
        <div className="max-w-3xl mx-auto px-5 py-6 text-center">
          <p className="text-xs text-gray-400 mb-2">{t('welcome.footerDisclaimer')}</p>
          <div className="flex flex-wrap justify-center gap-4 text-xs">
            <span className="font-semibold text-gray-700">{t('welcome.footerCrisis')}</span>
            <span className="font-semibold text-gray-700">{t('welcome.footerNollalinja')}</span>
            <span className="font-semibold text-gray-700">{t('welcome.footerEmergency')}</span>
          </div>
          <p className="text-[0.6rem] text-gray-300 mt-3">
            {t('welcome.footerCopyright', { year: new Date().getFullYear() })}
          </p>
        </div>
      </section>
    </div>
  )
}
