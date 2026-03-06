import type { Metadata } from 'next'
import './globals.css'
import { SOSFlow } from '@/components/sos/SOSFlow'
import { TriageFlowWrapper } from '@/components/safety/TriageFlowWrapper'

export const metadata: Metadata = {
  title: 'Solvia – AI-Powered Life Support',
  description:
    'Empathetic AI-powered support for life\'s challenges: relationships, mental health, loneliness, substance use, parenting, finances and grief',
  icons: { icon: '/solvia-logo.png' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches);if(d)document.documentElement.classList.add('dark')}catch(e){}})()` }} />
      </head>
      <body className="h-full">
        {children}
        <SOSFlow />
        <TriageFlowWrapper />
      </body>
    </html>
  )
}
