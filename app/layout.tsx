import type { Metadata } from 'next'
import './globals.css'
import Layout from '@/components/layout'

export const metadata: Metadata = {
  title: 'SynthChat',
  description: 'Synthetic chat generation and analysis for in-house legal teams',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  )
}

