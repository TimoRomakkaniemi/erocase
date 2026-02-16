import { useState, useEffect } from 'react'
import PasswordGate from './components/PasswordGate'
import HomePage from './components/HomePage'
import SidePanel from './components/SidePanel'
import ChatWindow from './components/ChatWindow'

type View = 'auth' | 'home' | 'demo'

function App() {
  const [view, setView] = useState<View>(() => {
    if (sessionStorage.getItem('erocase_auth') === '1') return 'home'
    return 'auth'
  })

  useEffect(() => {
    const handler = (e: PopStateEvent) => {
      const s = e.state as { view?: View } | null
      if (s?.view) setView(s.view)
    }
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [])

  const navigate = (v: View) => {
    setView(v)
    window.history.pushState({ view: v }, '', '')
  }

  if (view === 'auth') {
    return <PasswordGate onAuthenticated={() => navigate('home')} />
  }

  if (view === 'home') {
    return <HomePage onOpenDemo={() => navigate('demo')} />
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Back to home bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100 shrink-0">
        <button
          onClick={() => navigate('home')}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          EroCase Home
        </button>
        <span className="text-gray-300 text-xs">|</span>
        <span className="text-xs text-gray-400">Demo</span>
      </div>
      <div className="flex flex-1 min-h-0">
        <SidePanel />
        <ChatWindow />
      </div>
    </div>
  )
}

export default App
