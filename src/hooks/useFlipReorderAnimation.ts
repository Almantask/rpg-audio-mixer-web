import { useLayoutEffect, useRef } from 'react'

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function clearFlipStyles(el: HTMLElement) {
  el.style.transition = ''
  el.style.transform = ''
}

/**
 * FLIP-animates `[data-flip-id]` children when `deps` change.
 * Forces a reflow between invert and play so mid-drag reorders animate
 * instead of snapping only after drop.
 */
export function useFlipReorderAnimation(
  containerRef: React.RefObject<HTMLElement | null>,
  deps: readonly unknown[],
  options?: { durationMs?: number; skipIds?: ReadonlySet<string> | string | null },
) {
  const prevRectsRef = useRef<Map<string, DOMRect>>(new Map())
  const durationMs = options?.durationMs ?? 180
  const skipIds =
    options?.skipIds == null
      ? null
      : typeof options.skipIds === 'string'
        ? new Set([options.skipIds])
        : options.skipIds

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
        if (!id || skipIds?.has(id)) {
          if (id && skipIds?.has(id)) {
            clearFlipStyles(el)
          }
          continue
        }
        const prev = prevRects.get(id)
        const next = nextRects.get(id)
        if (!prev || !next) continue

        const dx = prev.left - next.left
        const dy = prev.top - next.top
        if (dx === 0 && dy === 0) continue

        el.style.transition = 'none'
        el.style.transform = `translate(${dx}px, ${dy}px)`
        // Force invert to paint before the play frame; without this, rapid
        // mid-drag reorders often batch into a snap (visible only after drop).
        void el.offsetWidth

        requestAnimationFrame(() => {
          el.style.transition = `transform ${durationMs}ms var(--aa-ease-out)`
          el.style.transform = ''
          const cleanup = () => {
            clearFlipStyles(el)
            el.removeEventListener('transitionend', cleanup)
          }
          el.addEventListener('transitionend', cleanup)
        })
      }
    }

    prevRectsRef.current = nextRects
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
