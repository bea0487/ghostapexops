import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ghost Rider: Apex Operations',
  description: 'DOT compliance made simple for owner-operators and small fleets',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
