import type { Metadata } from 'next'
import './globals.css'
import Layout from '@/components/layout'

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
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  )
}

