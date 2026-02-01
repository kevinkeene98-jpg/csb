import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CorporateSlopBowl.com',
  description: 'Which corporate slop bowl are you? Take the personality test to find out.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  )
}
