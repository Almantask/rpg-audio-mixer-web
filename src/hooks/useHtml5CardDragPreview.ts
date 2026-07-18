import { useCallback, useEffect, useRef, type DragEvent } from 'react'

type DragOffset = { x: number; y: number }

function hideNativeDragGhost(dataTransfer: DataTransfer) {
  const blank = document.createElement('canvas')
  blank.width = 1
  blank.height = 1
  blank.style.position = 'fixed'
  blank.style.top = '-1000px'
  blank.style.left = '-1000px'
  document.body.appendChild(blank)
  dataTransfer.setDragImage(blank, 0, 0)
  requestAnimationFrame(() => {
    blank.remove()
  })
}

/**
 * High-fidelity HTML5 drag preview: hides the browser ghost and shows a
 * fixed clone of the card that follows the pointer during drag.
 */
export function useHtml5CardDragPreview() {
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const offsetRef = useRef<DragOffset>({ x: 0, y: 0 })
  const activeRef = useRef(false)

  useEffect(() => {
    const overlay = document.createElement('div')
    overlay.setAttribute('data-drag-card-preview', '')
    overlay.setAttribute('data-testid', 'drag-card-preview')
    overlay.setAttribute('aria-hidden', 'true')
    overlay.className =
      'pointer-events-none fixed top-0 left-0 z-[200] will-change-transform'
    overlay.style.display = 'none'
    document.body.appendChild(overlay)
    overlayRef.current = overlay

    return () => {
      overlay.replaceChildren()
      overlay.remove()
      overlayRef.current = null
      activeRef.current = false
    }
  }, [])

  const positionOverlay = useCallback((clientX: number, clientY: number) => {
    const overlay = overlayRef.current
    if (!overlay || !activeRef.current) {
      return
    }
    const { x, y } = offsetRef.current
    overlay.style.transform = `translate3d(${clientX - x}px, ${clientY - y}px, 0)`
  }, [])

  const beginCardDragPreview = useCallback(
    (event: DragEvent, card: HTMLElement) => {
      const overlay = overlayRef.current
      if (!overlay) {
        return
      }

      const rect = card.getBoundingClientRect()
      const startX = Number.isFinite(event.clientX) ? event.clientX : rect.left
      const startY = Number.isFinite(event.clientY) ? event.clientY : rect.top
      offsetRef.current = {
        x: Math.max(0, startX - rect.left),
        y: Math.max(0, startY - rect.top),
      }

      hideNativeDragGhost(event.dataTransfer)

      const clone = card.cloneNode(true) as HTMLElement
      clone.removeAttribute('data-flip-id')
      clone.style.width = `${rect.width}px`
      clone.style.height = `${rect.height}px`
      clone.style.margin = '0'
      clone.style.pointerEvents = 'none'
      clone.style.opacity = '1'
      clone.style.boxShadow = '0 16px 40px rgba(0, 0, 0, 0.45)'
      clone.setAttribute('aria-hidden', 'true')

      overlay.replaceChildren(clone)
      overlay.style.display = 'block'
      overlay.style.width = `${rect.width}px`
      overlay.style.height = `${rect.height}px`
      activeRef.current = true

      positionOverlay(startX, startY)
    },
    [positionOverlay],
  )

  const moveCardDragPreview = useCallback(
    (event: DragEvent) => {
      const { clientX, clientY } = event
      // Some browsers emit a final drag event at 0,0 — ignore it.
      if (!Number.isFinite(clientX) || !Number.isFinite(clientY)) {
        return
      }
      if (clientX === 0 && clientY === 0) {
        return
      }
      positionOverlay(clientX, clientY)
    },
    [positionOverlay],
  )

  const endCardDragPreview = useCallback(() => {
    const overlay = overlayRef.current
    if (overlay) {
      overlay.replaceChildren()
      overlay.style.display = 'none'
      overlay.style.width = ''
      overlay.style.height = ''
      overlay.style.transform = ''
    }
    activeRef.current = false
  }, [])

  return {
    beginCardDragPreview,
    moveCardDragPreview,
    endCardDragPreview,
  }
}
