import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  id?: string
}

export default function Card({
  children,
  className = '',
  hover = false,
  id,
}: CardProps) {
  const hoverClass = hover ? 'hover:shadow-lg transition-shadow' : ''
  return (
    <div
      id={id}
      className={`bg-white rounded-lg border border-gray-200 p-6 ${hoverClass} ${className}`}
    >
      {children}
    </div>
  )
}
