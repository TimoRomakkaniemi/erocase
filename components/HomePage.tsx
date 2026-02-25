'use client'

import { useT } from '@/lib/i18n'
import SolviaLogo from '@/components/SolviaLogo'

interface Props {
  onOpenDemo: () => void
}

export default function HomePage({ onOpenDemo }: Props) {
  const t = useT()

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const ABOUT_CARDS = [
    { icon: '💬', title: t('home.aboutCard1title'), desc: t('home.aboutCard1desc'), color: '#22c55e' },
    { icon: '🔬', title: t('home.aboutCard2title'), desc: t('home.aboutCard2desc'), color: '#3b82f6' },
    { icon: '📊', title: t('home.aboutCard3title'), desc: t('home.aboutCard3desc'), color: '#a855f7' },
    { icon: '🧰', title: t('home.aboutCard4title'), desc: t('home.aboutCard4desc'), color: '#f59e0b' },
  ]

  const FEATURES = [
    { icon: '💬', title: t('home.feat1title'), desc: t('home.feat1desc') },
    { icon: '📊', title: t('home.feat2title'), desc: t('home.feat2desc') },
    { icon: '🧘', title: t('home.feat3title'), desc: t('home.feat3desc') },
    { icon: '🎯', title: t('home.feat4title'), desc: t('home.feat4desc') },
    { icon: '🌍', title: t('home.feat5title'), desc: t('home.feat5desc') },
    { icon: '⏰', title: t('home.feat6title'), desc: t('home.feat6desc') },
  ]

  return (
    <>
      {/* ── Hero Section ── */}
      <section id="hero" className="relative min-h-screen flex items-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0f172a 100%)',
        }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-1/4 w-[200px] h-[200px] sm:w-[350px] sm:h-[350px] lg:w-[500px] lg:h-[500px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 60%)' }} />
          <div className="absolute bottom-20 left-1/4 w-[150px] h-[150px] sm:w-[250px] sm:h-[250px] lg:w-[400px] lg:h-[400px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(134,239,172,0.08) 0%, transparent 60%)' }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 lg:py-32 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 anim-in"
              style={{
                background: 'rgba(34,197,94,0.15)',
                border: '1px solid rgba(34,197,94,0.25)',
              }}
            >
              <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
              <span className="text-xs font-medium text-brand-400">{t('home.heroTag')}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 anim-in"
              style={{ animationDelay: '0.1s' }}
            >
              {t('home.heroTitle')}<br />
              <span className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(135deg, #22c55e 0%, #86efac 100%)' }}
              >
                {t('home.heroTitleHighlight')}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-400 leading-relaxed mb-8 max-w-xl anim-in"
              style={{ animationDelay: '0.2s' }}
            >
              {t('home.heroDesc')}
            </p>

            <div className="flex flex-wrap gap-3 mb-8 anim-in" style={{ animationDelay: '0.3s' }}>
              <button onClick={onOpenDemo}
                className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  boxShadow: '0 4px 16px rgba(34,197,94,0.3)',
                }}
              >
                {t('home.heroCta')}
              </button>
              <button onClick={() => scrollTo('about')}
                className="px-6 py-3 rounded-xl text-sm font-semibold text-white/80 transition-all hover:text-white hover:bg-white/5"
                style={{ border: '1px solid rgba(255,255,255,0.15)' }}
              >
                {t('home.heroSecondary')}
              </button>
            </div>

            <p className="text-xs text-gray-500 anim-in" style={{ animationDelay: '0.4s' }}>
              {t('home.heroNote')}
            </p>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:block">
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5">
            <div className="w-1 h-2 rounded-full bg-white/40 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ── About Section ── */}
      <section id="about" className="py-20 sm:py-28 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t('home.aboutTitle')}</h2>
            <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">{t('home.aboutDesc')}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ABOUT_CARDS.map((card, i) => (
              <div key={i}
                className="bg-white rounded-2xl p-6 transition-all hover:shadow-lg hover:-translate-y-1 group"
                style={{ border: '1px solid #f3f4f6' }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-2xl transition-transform group-hover:scale-110"
                  style={{ background: `${card.color}15` }}
                >
                  {card.icon}
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">{card.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t('home.featuresTitle')}</h2>
            <p className="text-gray-500 max-w-xl mx-auto">{t('home.featuresDesc')}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feat, i) => (
              <div key={i}
                className="relative overflow-hidden rounded-2xl p-6 transition-all hover:shadow-lg group"
                style={{
                  background: 'linear-gradient(135deg, #faf8f6 0%, #ffffff 100%)',
                  border: '1px solid #f3f4f6',
                }}
              >
                <div className="text-3xl mb-4 transition-transform group-hover:scale-110">{feat.icon}</div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{feat.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feat.desc}</p>
                <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-20 sm:py-28"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center justify-center mb-6">
            <SolviaLogo size={64} className="rounded-2xl" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t('home.ctaTitle')}</h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">{t('home.ctaDesc')}</p>
          <button onClick={onOpenDemo}
              className="px-6 py-3 sm:px-8 sm:py-4 rounded-xl text-sm sm:text-base font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              boxShadow: '0 4px 24px rgba(34,197,94,0.35)',
            }}
          >
            {t('home.ctaButton')}
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 bg-gray-900 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <SolviaLogo size={24} />
            <span className="text-sm font-semibold text-white">Solvia</span>
          </div>
          <p className="text-xs text-gray-500">
            {t('home.footerMadeWith')} ❤️ &nbsp;|&nbsp; {t('home.footerRights', { year: new Date().getFullYear() })}
          </p>
        </div>
      </footer>
    </>
  )
}
