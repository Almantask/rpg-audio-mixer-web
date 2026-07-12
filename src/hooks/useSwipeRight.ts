import { useRef, useState, type PointerEvent } from 'react'

const SWIPE_THRESHOLD = 80

export function useSwipeRight(onSwipe: () => void) {
  const startX = useRef<number | null>(null)
  const [swiping, setSwiping] = useState(false)

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    startX.current = event.clientX
    setSwiping(true)
  }

  const onPointerUp = (event: PointerEvent<HTMLElement>) => {
    if (startX.current === null) return
    const delta = event.clientX - startX.current
    if (delta >= SWIPE_THRESHOLD) {
      onSwipe()
    }
    startX.current = null
    setSwiping(false)
  }

  const onPointerCancel = () => {
    startX.current = null
    setSwiping(false)
  }

  return {
    swipeHandlers: {
      onPointerDown,
      onPointerUp,
      onPointerCancel,
      'data-swiping': swiping ? 'true' : 'false',
    },
  }
}
