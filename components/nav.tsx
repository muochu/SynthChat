'use client'

import Link from 'next/link'
import Container from './container'
import { useEffect, useState } from 'react'

export default function Nav() {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set())

  useEffect(() => {
    const checkSections = () => {
      const sections = new Set<string>()
      if (document.getElementById('insights')) sections.add('insights')
      if (document.getElementById('chats')) sections.add('chats')
      if (document.getElementById('email')) sections.add('email')
      setVisibleSections(sections)
    }

    checkSections()
    const interval = setInterval(checkSections, 500)
    return () => clearInterval(interval)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const navHeight = 64
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - navHeight

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    }
  }

  return (
    <nav className="border-b border-gray-200 sticky top-0 bg-white z-10">
      <Container>
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-black">
            SynthChat
          </Link>
          {visibleSections.size > 0 && (
            <div className="flex gap-6">
              {visibleSections.has('insights') && (
                <button
                  onClick={() => scrollToSection('insights')}
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  Insights
                </button>
              )}
              {visibleSections.has('chats') && (
                <button
                  onClick={() => scrollToSection('chats')}
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  Chats
                </button>
              )}
              {visibleSections.has('email') && (
                <button
                  onClick={() => scrollToSection('email')}
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  Email
                </button>
              )}
            </div>
          )}
        </div>
      </Container>
    </nav>
  )
}

