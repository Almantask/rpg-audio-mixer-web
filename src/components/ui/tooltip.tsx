import * as React from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

type TooltipAlign = 'start' | 'center' | 'end'

interface TooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  align?: TooltipAlign
  className?: string
}

function alignTransform(align: TooltipAlign): string {
  if (align === 'start') {
    return 'translateX(0)'
  }
  if (align === 'end') {
    return 'translateX(-100%)'
  }
  return 'translateX(-50%)'
}

function coordsForTrigger(trigger: HTMLElement, align: TooltipAlign) {
  const rect = trigger.getBoundingClientRect()
  const left =
    align === 'start' ? rect.left : align === 'end' ? rect.right : rect.left + rect.width / 2
  return { top: rect.top, left }
}

export function Tooltip({ content, children, align = 'center', className }: TooltipProps) {
  const triggerRef = React.useRef<HTMLDivElement>(null)
  const [open, setOpen] = React.useState(false)
  const [coords, setCoords] = React.useState({ top: 0, left: 0 })

  const updatePosition = () => {
    const trigger = triggerRef.current
    if (!trigger) {
      return
    }
    setCoords(coordsForTrigger(trigger, align))
  }

  const show = () => {
    updatePosition()
    setOpen(true)
  }

  const hide = () => {
    setOpen(false)
  }

  React.useEffect(() => {
    if (!open) {
      return
    }
    const onReposition = () => {
      const trigger = triggerRef.current
      if (!trigger) {
        return
      }
      setCoords(coordsForTrigger(trigger, align))
    }
    window.addEventListener('scroll', onReposition, true)
    window.addEventListener('resize', onReposition)
    return () => {
      window.removeEventListener('scroll', onReposition, true)
      window.removeEventListener('resize', onReposition)
    }
  }, [align, open])

  return (
    <div
      ref={triggerRef}
      className={cn('relative inline-flex', className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocusCapture={show}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          hide()
        }
      }}
    >
      {children}
      {open
        ? createPortal(
            <span
              role="tooltip"
              className={cn(
                'pointer-events-none fixed z-[80] w-max max-w-[13.5rem] rounded-md border border-parchment/15 bg-ink-overlay px-2.5 py-2 text-center text-[11px] leading-snug text-parchment shadow-lg',
              )}
              style={{
                top: coords.top,
                left: coords.left,
                transform: `translateY(calc(-100% - 0.5rem)) ${alignTransform(align)}`,
              }}
            >
              {content}
            </span>,
            document.body,
          )
        : null}
    </div>
  )
}
