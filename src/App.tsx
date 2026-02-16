import { useState, useEffect } from 'react'
import PasswordGate from './components/PasswordGate'
import NavBar from './components/NavBar'
import HomePage from './components/HomePage'
import SidePanel from './components/SidePanel'
import ChatWindow from './components/ChatWindow'

type View = 'auth' | 'home' | 'demo'

function App() {
  const [view, setView] = useState<View>(() => {
    if (sessionStorage.getItem('solvia_auth') === '1') return 'home'
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

  /* Both home and demo share the NavBar */
  return (
    <div className="h-full flex flex-col">
      <NavBar
        currentView={view as 'home' | 'demo'}
        onNavigate={(v) => navigate(v)}
      />

      {view === 'home' ? (
        <div className="flex-1 overflow-auto">
          <HomePage onOpenDemo={() => navigate('demo')} />
        </div>
      ) : (
        <div className="flex-1 flex min-h-0 pt-14">
          <SidePanel />
          <ChatWindow />
        </div>
      )}
    </div>
  )
}

export default App
