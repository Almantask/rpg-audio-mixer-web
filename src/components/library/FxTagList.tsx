import { useLayoutEffect, useRef, useState } from 'react'
import { Badge } from '@/components/ui/badge'

interface FxTagListProps {
  tags: string[]
}

/** Single-row tag chips; shows "+N more" when tags overflow the available width. */
export function FxTagList({ tags }: FxTagListProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const [visibleCount, setVisibleCount] = useState(tags.length)

  useLayoutEffect(() => {
    const container = containerRef.current
    const measure = measureRef.current
    if (!container || !measure || tags.length === 0) {
      setVisibleCount(tags.length)
      return
    }

    const computeVisible = () => {
      const gap = 4
      const moreWidth = 72
      const available = container.clientWidth
      if (available <= 0) {
        setVisibleCount(tags.length)
        return
      }

      const chipWidths = Array.from(measure.children).map(
        (child) => (child as HTMLElement).offsetWidth,
      )

      let used = 0
      for (let index = 0; index < chipWidths.length; index += 1) {
        const next = used + chipWidths[index]! + (index > 0 ? gap : 0)
        if (next <= available) {
          used = next
          continue
        }

        // Overflow: fit as many as possible while leaving room for "+N more"
        used = 0
        let fit = 0
        for (let i = 0; i < index; i += 1) {
          const candidate = used + chipWidths[i]! + (i > 0 ? gap : 0)
          if (candidate + gap + moreWidth > available) {
            break
          }
          used = candidate
          fit = i + 1
        }
        setVisibleCount(Math.max(1, fit))
        return
      }

      setVisibleCount(tags.length)
    }

    computeVisible()
    const observer = new ResizeObserver(computeVisible)
    observer.observe(container)
    return () => observer.disconnect()
  }, [tags])

  if (tags.length === 0) {
    return null
  }

  const visible = tags.slice(0, visibleCount)
  const hidden = tags.length - visible.length

  return (
    <div className="relative mt-1.5 min-w-0">
      <div
        ref={measureRef}
        aria-hidden="true"
        className="pointer-events-none invisible absolute left-0 top-0 flex gap-1 whitespace-nowrap"
      >
        {tags.map((tag) => (
          <Badge key={`measure-${tag}`}>
            {tag.toUpperCase()}
          </Badge>
        ))}
      </div>
      <div ref={containerRef} className="flex min-w-0 flex-nowrap items-center gap-1 overflow-hidden">
        {visible.map((tag) => (
          <Badge key={tag} data-fx-tag={tag} className="shrink-0">
            {tag.toUpperCase()}
          </Badge>
        ))}
        {hidden > 0 ? (
          <Badge
            data-fx-tag-more={hidden}
            className="shrink-0 border-parchment/25 text-muted"
            title={tags.slice(visibleCount).join(', ')}
          >
            +{hidden} more
          </Badge>
        ) : null}
      </div>
    </div>
  )
}
