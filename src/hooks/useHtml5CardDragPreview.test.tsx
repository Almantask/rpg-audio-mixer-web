import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useHtml5CardDragPreview } from '@/hooks/useHtml5CardDragPreview'

function Probe() {
  const { beginCardDragPreview, moveCardDragPreview, endCardDragPreview } =
    useHtml5CardDragPreview()

  return (
    <div data-testid="source-card" data-flip-id="card-1" style={{ width: 240, height: 120 }}>
      <div
        data-drag-handle
        draggable
        onDragStart={(event) => {
          const card = event.currentTarget.closest('[data-flip-id]')
          if (card instanceof HTMLElement) {
            beginCardDragPreview(event, card)
          }
        }}
        onDrag={moveCardDragPreview}
        onDragEnd={endCardDragPreview}
      >
        Handle
      </div>
      Card body
    </div>
  )
}

function mockDataTransfer() {
  return {
    effectAllowed: 'none',
    dropEffect: 'none',
    setData: vi.fn(),
    getData: vi.fn(() => ''),
    setDragImage: vi.fn(),
  }
}

describe('useHtml5CardDragPreview', () => {
  it('shows a floating card preview on drag start that tracks the pointer', () => {
    render(<Probe />)

    const handle = screen.getByText('Handle')
    const dataTransfer = mockDataTransfer()

    const dragStart = new Event('dragstart', { bubbles: true, cancelable: true })
    Object.defineProperty(dragStart, 'clientX', { value: 40 })
    Object.defineProperty(dragStart, 'clientY', { value: 30 })
    Object.defineProperty(dragStart, 'dataTransfer', { value: dataTransfer })
    fireEvent(handle, dragStart)

    expect(dataTransfer.setDragImage).toHaveBeenCalled()
    const preview = screen.getByTestId('drag-card-preview')
    expect(preview).toBeVisible()
    expect(preview).toHaveAttribute('aria-hidden', 'true')
    expect(preview.textContent).toContain('Card body')
    // jsdom rects are 0,0 so the grab offset equals the dragStart client coords (40, 30).
    expect(preview.style.transform).toBe('translate3d(0px, 0px, 0)')

    const dragMove = new Event('drag', { bubbles: true, cancelable: true })
    Object.defineProperty(dragMove, 'clientX', { value: 140 })
    Object.defineProperty(dragMove, 'clientY', { value: 230 })
    fireEvent(handle, dragMove)
    expect(preview.style.transform).toBe('translate3d(100px, 200px, 0)')
  })

  it('removes the floating preview on drag end', () => {
    render(<Probe />)

    const handle = screen.getByText('Handle')
    const dataTransfer = mockDataTransfer()

    fireEvent.dragStart(handle, { dataTransfer, clientX: 40, clientY: 30 })
    expect(screen.getByTestId('drag-card-preview')).toBeVisible()

    fireEvent.dragEnd(handle, { dataTransfer })
    expect(screen.getByTestId('drag-card-preview')).not.toBeVisible()
    expect(screen.getByTestId('drag-card-preview').textContent).toBe('')
  })
})
