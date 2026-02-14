import { useEffect } from 'react'
import { useChatStore, type Conversation } from '../stores/chatStore'
import { useProfileStore } from '../stores/profileStore'

function timeAgo(dateStr: string): string {
  const d = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(d / 60000)
  if (m < 1) return 'Nyt'
  if (m < 60) return `${m} min`
  const h = Math.floor(d / 3600000)
  if (h < 24) return `${h} h`
  const days = Math.floor(d / 86400000)
  if (days < 7) return `${days} pv`
  return new Date(dateStr).toLocaleDateString('fi-FI')
}

export default function SidePanel() {
  const {
    conversations,
    currentConversationId,
    sidebarOpen,
    setSidebarOpen,
    loadConversation,
    loadConversations,
    startNewConversation,
  } = useChatStore()

  const resetProfile = useProfileStore((s) => s.resetProfile)

  useEffect(() => { loadConversations() }, [loadConversations])

  const handleNewConversation = () => {
    startNewConversation()
    resetProfile()
    setSidebarOpen(false)
  }

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside
        className={`fixed top-0 left-0 h-full w-[270px] z-50 
                     flex flex-col transform transition-transform duration-200 ease-out
                     ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                     lg:relative lg:translate-x-0 lg:z-auto
                     ${sidebarOpen ? '' : 'lg:hidden'}`}
        style={{
          background: 'linear-gradient(180deg, #faf8f6 0%, #f5f0eb 100%)',
          borderRight: '1px solid rgba(214,203,191,0.4)',
        }}
      >
        {/* Top */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #22c55e 0%, #86efac 100%)' }}
            >
              <span className="text-xs">🤝</span>
            </div>
            <div>
              <span className="text-xs font-bold text-gray-800 tracking-wide">EroCase</span>
              <p className="text-[0.55rem] text-warm-400 leading-none mt-0.5">Tukea eron kynnyksellä</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-lg hover:bg-warm-200/60 text-warm-400"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* New chat */}
        <div className="px-3 mb-3">
          <button
            onClick={handleNewConversation}
            className="w-full h-10 flex items-center justify-center gap-2 rounded-xl
                       text-sm font-medium text-white
                       active:scale-[0.98] transition-all duration-150"
            style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              boxShadow: '0 2px 8px rgba(22,163,74,0.2)',
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Uusi keskustelu Elinan kanssa
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-2 py-1">
          {conversations.length === 0 ? (
            <div className="text-center mt-12 px-4">
              <div className="text-2xl mb-2 opacity-30">💬</div>
              <p className="text-xs text-warm-400 mb-1">Ei vielä keskusteluja</p>
              <p className="text-[0.6rem] text-warm-300 leading-relaxed">
                Aloita keskustelu Elinan kanssa &mdash; hän on täällä sinua varten.
              </p>
            </div>
          ) : (
            <>
              <p className="text-[0.55rem] font-bold text-warm-400 uppercase tracking-wider px-3 mb-2">
                Keskusteluhistoria
              </p>
              {conversations.map((c: Conversation) => {
                const active = c.id === currentConversationId
                return (
                  <button
                    key={c.id}
                    onClick={() => loadConversation(c.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl mb-1 text-sm transition-all duration-150
                      ${active
                        ? 'font-medium text-gray-900'
                        : 'text-gray-600 hover:text-gray-800'
                      }`}
                    style={active ? {
                      background: 'linear-gradient(145deg, #ffffff 0%, #faf8f6 100%)',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
                      border: '1px solid rgba(214,203,191,0.3)',
                    } : {}}
                  >
                    <div className="flex items-center gap-2">
                      {c.mood && (
                        <span className="text-xs flex-shrink-0">
                          {c.mood === 'positive' ? '🌱' : c.mood === 'negative' ? '🌧️' : '💭'}
                        </span>
                      )}
                      <p className="truncate leading-snug flex-1">{c.title || 'Uusi keskustelu'}</p>
                    </div>
                    <p className="text-[0.6rem] text-warm-400 mt-0.5">{timeAgo(c.updated_at)}</p>
                  </button>
                )
              })}
            </>
          )}
        </div>

        {/* Bottom info */}
        <div className="p-3 border-t border-warm-200/50">
          <div className="flex items-center gap-2 px-1">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: '#22c55e', animation: 'breathe 3s ease-in-out infinite' }}
            />
            <p className="text-[0.6rem] text-warm-400">Elina on aina paikalla</p>
          </div>
        </div>
      </aside>
    </>
  )
}
