'use client'

import { useRouter } from 'next/navigation'
import NavBar from '@/components/NavBar'
import HomePage from '@/components/HomePage'

export default function Home() {
  const router = useRouter()

  return (
    <div className="h-full flex flex-col">
      <NavBar
        currentView="home"
        onNavigate={(v) => {
          if (v === 'demo') router.push('/demo')
        }}
      />
      <div className="flex-1 overflow-auto">
        <HomePage onOpenDemo={() => router.push('/demo')} />
      </div>
    </div>
  )
}
