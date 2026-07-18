import { useRef, type ReactNode } from 'react'

interface SwipeToDeleteProps {
  onSwipeDelete: () => void
  children: ReactNode
  className?: string
}

export function SwipeToDelete({ onSwipeDelete, children, className }: SwipeToDeleteProps) {
  const startX = useRef<number | null>(null)

  return (
    <div
      className={className}
      data-swipe-delete
      onTouchStart={(event) => {
        startX.current = event.touches[0]?.clientX ?? null
      }}
      onTouchEnd={(event) => {
        if (startX.current === null) {
          return
        }
        const endX = event.changedTouches[0]?.clientX ?? startX.current
        if (endX - startX.current > 80) {
          onSwipeDelete()
        }
        startX.current = null
      }}
    >
      {children}
    </div>
  )
}
