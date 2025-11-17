import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SynthChat',
  description: 'Engineering stories and case studies',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

