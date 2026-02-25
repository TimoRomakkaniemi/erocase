import type { Metadata } from 'next'
import './globals.css'

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
      </head>
      <body className="h-full">{children}</body>
    </html>
  )
}
