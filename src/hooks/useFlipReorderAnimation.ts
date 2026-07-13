import { useLayoutEffect, useRef } from 'react'

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export function useFlipReorderAnimation(
  containerRef: React.RefObject<HTMLElement | null>,
  deps: readonly unknown[],
  options?: { durationMs?: number },
) {
  const prevRectsRef = useRef<Map<string, DOMRect>>(new Map())
  const durationMs = options?.durationMs ?? 180

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container || prefersReducedMotion()) {
      prevRectsRef.current = new Map()
      return
    }

    const elements = Array.from(container.querySelectorAll<HTMLElement>('[data-flip-id]'))
    const nextRects = new Map<string, DOMRect>()
    for (const el of elements) {
      const id = el.dataset.flipId
      if (!id) continue
      nextRects.set(id, el.getBoundingClientRect())
    }

    const prevRects = prevRectsRef.current
    if (prevRects.size > 0) {
      for (const el of elements) {
        const id = el.dataset.flipId
        if (!id) continue
        const prev = prevRects.get(id)
        const next = nextRects.get(id)
        if (!prev || !next) continue

        const dx = prev.left - next.left
        const dy = prev.top - next.top
        if (dx === 0 && dy === 0) continue

        el.style.transition = 'transform 0ms'
        el.style.transform = `translate(${dx}px, ${dy}px)`

        requestAnimationFrame(() => {
          el.style.transition = `transform ${durationMs}ms var(--aa-ease-out)`
          el.style.transform = ''
        })
      }
    }

    prevRectsRef.current = nextRects
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

