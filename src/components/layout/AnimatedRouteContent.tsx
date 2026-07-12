import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface AnimatedRouteContentProps {
  children: React.ReactNode
}

export function AnimatedRouteContent({ children }: AnimatedRouteContentProps) {
  const location = useLocation()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = containerRef.current
    if (!node) return
    node.classList.remove('screen-transition-enter')
    void node.offsetWidth
    node.classList.add('screen-transition-enter')
  }, [location.pathname])

  return (
    <div
      className={cn('screen-transition-content')}
      data-route-path={location.pathname}
      data-testid="route-content"
      key={location.pathname}
      ref={containerRef}
    >
      {children}
    </div>
  )
}
