import { ReactNode } from 'react'
import Nav from './nav'
import Container from './container'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1">
        <Container>
          {children}
        </Container>
      </main>
      <footer className="border-t border-gray-200 py-8">
        <Container>
          <p className="text-sm text-gray-500 text-center">
            SynthChat - AI-driven synthetic chat analysis
          </p>
        </Container>
      </footer>
    </div>
  )
}

