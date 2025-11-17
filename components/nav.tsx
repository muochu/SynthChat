import Link from 'next/link'
import Container from './container'

export default function Nav() {
  return (
    <nav className="border-b border-gray-200">
      <Container>
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-black">
            SynthChat
          </Link>
          <div className="flex gap-6">
            <Link href="/" className="text-gray-600 hover:text-black transition-colors">
              Home
            </Link>
            <Link href="/stories" className="text-gray-600 hover:text-black transition-colors">
              Stories
            </Link>
          </div>
        </div>
      </Container>
    </nav>
  )
}

