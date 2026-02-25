'use client'

import { useRouter } from 'next/navigation'
import NavBar from '@/components/NavBar'
import SidePanel from '@/components/SidePanel'
import ChatWindow from '@/components/ChatWindow'

export default function DemoPage() {
  const router = useRouter()

  return (
    <div className="h-full flex flex-col">
      <NavBar
        currentView="demo"
        onNavigate={(v) => {
          if (v === 'home') router.push('/')
        }}
      />
      <div className="flex-1 flex min-h-0 pt-14">
        <SidePanel />
        <ChatWindow />
      </div>
    </div>
  )
}
