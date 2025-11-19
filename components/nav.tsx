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
      setVisibleSections(sections)
    }

    checkSections()
    const observer = new IntersectionObserver(
      () => checkSections(),
      { rootMargin: '-20% 0px -70% 0px' }
    )

    const insightsEl = document.getElementById('insights')
    const chatsEl = document.getElementById('chats')
    if (insightsEl) observer.observe(insightsEl)
    if (chatsEl) observer.observe(chatsEl)

    return () => {
      if (insightsEl) observer.unobserve(insightsEl)
      if (chatsEl) observer.unobserve(chatsEl)
    }
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
            </div>
          )}
        </div>
      </Container>
    </nav>
  )
}

