'use client'

import AppShell from '@/components/AppShell'
import SidePanel from '@/components/SidePanel'
import ChatWindow from '@/components/ChatWindow'

export default function DemoPage() {
  return (
    <AppShell>
      <div className="flex flex-1 min-h-0 h-full">
        <SidePanel />
        <ChatWindow />
      </div>
    </AppShell>
  )
}
